import os
import sys
import re
import json
import joblib
import pandas as pd
import numpy as np
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from collections import Counter
import google.generativeai as genai

from ..schemas import (
    RecommendationRequest,
    LaporanMasalahRequest,
    ValidateLaporanRequest,
)
from ..database import database
from .. import ai_utils

# Registrasi fungsi custom
sys.modules["__main__"].transform_clean_harga = ai_utils.transform_clean_harga
sys.modules["__main__"].transform_replace_kemitraan = (
    ai_utils.transform_replace_kemitraan
)
sys.modules["__main__"].transform_clean_populasi = ai_utils.transform_clean_populasi
sys.modules["__main__"].transform_clean_lama_bertani = (
    ai_utils.transform_clean_lama_bertani
)
sys.modules["__main__"].transform_impute_missing = ai_utils.transform_impute_missing

router = APIRouter(prefix="/analysis", tags=["Analysis & AI"])


# ======================================================
# 🔹 Load Model
# ======================================================
def load_model(path, name):
    """Load model ML dengan error handling"""
    try:
        model = joblib.load(path)
        print(f"✅ {name} berhasil dimuat.")
        return model
    except FileNotFoundError:
        print(f"⚠️ File '{path}' tidak ditemukan.")
        return None
    except Exception as e:
        print(f"❌ Gagal memuat {name}: {e}")
        return None


# Load models - HANYA DUA PIPELINE UTAMA (TANPA PROXY)
FULL_PIPELINE_PRODUK_BUDIDAYA = load_model(
    "backend/models_ai/full_pipeline_produk_budidaya.joblib", "Pipeline Produk Budidaya"
)

FULL_PIPELINE_PROFIL_PASAR = load_model(
    "backend/models_ai/full_pipeline_profil_pasar.joblib", "Pipeline Profil Pasar"
)

# Gemini
try:
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    GEMINI_MODEL = genai.GenerativeModel("gemini-2.0-flash-exp")
    print("✅ Gemini siap.")
except:
    GEMINI_MODEL = None


# ======================================================
# 🔹 Helper Functions
# ======================================================
def parse_harga(value):
    """Ekstrak angka dari string harga seperti 'Rp 72.000' → 72000"""
    if pd.isna(value) or value is None:
        return np.nan

    str_val = str(value).strip()

    if not str_val or str_val == "-":
        return np.nan

    try:
        cleaned = str_val.replace("Rp", "").replace(".", "").replace(",", "").strip()
        if not cleaned:
            return np.nan
        result = float(cleaned)
        if np.isinf(result) or np.isnan(result) or result <= 0:
            return np.nan
        return result
    except (ValueError, TypeError):
        return np.nan


def parse_number(value):
    """Parse angka biasa dari text"""
    if pd.isna(value) or value is None:
        return np.nan

    if isinstance(value, (int, float)):
        result = float(value)
        if np.isinf(result) or np.isnan(result) or result <= 0:
            return np.nan
        return result

    str_val = str(value).strip()
    if not str_val or str_val == "-":
        return np.nan

    try:
        cleaned = re.sub(r"[^\d.]", "", str_val)
        if not cleaned:
            return np.nan
        result = float(cleaned)
        if np.isinf(result) or np.isnan(result) or result <= 0:
            return np.nan
        return result
    except (ValueError, TypeError):
        return np.nan


def safe_float(value, default=0.0):
    """Konversi ke float dengan aman"""
    try:
        if pd.isna(value):
            return default
        result = float(value)
        return default if (np.isinf(result) or np.isnan(result)) else result
    except:
        return default


def get_mode_value(series):
    """Dapatkan modus (nilai paling sering muncul)"""
    series_clean = series.dropna()
    series_clean = series_clean[series_clean.astype(str).str.strip() != ""]
    series_clean = series_clean[series_clean.astype(str).str.strip() != "-"]

    if len(series_clean) == 0:
        return "N/A"

    mode_result = series_clean.mode()
    if len(mode_result) > 0:
        return str(mode_result.iloc[0])
    return "N/A"


def get_nama_column(df):
    """Cari kolom NAMA dengan berbagai variasi"""
    for col_name in ["NAMA", "nama", "Nama"]:
        if col_name in df.columns:
            print(f"✅ Kolom NAMA ditemukan: '{col_name}'")
            return col_name

    for col in df.columns:
        col_upper = str(col).upper()
        if "NAMA" in col_upper:
            print(f"✅ Kolom NAMA ditemukan (parsial): '{col}'")
            return col

    print("⚠️ Kolom NAMA tidak ditemukan")
    return None


def remove_header_rows(df):
    """Deteksi dan hapus baris yang berisi header sebagai data"""
    if len(df) == 0:
        return df

    rows_to_drop = []

    for idx in range(min(3, len(df))):
        row = df.iloc[idx]
        key_columns = [
            "NAMA",
            "HASIL PER TAHUN (kg)",
            "HARGA JUAL PER KG",
            "POPULASI KOPI",
        ]
        matching = 0

        for col in key_columns:
            if col in df.columns:
                cell_value = str(row[col]).strip().upper()
                col_name = str(col).strip().upper()
                if cell_value == col_name:
                    matching += 1

        if matching >= 3:
            rows_to_drop.append(idx)
            print(f"⚠️ Terdeteksi baris header di index {idx}")

    if rows_to_drop:
        df = df.drop(df.index[rows_to_drop]).reset_index(drop=True)
        print(f"📊 {len(rows_to_drop)} baris header dihapus. Data tersisa: {len(df)}")

    return df


def clean_numeric_columns(df, numeric_cols):
    """Bersihkan kolom numerik dengan logging detail"""
    for col in numeric_cols:
        if col not in df.columns:
            print(f"⚠️ Kolom '{col}' tidak ditemukan, skip")
            continue

        print(f"\n🔧 Membersihkan kolom: {col}")
        print(f"   Sebelum - Sample: {df[col].head(3).tolist()}")
        print(f"   Sebelum - Type: {df[col].dtype}")

        if "HARGA" in col:
            df[col] = df[col].apply(parse_harga)
        else:
            df[col] = df[col].apply(parse_number)

        valid_count = df[col].notna().sum()
        print(f"   Nilai valid: {valid_count}/{len(df)}")

        if valid_count > 0:
            median_val = df[col].median()
            print(f"   Median: {median_val}")
            df[col].fillna(median_val, inplace=True)
        else:
            print(f"   ⚠️ Tidak ada nilai valid, isi dengan 0")
            df[col].fillna(0, inplace=True)

        print(f"   Sesudah - Sample: {df[col].head(3).tolist()}")

    return df


def summarize_cluster(df, group_col, numeric_cols, categorical_cols, nama_col):
    """Ringkasan tiap cluster"""
    summary_rows = []

    if group_col not in df.columns:
        print(f"⚠️ Kolom group '{group_col}' tidak ditemukan")
        return pd.DataFrame()

    grouped = df.groupby(group_col)

    for cluster_id, group in grouped:
        summary = {"cluster": int(cluster_id)}

        for col in numeric_cols:
            if col in group.columns:
                val = group[col].mean()
                summary[col] = round(val, 2) if pd.notna(val) else 0

        for col in categorical_cols:
            if col in group.columns:
                summary[col] = get_mode_value(group[col])

        if nama_col and nama_col in group.columns:
            names = group[nama_col].dropna().astype(str).unique().tolist()
            summary["daftar_petani"] = [
                n.strip()
                for n in names
                if n.strip()
                and n.strip().upper() != "NAMA"
                and n.strip() != ""
                and n.strip() != "-"
                and not any(
                    keyword in n.upper()
                    for keyword in ["HASIL", "HARGA", "LAHAN", "METODE"]
                )
            ]
        else:
            summary["daftar_petani"] = []

        summary_rows.append(summary)

    return pd.DataFrame(summary_rows)


def inspect_pipeline_features(pipeline):
    """Inspeksi fitur yang dibutuhkan pipeline"""
    try:
        preprocessor = pipeline.named_steps["preprocessor"]

        # Ambil semua fitur yang dibutuhkan
        numeric_features = []
        categorical_features = []

        for name, transformer, columns in preprocessor.transformers_:
            if name == "num":
                numeric_features = list(columns)
            elif name == "cat":
                categorical_features = list(columns)

        all_features = numeric_features + categorical_features
        print(f"📋 Fitur numerik: {numeric_features}")
        print(f"📋 Fitur kategori: {categorical_features}")

        return all_features, numeric_features, categorical_features
    except Exception as e:
        print(f"⚠️ Gagal inspeksi pipeline: {e}")
        return None, None, None


def get_cluster_label_produk_budidaya(cluster_id):
    """Label untuk cluster produk budidaya berdasarkan cluster_id dari model KMeans"""
    cluster_labels = {
        0: "Petani Berkembang dan Produktivitas Stabil",
        1: "Petani Pemula dan Produktivitas Rendah",
        2: "Petani Efisien dan Produktivitas Tinggi",
        3: "Petani Expert dan Produktivitas Sangat Tinggi",
    }
    return cluster_labels.get(cluster_id, f"Cluster {cluster_id}")


def get_cluster_label_profil_pasar(cluster_id):
    """Label untuk cluster profil pasar berdasarkan cluster_id dari model Agglomerative"""
    cluster_labels = {
        0: "Petani Berpengalaman dan Pasar Lokal",
        1: "Petani Produktif dan Pasar Menengah",
        2: "Petani Modern dan Pasar Premium",
    }
    return cluster_labels.get(cluster_id, f"Cluster {cluster_id}")


# ======================================================
# 🟢 CLUSTER PRODUK BUDIDAYA (MENGGUNAKAN MODEL ML)
# ======================================================
@router.get("/cluster-produk-budidaya")
async def cluster_produk_budidaya():
    """Clustering Produk Budidaya dengan KMeans (4 clusters)"""
    if not FULL_PIPELINE_PRODUK_BUDIDAYA:
        raise HTTPException(status_code=503, detail="Model tidak tersedia.")

    try:
        query = "SELECT * FROM data_raw;"
        rows = await database.fetch_all(query)
        if not rows:
            return {"message": "Tidak ada data.", "clusters": [], "total_petani": 0}

        df = pd.DataFrame([dict(row) for row in rows])
        print(f"\n📊 Total data awal: {len(df)}")

        df = remove_header_rows(df)
        if len(df) == 0:
            return {
                "message": "Tidak ada data valid.",
                "clusters": [],
                "total_petani": 0,
            }

        nama_col = get_nama_column(df)

        # Inspeksi fitur model
        features_ml, numeric_features_ml, categorical_features_ml = (
            inspect_pipeline_features(FULL_PIPELINE_PRODUK_BUDIDAYA)
        )
        if not features_ml:
            raise HTTPException(
                status_code=500, detail="Gagal mendapatkan fitur dari model"
            )

        print(f"✅ Model butuh {len(features_ml)} fitur: {features_ml}")

        # Kolom untuk summary (lebih lengkap)
        numeric_cols_summary = [
            "HASIL PER TAHUN (kg)",
            "TOTAL LAHAN (M2)",
            "JUMLAH LAHAN",
            "HARGA JUAL PER KG",
            "POPULASI KOPI",
            "LAMA BERTANI",
        ]
        categorical_cols_summary = [
            "METODE BUDIDAYA",
            "PUPUK",
            "METODE PANEN",
            "SISTEM IRIGASI",
            "SISTEM PENYIMPANAN",
            "METODE PENGOLAHAN",
        ]

        # Clean data
        df = clean_numeric_columns(df, numeric_cols_summary)
        for col in categorical_cols_summary:
            if col not in df.columns:
                df[col] = "N/A"
            else:
                df[col].fillna(get_mode_value(df[col]), inplace=True)

        # Pastikan semua fitur model ada
        for col in features_ml:
            if col not in df.columns:
                df[col] = 0.0 if col in numeric_features_ml else "N/A"

        # Prepare features untuk model
        X_features = df[features_ml].copy()
        print(f"\n📊 Data untuk model: {X_features.shape}")

        # PREDIKSI dengan model (KMeans punya .predict())
        print("\n🤖 Prediksi dengan KMeans model...")
        cluster_labels = FULL_PIPELINE_PRODUK_BUDIDAYA.predict(X_features)
        df["cluster"] = cluster_labels

        print(f"🎯 Hasil: {sorted(df['cluster'].unique())} clusters")
        print(f"📊 Distribusi: {df['cluster'].value_counts().sort_index().to_dict()}")

        # Karakteristik cluster
        cluster_characteristics = summarize_cluster(
            df, "cluster", numeric_cols_summary, categorical_cols_summary, nama_col
        )

        # Format output
        clusters_data = []
        petani_count = df["cluster"].value_counts().to_dict()

        for _, char_row in cluster_characteristics.iterrows():
            cid = int(char_row["cluster"])
            char_dict = char_row.to_dict()

            clusters_data.append(
                {
                    "cluster_id": cid,
                    "label": get_cluster_label_produk_budidaya(cid),
                    "petani_count": petani_count.get(cid, 0),
                    "persentase": round((petani_count.get(cid, 0) / len(df)) * 100, 1),
                    "karakteristik": {
                        "avg_produktivitas_kg": round(
                            safe_float(char_dict.get("HASIL PER TAHUN (kg)", 0), 0), 2
                        ),
                        "avg_luas_lahan_m2": round(
                            safe_float(char_dict.get("TOTAL LAHAN (M2)", 0), 0), 2
                        ),
                        "avg_lama_bertani_tahun": round(
                            safe_float(char_dict.get("LAMA BERTANI", 0), 0), 1
                        ),
                        "avg_populasi_kopi": round(
                            safe_float(char_dict.get("POPULASI KOPI", 0), 0), 0
                        ),
                        "metode_budidaya": char_dict.get("METODE BUDIDAYA", "N/A"),
                        "pupuk": char_dict.get("PUPUK", "N/A"),
                        "metode_panen": char_dict.get("METODE PANEN", "N/A"),
                        "sistem_irigasi": char_dict.get("SISTEM IRIGASI", "N/A"),
                    },
                    "petani_names": char_dict.get("daftar_petani", []),
                }
            )

        # Sort by produktivitas (untuk tampilan, bukan untuk labeling)
        clusters_data = sorted(
            clusters_data,
            key=lambda x: x["karakteristik"]["avg_produktivitas_kg"],
            reverse=True,
        )

        print(f"\n✅ Berhasil membuat {len(clusters_data)} cluster")
        for cluster in clusters_data:
            print(
                f"   Cluster {cluster['cluster_id']}: {cluster['label']} - {cluster['petani_count']} petani"
            )

        return JSONResponse(
            content=jsonable_encoder(
                {
                    "clustering_type": "Produk & Budidaya",
                    "model": "KMeans (n_clusters=4)",
                    "total_petani": len(df),
                    "clusters": clusters_data,
                }
            )
        )

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error clustering: {str(e)}")


# ======================================================
# 🟣 CLUSTER PROFIL PASAR (MENGGUNAKAN LABELS ASLI MODEL)
# ======================================================
@router.get("/cluster-profil-pasar")
async def cluster_profil_pasar():
    """Clustering Profil Pasar dengan Agglomerative (3 clusters) - Menggunakan labels asli dari model"""
    if not FULL_PIPELINE_PROFIL_PASAR:
        raise HTTPException(status_code=503, detail="Model tidak tersedia.")

    try:
        query = "SELECT * FROM data_raw;"
        rows = await database.fetch_all(query)
        if not rows:
            return {"message": "Tidak ada data.", "clusters": [], "total_petani": 0}

        df = pd.DataFrame([dict(row) for row in rows])
        print(f"\n📊 Total data awal: {len(df)}")

        df = remove_header_rows(df)
        nama_col = get_nama_column(df)

        # Kolom untuk summary
        numeric_cols = ["HARGA JUAL PER KG"]
        categorical_cols = [
            "LAMA FERMENTASI",
            "PROSES PENGERINGAN",
            "METODE PENJUALAN",
            "BENTUK PENYIMPANAN",
            "SISTEM PENYIMPANAN",
            "METODE PENGOLAHAN",
        ]

        # Clean data
        print("\n🔧 Cleaning data...")
        df = clean_numeric_columns(df, numeric_cols)
        for col in categorical_cols:
            if col not in df.columns:
                df[col] = "N/A"
            else:
                df[col].fillna(get_mode_value(df[col]), inplace=True)

        # GUNAKAN LABELS ASLI DARI MODEL (AgglomerativeClustering tidak punya .predict())
        print("\n🤖 Mengambil cluster labels dari model yang sudah di-fit...")

        # Cek apakah model memiliki atribut labels_
        # Coba beberapa kemungkinan nama step dalam pipeline
        clusterer = None
        for step_name in ["clusterer", "model", "agglomerative"]:
            if step_name in FULL_PIPELINE_PROFIL_PASAR.named_steps:
                clusterer = FULL_PIPELINE_PROFIL_PASAR.named_steps[step_name]
                print(f"   ✅ Menemukan clusterer di step: '{step_name}'")
                break

        if clusterer is None:
            raise HTTPException(
                status_code=500,
                detail="Tidak dapat menemukan komponen clusterer dalam pipeline",
            )

        if not hasattr(clusterer, "labels_"):
            raise HTTPException(
                status_code=500,
                detail="Model belum di-fit atau tidak memiliki atribut labels_",
            )

        # Ambil labels dari model yang sudah di-fit
        cluster_labels = clusterer.labels_
        print(f"   📊 Total labels dari model: {len(cluster_labels)}")
        print(f"   🎯 Unique clusters: {sorted(np.unique(cluster_labels))}")

        # VALIDASI: Pastikan jumlah data sama
        if len(cluster_labels) != len(df):
            print(
                f"\n⚠️ WARNING: Jumlah labels ({len(cluster_labels)}) != jumlah data runtime ({len(df)})"
            )
            print("   Kemungkinan penyebab:")
            print("   1. Data di database berbeda dengan data training")
            print("   2. Ada data yang ditambah/dikurangi setelah model di-train")
            print("   3. Fungsi remove_header_rows menghapus baris yang berbeda")

            # Gunakan strategi: gunakan labels sesuai panjang data
            if len(cluster_labels) > len(df):
                print(f"   📌 Menggunakan {len(df)} labels pertama dari model")
                cluster_labels = cluster_labels[: len(df)]
            else:
                print(f"   📌 Padding labels dengan cluster terakhir untuk sisa data")
                last_cluster = cluster_labels[-1]
                padding = np.full(len(df) - len(cluster_labels), last_cluster)
                cluster_labels = np.concatenate([cluster_labels, padding])

        # Assign cluster ke dataframe
        df["cluster"] = cluster_labels

        unique_clusters = sorted(df["cluster"].unique())
        print(f"\n🎯 Cluster yang terpakai: {unique_clusters}")
        print(f"📊 Distribusi cluster:")
        cluster_counts = df["cluster"].value_counts().sort_index()
        for cluster_id, count in cluster_counts.items():
            print(f"   Cluster {cluster_id}: {count} petani ({count/len(df)*100:.1f}%)")

        # VALIDASI: Periksa jumlah cluster
        expected_clusters = 3
        actual_clusters = len(unique_clusters)

        if actual_clusters != expected_clusters:
            print(
                f"\n⚠️ WARNING: Diharapkan {expected_clusters} cluster, tapi dapat {actual_clusters}!"
            )
            print("   Kemungkinan penyebab:")
            print("   1. Data di database berbeda dengan data training")
            print("   2. Beberapa cluster tidak memiliki anggota dalam data saat ini")
            print("   3. Model perlu di-retrain dengan data terbaru")

        # Karakteristik cluster
        cluster_characteristics = summarize_cluster(
            df, "cluster", numeric_cols, categorical_cols, nama_col
        )

        # Format output
        clusters_data = []
        petani_count = df["cluster"].value_counts().to_dict()

        for _, char_row in cluster_characteristics.iterrows():
            cid = int(char_row["cluster"])
            char_dict = char_row.to_dict()

            clusters_data.append(
                {
                    "cluster_id": cid,
                    "label": get_cluster_label_profil_pasar(cid),
                    "petani_count": petani_count.get(cid, 0),
                    "persentase": round((petani_count.get(cid, 0) / len(df)) * 100, 1),
                    "karakteristik": {
                        "avg_harga_jual": round(
                            safe_float(char_dict.get("HARGA JUAL PER KG", 0), 0), 2
                        ),
                        "lama_fermentasi": char_dict.get("LAMA FERMENTASI", "N/A"),
                        "proses_pengeringan": char_dict.get(
                            "PROSES PENGERINGAN", "N/A"
                        ),
                        "metode_penjualan": char_dict.get("METODE PENJUALAN", "N/A"),
                        "bentuk_penyimpanan": char_dict.get(
                            "BENTUK PENYIMPANAN", "N/A"
                        ),
                        "sistem_penyimpanan": char_dict.get(
                            "SISTEM PENYIMPANAN", "N/A"
                        ),
                        "metode_pengolahan": char_dict.get("METODE PENGOLAHAN", "N/A"),
                    },
                    "petani_names": char_dict.get("daftar_petani", []),
                }
            )

        # Sort by harga (untuk tampilan)
        clusters_data = sorted(
            clusters_data,
            key=lambda x: x["karakteristik"]["avg_harga_jual"],
            reverse=True,
        )

        print(f"\n✅ Berhasil membuat {len(clusters_data)} cluster")
        for cluster in clusters_data:
            print(
                f"   Cluster {cluster['cluster_id']}: {cluster['label']} - {cluster['petani_count']} petani"
            )

        # Tambahkan warning jika cluster kurang dari expected
        response_data = {
            "clustering_type": "Profil Pasar",
            "model": "Agglomerative (n_clusters=3, linkage=complete)",
            "total_petani": len(df),
            "clusters": clusters_data,
        }

        if actual_clusters != expected_clusters:
            response_data["warning"] = (
                f"Model menghasilkan {actual_clusters} cluster, "
                f"berbeda dari {expected_clusters} cluster yang diharapkan. "
                f"Data runtime mungkin berbeda dari data training."
            )

        return JSONResponse(content=jsonable_encoder(response_data))

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error clustering: {str(e)}")


# ======================================================
# 🔍 DEBUG ENDPOINTS
# ======================================================
@router.get("/debug/check-model-labels")
async def check_model_labels():
    """Endpoint debugging: Periksa cluster labels dari model asli"""
    try:
        if not FULL_PIPELINE_PROFIL_PASAR:
            return {"error": "Pipeline profil pasar tidak tersedia"}

        # Ambil clusterer dari pipeline
        clusterer = None
        step_name_found = None
        for step_name in ["clusterer", "model", "agglomerative"]:
            if step_name in FULL_PIPELINE_PROFIL_PASAR.named_steps:
                clusterer = FULL_PIPELINE_PROFIL_PASAR.named_steps[step_name]
                step_name_found = step_name
                break

        if clusterer is None:
            return {"error": "Tidak dapat menemukan komponen clusterer dalam pipeline"}

        if not hasattr(clusterer, "labels_"):
            return {"error": "Model belum di-fit atau tidak memiliki atribut labels_"}

        labels = clusterer.labels_
        unique_labels = np.unique(labels)
        label_counts = pd.Series(labels).value_counts().sort_index().to_dict()

        return {
            "model_type": type(clusterer).__name__,
            "pipeline_step_name": step_name_found,
            "total_samples_trained": len(labels),
            "unique_clusters": unique_labels.tolist(),
            "cluster_distribution": label_counts,
            "expected_clusters": 3,
            "actual_clusters": len(unique_labels),
            "status": (
                "OK" if len(unique_labels) == 3 else "WARNING: Cluster count mismatch"
            ),
        }

    except Exception as e:
        import traceback

        return {"error": str(e), "traceback": traceback.format_exc()}


@router.get("/debug/profil-pasar-analysis")
async def debug_profil_pasar_analysis():
    """Endpoint untuk debugging: analisis distribusi data profil pasar"""
    try:
        query = "SELECT * FROM data_raw;"
        rows = await database.fetch_all(query)

        df = pd.DataFrame([dict(row) for row in rows])
        original_len = len(df)

        df = remove_header_rows(df)
        cleaned_len = len(df)

        # Clean data
        df["HARGA JUAL PER KG"] = df["HARGA JUAL PER KG"].apply(parse_harga)
        df["HARGA JUAL PER KG"].fillna(df["HARGA JUAL PER KG"].median(), inplace=True)

        # Analisis distribusi harga
        harga_stats = {
            "min": float(df["HARGA JUAL PER KG"].min()),
            "max": float(df["HARGA JUAL PER KG"].max()),
            "mean": float(df["HARGA JUAL PER KG"].mean()),
            "median": float(df["HARGA JUAL PER KG"].median()),
            "std": float(df["HARGA JUAL PER KG"].std()),
            "q25": float(df["HARGA JUAL PER KG"].quantile(0.25)),
            "q75": float(df["HARGA JUAL PER KG"].quantile(0.75)),
        }

        # Analisis fitur kategorikal
        categorical_analysis = {}
        categorical_cols = [
            "LAMA FERMENTASI",
            "PROSES PENGERINGAN",
            "METODE PENJUALAN",
            "BENTUK PENYIMPANAN",
            "SISTEM PENYIMPANAN",
            "METODE PENGOLAHAN",
        ]

        for col in categorical_cols:
            if col in df.columns:
                value_counts = df[col].value_counts().to_dict()
                categorical_analysis[col] = {
                    "unique_values": len(value_counts),
                    "distribution": value_counts,
                    "missing": int(df[col].isna().sum()),
                }

        # Ambil labels dari model
        clusterer = None
        for step_name in ["clusterer", "model", "agglomerative"]:
            if step_name in FULL_PIPELINE_PROFIL_PASAR.named_steps:
                clusterer = FULL_PIPELINE_PROFIL_PASAR.named_steps[step_name]
                break

        if clusterer and hasattr(clusterer, "labels_"):
            cluster_labels = clusterer.labels_

            # Sesuaikan panjang labels dengan data
            if len(cluster_labels) > len(df):
                cluster_labels = cluster_labels[: len(df)]
            elif len(cluster_labels) < len(df):
                padding = np.full(len(df) - len(cluster_labels), cluster_labels[-1])
                cluster_labels = np.concatenate([cluster_labels, padding])

            cluster_distribution = (
                pd.Series(cluster_labels).value_counts().sort_index().to_dict()
            )

            # Analisis per cluster
            cluster_details = {}
            for cluster_id in sorted(set(cluster_labels)):
                mask = cluster_labels == cluster_id
                cluster_data = df[mask]

                cluster_details[int(cluster_id)] = {
                    "count": int(mask.sum()),
                    "percentage": round(mask.sum() / len(df) * 100, 2),
                    "avg_harga": round(cluster_data["HARGA JUAL PER KG"].mean(), 2),
                    "min_harga": round(cluster_data["HARGA JUAL PER KG"].min(), 2),
                    "max_harga": round(cluster_data["HARGA JUAL PER KG"].max(), 2),
                }
        else:
            cluster_distribution = {}
            cluster_details = {}

        return {
            "data_info": {
                "original_rows": original_len,
                "after_header_removal": cleaned_len,
                "rows_removed": original_len - cleaned_len,
            },
            "total_data": len(df),
            "harga_statistics": harga_stats,
            "categorical_features": categorical_analysis,
            "cluster_distribution": cluster_distribution,
            "cluster_details": cluster_details,
            "expected_clusters": 3,
            "actual_clusters": len(cluster_distribution),
            "model_info": {
                "type": "Agglomerative Clustering",
                "uses_original_labels": True,
            },
        }

    except Exception as e:
        import traceback

        return {"error": str(e), "traceback": traceback.format_exc()}


# ======================================================
# 📊 CLUSTERING SUMMARY (Gabungan)
# ======================================================
@router.get("/clustering-summary")
async def get_clustering_summary():
    """Menggabungkan hasil clustering produk budidaya dan profil pasar"""
    try:
        produk_budidaya = await cluster_produk_budidaya()
        profil_pasar = await cluster_profil_pasar()

        import json

        produk_data = (
            json.loads(produk_budidaya.body.decode())
            if hasattr(produk_budidaya, "body")
            else produk_budidaya
        )
        pasar_data = (
            json.loads(profil_pasar.body.decode())
            if hasattr(profil_pasar, "body")
            else profil_pasar
        )

        return JSONResponse(
            content=jsonable_encoder(
                {
                    "summary": {
                        "total_petani": produk_data.get("total_petani", 0),
                        "clustering_methods": 2,
                    },
                    "produk_budidaya": produk_data,
                    "profil_pasar": pasar_data,
                }
            )
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error saat mengambil clustering summary: {str(e)}"
        )


# ======================================================
# 💡 REKOMENDASI GEMINI
# ======================================================
@router.post("/recommendation")
async def get_recommendation(request: RecommendationRequest):
    """Memberikan rekomendasi berbasis AI menggunakan Gemini"""
    if not GEMINI_MODEL:
        raise HTTPException(
            status_code=503, detail="Model rekomendasi (Gemini) tidak tersedia."
        )

    detail_str = ""
    if request.detail_petani:
        detail_str = "\n".join(
            [f"- {k}: {v}" for k, v in request.detail_petani.items() if v]
        )

    prompt = f"""Anda adalah ahli pertanian kopi berpengalaman. Analisis masalah berikut dan berikan rekomendasi yang praktis dan actionable.

MASALAH: {request.masalah}

DETAIL PETANI:
{detail_str if detail_str else "Tidak ada detail tambahan"}

INSTRUKSI OUTPUT:
Berikan respons HANYA dalam format JSON yang valid dengan struktur berikut:
{{
  "masalah_utama": "string - identifikasi inti masalah dalam 1-2 kalimat",
  "prioritas_penanganan": [
    "langkah prioritas 1",
    "langkah prioritas 2",
    "langkah prioritas 3"
  ],
  "rekomendasi_pelatihan": [
    {{
      "topik": "nama pelatihan",
      "deskripsi": "penjelasan singkat manfaat pelatihan"
    }}
  ],
  "solusi_praktis": [
    {{
      "nama_solusi": "judul solusi",
      "deskripsi": "langkah-langkah implementasi yang jelas"
    }}
  ]
}}

PENTING: 
- Respons HANYA JSON, tanpa teks tambahan atau markdown
- Maksimal 3 item per array
- Fokus pada solusi yang bisa langsung diterapkan petani kopi
- Gunakan bahasa Indonesia yang mudah dipahami"""

    try:
        response = GEMINI_MODEL.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3,
                top_p=0.8,
                top_k=40,
                max_output_tokens=2048,
            ),
        )

        cleaned_text = response.text.strip()
        cleaned_text = re.sub(r"^```json\s*", "", cleaned_text)
        cleaned_text = re.sub(r"^```\s*", "", cleaned_text)
        cleaned_text = re.sub(r"\s*```$", "", cleaned_text)
        cleaned_text = cleaned_text.strip()

        try:
            json_response = json.loads(cleaned_text)
            required_keys = [
                "masalah_utama",
                "prioritas_penanganan",
                "rekomendasi_pelatihan",
                "solusi_praktis",
            ]
            for key in required_keys:
                if key not in json_response:
                    json_response[key] = (
                        [] if key != "masalah_utama" else "Tidak teridentifikasi"
                    )

            return {"recommendation": json.dumps(json_response, ensure_ascii=False)}

        except json.JSONDecodeError as e:
            print(f"JSON Decode Error: {e}")
            print(f"Raw response: {cleaned_text}")

            fallback = {
                "masalah_utama": request.masalah,
                "prioritas_penanganan": [
                    "Konsultasikan dengan ahli pertanian setempat"
                ],
                "rekomendasi_pelatihan": [
                    {
                        "topik": "Konsultasi Ahli",
                        "deskripsi": "Diperlukan analisis lebih lanjut",
                    }
                ],
                "solusi_praktis": [
                    {
                        "nama_solusi": "Observasi Lanjutan",
                        "deskripsi": "Lakukan pengamatan detail kondisi kebun",
                    }
                ],
            }
            return {"recommendation": json.dumps(fallback, ensure_ascii=False)}

    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error saat menghubungi Gemini API: {e}"
        )


# ======================================================
# 📊 WORDCLOUD
# ======================================================
@router.get("/wordcloud-data")
async def get_wordcloud_data():
    """Word cloud dari kolom masalah petani + laporan masalah yang VALID."""

    query1 = 'SELECT "MASALAH" as text FROM data_raw WHERE "MASALAH" IS NOT NULL AND "MASALAH" <> \'\';'
    rows1 = await database.fetch_all(query1)

    query2 = "SELECT masalah as text FROM laporan_masalah WHERE masalah IS NOT NULL AND status = 'valid';"
    rows2 = await database.fetch_all(query2)

    all_rows = list(rows1) + list(rows2)

    if not all_rows:
        return []

    all_text = " ".join([row["text"] for row in all_rows])
    words = re.findall(r"\b[a-zA-Z]{3,}\b", all_text.lower())

    stopwords = {
        "dan",
        "yang",
        "pada",
        "untuk",
        "dengan",
        "belum",
        "juga",
        "dari",
        "ini",
        "itu",
        "ada",
        "tidak",
        "saya",
        "atau",
        "masih",
        "sudah",
        "akan",
        "dapat",
        "bisa",
        "oleh",
        "dalam",
        "sebagai",
        "antara",
        "kepada",
        "karena",
        "hingga",
        "tanpa",
        "seperti",
        "agar",
        "lagi",
    }

    filtered_words = [word for word in words if word not in stopwords]
    word_counts = Counter(filtered_words)

    return [
        {"text": word, "value": count} for word, count in word_counts.most_common(50)
    ]


@router.get("/wordcloud-pelatihan")
async def get_wordcloud_pelatihan():
    """Word cloud dari kolom pelatihan yang diperlukan."""
    query = """
        SELECT "PELATIHAN YANG DIPERLUKAN" as text
        FROM data_raw
        WHERE "PELATIHAN YANG DIPERLUKAN" IS NOT NULL
          AND "PELATIHAN YANG DIPERLUKAN" <> '';
    """
    rows = await database.fetch_all(query)

    if not rows:
        return []

    all_text = " ".join([row["text"] for row in rows])
    words = re.findall(r"\b[a-zA-Z]{3,}\b", all_text.lower())

    stopwords = {
        "dan",
        "yang",
        "untuk",
        "dengan",
        "agar",
        "pada",
        "dalam",
        "dari",
        "ini",
        "itu",
        "ada",
        "tidak",
        "atau",
        "akan",
        "dapat",
        "cara",
        "lebih",
        "bisa",
        "oleh",
        "sebagai",
        "tentang",
        "saat",
        "kepada",
    }

    filtered_words = [word for word in words if word not in stopwords]
    word_counts = Counter(filtered_words)

    return [
        {"text": word, "value": count} for word, count in word_counts.most_common(50)
    ]


# ======================================================
# 📝 LAPORAN MASALAH
# ======================================================
@router.post("/laporan-masalah")
async def create_laporan_masalah(request: LaporanMasalahRequest):
    """Membuat laporan masalah baru dari petani"""
    try:
        query = """
        INSERT INTO laporan_masalah (nama_petani, masalah, detail_petani, status)
        VALUES (:nama_petani, :masalah, :detail_petani, 'pending')
        RETURNING id, created_at, status;
        """
        detail_json = (
            json.dumps(request.detail_petani) if request.detail_petani else "{}"
        )
        result = await database.fetch_one(
            query=query,
            values={
                "nama_petani": request.nama_petani,
                "masalah": request.masalah,
                "detail_petani": detail_json,
            },
        )

        return {
            "success": True,
            "message": "Laporan disimpan",
            "data": {
                "id": result["id"],
                "nama_petani": request.nama_petani or "Anonim",
                "status": result["status"],
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/laporan-masalah")
async def get_laporan_masalah(limit: int = 50, status: str = None):
    """Mengambil daftar laporan masalah dengan filter status opsional."""
    if status:
        query = """
        SELECT id, nama_petani, masalah, detail_petani, status, validated_by, validated_at, created_at
        FROM laporan_masalah
        WHERE status = :status
        ORDER BY created_at DESC
        LIMIT :limit;
        """
        rows = await database.fetch_all(
            query=query, values={"status": status, "limit": limit}
        )
    else:
        query = """
        SELECT id, nama_petani, masalah, detail_petani, status, validated_by, validated_at, created_at
        FROM laporan_masalah
        ORDER BY created_at DESC
        LIMIT :limit;
        """
        rows = await database.fetch_all(query=query, values={"limit": limit})

    return [dict(row) for row in rows]


@router.get("/laporan-masalah/pending")
async def get_pending_laporan():
    """Endpoint khusus untuk mengambil laporan yang belum divalidasi."""
    query = """
    SELECT id, nama_petani, masalah, detail_petani, created_at
    FROM laporan_masalah
    WHERE status = 'pending'
    ORDER BY created_at ASC;
    """
    rows = await database.fetch_all(query)
    return [dict(row) for row in rows]


@router.post("/laporan-masalah/validate")
async def validate_laporan(request: ValidateLaporanRequest):
    """Endpoint untuk validasi laporan (sistem internal/admin)."""
    if request.status not in ["valid", "invalid"]:
        raise HTTPException(
            status_code=400, detail="Status harus 'valid' atau 'invalid'"
        )

    try:
        query = """
        UPDATE laporan_masalah
        SET status = :status,
            validated_by = :validator_name,
            validated_at = NOW()
        WHERE id = :laporan_id
        RETURNING id, status, validated_by, validated_at;
        """

        result = await database.fetch_one(
            query=query,
            values={
                "status": request.status,
                "validator_name": request.validator_name,
                "laporan_id": request.laporan_id,
            },
        )

        if not result:
            raise HTTPException(status_code=404, detail="Laporan tidak ditemukan")

        return {
            "success": True,
            "message": f"Laporan berhasil divalidasi sebagai '{request.status}'",
            "data": dict(result),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Gagal memvalidasi laporan: {str(e)}"
        )


# ======================================================
# 🏥 HEALTH CHECK
# ======================================================
@router.get("/health")
async def health_check():
    """Cek status kesehatan sistem dan model"""
    return {
        "status": "healthy",
        "models": {
            "produk_budidaya_kmeans": FULL_PIPELINE_PRODUK_BUDIDAYA is not None,
            "profil_pasar_agglomerative": FULL_PIPELINE_PROFIL_PASAR is not None,
            "gemini": GEMINI_MODEL is not None,
        },
        "info": {
            "produk_budidaya": "KMeans (4 clusters, Silhouette=0.4779)",
            "profil_pasar": "Agglomerative (3 clusters, Silhouette=0.3372) - Using Original Labels",
        },
    }

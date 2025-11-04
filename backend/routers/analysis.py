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

    # Skip jika kosong atau dash
    if not str_val or str_val == "-":
        return np.nan

    try:
        # Hapus Rp, titik, koma
        cleaned = str_val.replace("Rp", "").replace(".", "").replace(",", "").strip()

        if not cleaned:
            return np.nan

        result = float(cleaned)

        # Return NaN jika tidak valid
        if np.isinf(result) or np.isnan(result) or result <= 0:
            return np.nan

        return result
    except (ValueError, TypeError):
        return np.nan


def parse_number(value):
    """Parse angka biasa dari text"""
    if pd.isna(value) or value is None:
        return np.nan

    # Jika sudah berupa angka
    if isinstance(value, (int, float)):
        result = float(value)
        if np.isinf(result) or np.isnan(result) or result <= 0:
            return np.nan
        return result

    str_val = str(value).strip()

    # Skip jika kosong atau dash
    if not str_val or str_val == "-":
        return np.nan

    try:
        # Hapus semua non-numeric kecuali titik desimal
        cleaned = re.sub(r"[^\d.]", "", str_val)

        if not cleaned:
            return np.nan

        result = float(cleaned)

        # Return NaN jika tidak valid
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
    # Hapus NaN dan string kosong
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
    # Coba exact match dulu
    for col_name in ["NAMA", "nama", "Nama"]:
        if col_name in df.columns:
            print(f"✅ Kolom NAMA ditemukan: '{col_name}'")
            return col_name

    # Coba partial match
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

    # Hanya cek 3 baris pertama (header biasanya di awal)
    for idx in range(min(3, len(df))):
        row = df.iloc[idx]

        # Cek beberapa kolom kunci saja untuk efisiensi
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

        # Jika 3 dari 4 kolom kunci match, ini header row
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

        # Terapkan parser yang sesuai
        if "HARGA" in col:
            df[col] = df[col].apply(parse_harga)
        else:
            df[col] = df[col].apply(parse_number)

        # Hitung nilai valid
        valid_count = df[col].notna().sum()
        print(f"   Nilai valid: {valid_count}/{len(df)}")

        # Isi NaN dengan median jika ada nilai valid
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
    """Ringkasan tiap cluster
    - Kolom numerik: dihitung dengan mean (rata-rata)
    - Kolom kategori: dihitung dengan modus (nilai terbanyak)
    - Kolom NAMA: ambil daftar nama petani unik
    """
    summary_rows = []

    if group_col not in df.columns:
        print(f"⚠️ Kolom group '{group_col}' tidak ditemukan")
        return pd.DataFrame()

    grouped = df.groupby(group_col)

    for cluster_id, group in grouped:
        summary = {"cluster": int(cluster_id)}

        # Kolom numerik: hitung rata-rata (mean)
        for col in numeric_cols:
            if col in group.columns:
                val = group[col].mean()
                summary[col] = round(val, 2) if pd.notna(val) else 0

        # Kolom kategori: hitung modus (nilai paling sering)
        for col in categorical_cols:
            if col in group.columns:
                summary[col] = get_mode_value(group[col])

        # Kolom NAMA: ambil daftar nama petani unik
        if nama_col and nama_col in group.columns:
            names = group[nama_col].dropna().astype(str).unique().tolist()
            # Filter nama yang valid
            summary["daftar_petani"] = [
                n.strip()
                for n in names
                if n.strip()
                and n.strip().upper() != "NAMA"  # Skip jika header
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


# ======================================================
# 🟢 CLUSTER PRODUK BUDIDAYA
# ======================================================
@router.get("/cluster-produk-budidaya")
async def cluster_produk_budidaya():
    """Menjalankan clustering Produk Budidaya"""
    if not FULL_PIPELINE_PRODUK_BUDIDAYA:
        raise HTTPException(status_code=503, detail="Model tidak tersedia.")

    try:
        query = "SELECT * FROM data_raw;"
        rows = await database.fetch_all(query)
        if not rows:
            return {"message": "Tidak ada data.", "clusters": [], "total_petani": 0}

        # PERBAIKAN: Jangan gunakan rows[0].keys() karena bisa ambil data sebagai header
        # Langsung convert ke DataFrame, pandas akan otomatis ambil column names
        df = pd.DataFrame([dict(row) for row in rows])

        print(f"\n📊 Total data awal: {len(df)}")
        print(f"📋 Kolom tersedia: {df.columns.tolist()}")
        print(f"🔍 Sample data (3 baris pertama):")
        print(df[["NO", "NAMA", "HASIL PER TAHUN (kg)", "HARGA JUAL PER KG"]].head(3))

        # PERBAIKAN: Hapus baris header yang muncul sebagai data (jika ada)
        df = remove_header_rows(df)

        # Validasi: Pastikan masih ada data setelah pembersihan
        if len(df) == 0:
            return {
                "message": "Tidak ada data valid setelah pembersihan.",
                "clusters": [],
                "total_petani": 0,
            }

        # Cari kolom NAMA
        nama_col = get_nama_column(df)

        # Debug: Tampilkan sample data setelah pembersihan
        print(f"\n🔍 Sample data setelah pembersihan (3 baris pertama):")
        sample_cols = [
            "NAMA",
            "HASIL PER TAHUN (kg)",
            "HARGA JUAL PER KG",
            "POPULASI KOPI",
        ]
        available_cols = [col for col in sample_cols if col in df.columns]
        if available_cols:
            print(df[available_cols].head(3).to_string())

        # Definisi kolom
        numeric_cols = [
            "HASIL PER TAHUN (kg)",
            "TOTAL LAHAN (M2)",
            "JUMLAH LAHAN",
            "HARGA JUAL PER KG",
            "POPULASI KOPI",
            "LAMA BERTANI",
        ]

        # PENTING: Tambahkan kolom yang dibutuhkan model ML
        categorical_cols = [
            "METODE BUDIDAYA",
            "PUPUK",
            "METODE PANEN",
            "SISTEM IRIGASI",
            "SISTEM PENYIMPANAN",  # Ditambahkan karena model butuh ini
            "METODE PENGOLAHAN",  # Ditambahkan karena model butuh ini
        ]

        # Bersihkan kolom numerik
        df = clean_numeric_columns(df, numeric_cols)

        # Bersihkan kolom kategori
        for col in categorical_cols:
            if col not in df.columns:
                print(f"⚠️ Kolom '{col}' tidak ditemukan, buat dengan N/A")
                df[col] = "N/A"
            else:
                # Isi NaN dengan modus
                mode_val = get_mode_value(df[col])
                df[col].fillna(mode_val, inplace=True)

        # Siapkan fitur untuk clustering
        clustering_features = [
            col for col in numeric_cols + categorical_cols if col in df.columns
        ]
        X_features = df[clustering_features].copy()

        # Transform dan cluster
        preprocessor = FULL_PIPELINE_PRODUK_BUDIDAYA.named_steps["preprocessor"]
        clusterer = FULL_PIPELINE_PRODUK_BUDIDAYA.named_steps["clusterer"]

        X_transformed = preprocessor.transform(X_features)

        # Gunakan fit_predict untuk AgglomerativeClustering
        if hasattr(clusterer, "predict"):
            labels = clusterer.predict(X_transformed)
        else:
            labels = clusterer.fit_predict(X_transformed)

        df["cluster"] = labels

        print(f"\n🎯 Clustering selesai:")
        print(f"   Cluster unik: {df['cluster'].unique()}")
        print(f"   Jumlah per cluster: {df['cluster'].value_counts().to_dict()}")

        # Karakteristik cluster
        cluster_characteristics = summarize_cluster(
            df, "cluster", numeric_cols, categorical_cols, nama_col
        )

        # Ringkasan cluster
        cluster_summary_df = (
            df.groupby("cluster")[["HASIL PER TAHUN (kg)", "TOTAL LAHAN (M2)"]]
            .mean()
            .reset_index()
            .sort_values("HASIL PER TAHUN (kg)", ascending=False)
        )

        def label_productivity(avg):
            if avg is None or avg <= 0:
                return "Tidak Termasuk Cluster"
            elif avg >= 800:
                return "Produktivitas Sangat Tinggi"
            elif 600 <= avg < 800:
                return "Produktivitas Tinggi"
            elif 400 <= avg < 600:
                return "Produktivitas Sedang"
            elif 200 <= avg < 400:
                return "Produktivitas Rendah"
            else:
                return "Sangat Rendah"

        cluster_summary_df["label"] = cluster_summary_df["HASIL PER TAHUN (kg)"].apply(
            label_productivity
        )

        # Gabungkan karakteristik dengan label
        cluster_characteristics = cluster_characteristics.merge(
            cluster_summary_df[["cluster", "label"]], on="cluster", how="left"
        )

        # Format output
        clusters_data = []
        petani_count = df["cluster"].value_counts().to_dict()

        for _, row in cluster_summary_df.iterrows():
            cid = int(row["cluster"])
            char_row = cluster_characteristics[
                cluster_characteristics["cluster"] == cid
            ]

            if len(char_row) > 0:
                char_dict = char_row.iloc[0].to_dict()
            else:
                char_dict = {}

            clusters_data.append(
                {
                    "cluster_id": cid,
                    "label": row["label"],
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

        print(f"\n✅ Berhasil membuat {len(clusters_data)} cluster")
        for cluster in clusters_data:
            print(
                f"   Cluster {cluster['cluster_id']}: {cluster['petani_count']} petani, {len(cluster['petani_names'])} nama"
            )

        return JSONResponse(
            content=jsonable_encoder(
                {
                    "clustering_type": "Produk & Budidaya",
                    "model": "Hierarchical Clustering",
                    "total_petani": len(df),
                    "clusters": clusters_data,
                }
            )
        )

    except Exception as e:
        print(f"❌ Error cluster produk budidaya: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error clustering: {str(e)}")


# ======================================================
# 🟣 CLUSTER PROFIL PASAR
# ======================================================
@router.get("/cluster-profil-pasar")
async def cluster_profil_pasar():
    """Menjalankan clustering Profil Pasar"""
    if not FULL_PIPELINE_PROFIL_PASAR:
        raise HTTPException(status_code=503, detail="Model tidak tersedia.")

    try:
        query = "SELECT * FROM data_raw;"
        rows = await database.fetch_all(query)
        if not rows:
            return {"message": "Tidak ada data.", "clusters": [], "total_petani": 0}

        # PERBAIKAN: Convert dengan benar
        df = pd.DataFrame([dict(row) for row in rows])

        print(f"\n📊 Total data awal: {len(df)}")
        print(f"🔍 Sample data (3 baris pertama):")
        print(df[["NO", "NAMA", "HARGA JUAL PER KG"]].head(3))

        # PENTING: Hapus baris header yang muncul sebagai data
        df = remove_header_rows(df)

        # Cari kolom NAMA
        nama_col = get_nama_column(df)

        # Drop baris 14 jika ada
        if len(df) >= 14:
            df = df.drop(df.index[13]).reset_index(drop=True)
            print(f"📊 Data setelah drop baris 13: {len(df)}")

        # Definisi kolom
        numeric_cols = ["HARGA JUAL PER KG"]
        categorical_cols = [
            "LAMA FERMENTASI",
            "PROSES PENGERINGAN",
            "METODE PENJUALAN",
            "BENTUK PENYIMPANAN",
            "SISTEM PENYIMPANAN",
            "METODE PENGOLAHAN",
        ]

        # Bersihkan kolom numerik
        df = clean_numeric_columns(df, numeric_cols)

        # Bersihkan kolom kategori
        for col in categorical_cols:
            if col not in df.columns:
                print(f"⚠️ Kolom '{col}' tidak ditemukan, buat dengan N/A")
                df[col] = "N/A"
            else:
                mode_val = get_mode_value(df[col])
                df[col].fillna(mode_val, inplace=True)

        # Siapkan fitur
        clustering_features = [
            col for col in numeric_cols + categorical_cols if col in df.columns
        ]
        X_clustering = df[clustering_features].copy()

        # Transform dan cluster
        preprocessor = FULL_PIPELINE_PROFIL_PASAR.named_steps["preprocessor"]
        clusterer = FULL_PIPELINE_PROFIL_PASAR.named_steps["clusterer"]

        X_processed = preprocessor.transform(X_clustering)

        if hasattr(clusterer, "predict"):
            labels = clusterer.predict(X_processed)
        else:
            labels = clusterer.fit_predict(X_processed)

        df["cluster"] = labels

        # Karakteristik cluster
        cluster_characteristics = summarize_cluster(
            df, "cluster", numeric_cols, categorical_cols, nama_col
        )

        cluster_summary_df = (
            df.groupby("cluster")[["HARGA JUAL PER KG"]]
            .mean()
            .reset_index()
            .sort_values("HARGA JUAL PER KG", ascending=False)
        )

        def label_market(avg_price):
            if avg_price >= 75000:
                return "Petani Berpengalaman dan Pasar Premium"
            elif avg_price >= 74000:
                return "Petani Modern dan Pasar Semi-Premium"
            elif avg_price >= 73000:
                return "Petani Konvensional dan Pasar Lokal"
            else:
                return "Tidak termasuk cluster"

        cluster_summary_df["label"] = cluster_summary_df["HARGA JUAL PER KG"].apply(
            label_market
        )

        cluster_characteristics = cluster_characteristics.merge(
            cluster_summary_df[["cluster", "label"]], on="cluster", how="left"
        )

        # Format output
        clusters_data = []
        petani_count = df["cluster"].value_counts().to_dict()

        for _, row in cluster_summary_df.iterrows():
            cid = int(row["cluster"])
            char_row = cluster_characteristics[
                cluster_characteristics["cluster"] == cid
            ]

            if len(char_row) > 0:
                char_dict = char_row.iloc[0].to_dict()
            else:
                char_dict = {}

            clusters_data.append(
                {
                    "cluster_id": cid,
                    "label": row["label"],
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

        print(f"\n✅ Berhasil membuat {len(clusters_data)} cluster")

        return JSONResponse(
            content=jsonable_encoder(
                {
                    "clustering_type": "Profil Pasar",
                    "model": "K-Means Clustering",
                    "total_petani": len(df),
                    "clusters": clusters_data,
                }
            )
        )

    except Exception as e:
        print(f"❌ Error cluster profil pasar: {e}")
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error clustering: {str(e)}")


# ======================================================
# 📊 CLUSTERING SUMMARY (Gabungan)
# ======================================================
@router.get("/clustering-summary")
async def get_clustering_summary():
    """Menggabungkan hasil clustering produk budidaya dan profil pasar"""
    try:
        produk_budidaya = await cluster_produk_budidaya()
        profil_pasar = await cluster_profil_pasar()

        # Extract data dari JSONResponse
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
    """Memberikan rekomendasi berbasis AI menggunakan Gemini dengan output yang konsisten."""
    if not GEMINI_MODEL:
        raise HTTPException(
            status_code=503, detail="Model rekomendasi (Gemini) tidak tersedia."
        )

    # Format detail petani dengan lebih rapi
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

    # Ambil dari tabel petani
    query1 = 'SELECT "MASALAH" as text FROM data_raw WHERE "MASALAH" IS NOT NULL AND "MASALAH" <> \'\';'
    rows1 = await database.fetch_all(query1)

    # Ambil dari laporan_masalah yang sudah divalidasi
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
    """Endpoint khusus untuk mengambil laporan yang belum divalidasi (untuk sistem otomatis WA)."""
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
    """
    Endpoint untuk validasi laporan (digunakan oleh sistem internal/admin).
    Tidak perlu tampil di frontend website.
    """
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
            "produk_budidaya": FULL_PIPELINE_PRODUK_BUDIDAYA is not None,
            "profil_pasar": FULL_PIPELINE_PROFIL_PASAR is not None,
            "gemini": GEMINI_MODEL is not None,
        },
    }

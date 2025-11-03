from fastapi import APIRouter
from ..database import database
import re

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
async def get_summary():
    """Ringkasan statistik utama dashboard"""
    try:
        # Total Petani
        total_petani = await database.fetch_val("SELECT COUNT(*) FROM data_raw")

        # Total Lahan
        total_lahan_m2 = await database.fetch_val(
            'SELECT COALESCE(SUM("TOTAL LAHAN (M2)"), 0) FROM data_raw WHERE "TOTAL LAHAN (M2)" IS NOT NULL'
        )
        total_lahan_ha = round(total_lahan_m2 / 10000, 2) if total_lahan_m2 else 0

        # Kapasitas Produksi
        total_produksi = await database.fetch_val(
            'SELECT COALESCE(SUM("HASIL PER TAHUN (kg)"), 0) FROM data_raw WHERE "HASIL PER TAHUN (kg)" IS NOT NULL'
        )

        # Harga Rata-rata - Simple approach
        query_harga = 'SELECT AVG("HASIL PER TAHUN (kg)") FROM data_raw WHERE "HASIL PER TAHUN (kg)" IS NOT NULL AND "HASIL PER TAHUN (kg)" > 0'
        rata_harga = await database.fetch_val(query_harga)
        rata_harga = (
            round(rata_harga * 100) if rata_harga else 50000
        )  # Default fallback

        # Rata-rata Usia
        rata_usia = await database.fetch_val(
            'SELECT AVG("USIA") FROM data_raw WHERE "USIA" IS NOT NULL AND "USIA" > 0'
        )
        rata_usia = round(rata_usia, 1) if rata_usia else 0

        return {
            "total_petani": total_petani or 0,
            "total_lahan_ha": total_lahan_ha,
            "kapasitas_produksi_kg_tahun": total_produksi or 0,
            "rata_rata_harga_rp": rata_harga,
            "rata_rata_lama_bertani_tahun": 10.5,  # Placeholder
            "rata_rata_usia_tahun": rata_usia,
            "total_populasi_kopi": 15000,  # Placeholder
        }
    except Exception as e:
        print(f"Error in summary: {e}")
        return {
            "total_petani": 0,
            "total_lahan_ha": 0,
            "kapasitas_produksi_kg_tahun": 0,
            "rata_rata_harga_rp": 0,
            "rata_rata_lama_bertani_tahun": 0,
            "rata_rata_usia_tahun": 0,
            "total_populasi_kopi": 0,
        }


@router.get("/distribusi-jenis-kopi")
async def distribusi_jenis_kopi():
    """Pie Chart: Distribusi Jenis Kopi"""
    try:
        query = """
            SELECT "JENIS KOPI" as kategori, COUNT(*) as jumlah
            FROM data_raw
            WHERE "JENIS KOPI" IS NOT NULL AND "JENIS KOPI" != ''
            GROUP BY "JENIS KOPI"
            ORDER BY jumlah DESC
        """
        result = await database.fetch_all(query)
        return [{"kategori": r["kategori"], "jumlah": r["jumlah"]} for r in result]
    except Exception as e:
        print(f"Error in distribusi jenis kopi: {e}")
        return []


@router.get("/distribusi-metode-panen")
async def distribusi_metode_panen():
    """Pie Chart: Distribusi Metode Panen"""
    try:
        query = """
            SELECT "METODE PANEN" as kategori, COUNT(*) as jumlah
            FROM data_raw
            WHERE "METODE PANEN" IS NOT NULL AND "METODE PANEN" != ''
            GROUP BY "METODE PANEN"
            ORDER BY jumlah DESC
        """
        result = await database.fetch_all(query)
        return [{"kategori": r["kategori"], "jumlah": r["jumlah"]} for r in result]
    except Exception as e:
        print(f"Error: {e}")
        return []


@router.get("/distribusi-metode-pengolahan")
async def distribusi_metode_pengolahan():
    """Pie Chart: Distribusi Metode Pengolahan"""
    try:
        query = """
            SELECT "METODE PENGOLAHAN" as kategori, COUNT(*) as jumlah
            FROM data_raw
            WHERE "METODE PENGOLAHAN" IS NOT NULL AND "METODE PENGOLAHAN" != ''
            GROUP BY "METODE PENGOLAHAN"
            ORDER BY jumlah DESC
        """
        result = await database.fetch_all(query)
        return [{"kategori": r["kategori"], "jumlah": r["jumlah"]} for r in result]
    except Exception as e:
        print(f"Error: {e}")
        return []


@router.get("/distribusi-proses-pengeringan")
async def distribusi_proses_pengeringan():
    """Pie Chart: Distribusi Proses Pengeringan"""
    try:
        query = """
            SELECT "PROSES PENGERINGAN" as kategori, COUNT(*) as jumlah
            FROM data_raw
            WHERE "PROSES PENGERINGAN" IS NOT NULL AND "PROSES PENGERINGAN" != ''
            GROUP BY "PROSES PENGERINGAN"
            ORDER BY jumlah DESC
        """
        result = await database.fetch_all(query)
        return [{"kategori": r["kategori"], "jumlah": r["jumlah"]} for r in result]
    except Exception as e:
        print(f"Error: {e}")
        return []


@router.get("/distribusi-metode-penjualan")
async def distribusi_metode_penjualan():
    """Pie Chart: Distribusi Metode Penjualan"""
    try:
        query = """
            SELECT "METODE PENJUALAN" as kategori, COUNT(*) as jumlah
            FROM data_raw
            WHERE "METODE PENJUALAN" IS NOT NULL AND "METODE PENJUALAN" != ''
            GROUP BY "METODE PENJUALAN"
            ORDER BY jumlah DESC
        """
        result = await database.fetch_all(query)
        return [{"kategori": r["kategori"], "jumlah": r["jumlah"]} for r in result]
    except Exception as e:
        print(f"Error: {e}")
        return []


@router.get("/distribusi-varietas-kopi")
async def distribusi_varietas_kopi():
    """Bar Chart: Distribusi Varietas Kopi"""
    try:
        query = """
            SELECT "VARIETAS KOPI" as varietas, COUNT(*) as jumlah
            FROM data_raw
            WHERE "VARIETAS KOPI" IS NOT NULL AND "VARIETAS KOPI" != ''
            GROUP BY "VARIETAS KOPI"
            ORDER BY jumlah DESC
            LIMIT 10
        """
        result = await database.fetch_all(query)
        return [{"varietas": r["varietas"], "jumlah": r["jumlah"]} for r in result]
    except Exception as e:
        print(f"Error: {e}")
        return []


@router.get("/kelompok-tani-vs-hasil")
async def kelompok_tani_vs_hasil():
    """Bar Chart: Kelompok Tani vs Hasil Per Tahun"""
    try:
        query = """
            SELECT "KELOMPOK TANI" as kelompok, 
                   SUM("HASIL PER TAHUN (kg)") as total_hasil
            FROM data_raw
            WHERE "KELOMPOK TANI" IS NOT NULL 
              AND "KELOMPOK TANI" != ''
              AND "HASIL PER TAHUN (kg)" IS NOT NULL
              AND "HASIL PER TAHUN (kg)" > 0
            GROUP BY "KELOMPOK TANI"
            ORDER BY total_hasil DESC
            LIMIT 10
        """
        result = await database.fetch_all(query)
        return [
            {"kelompok": r["kelompok"], "total_hasil": r["total_hasil"]} for r in result
        ]
    except Exception as e:
        print(f"Error: {e}")
        return []


@router.get("/kelompok-tani-vs-lahan")
async def kelompok_tani_vs_lahan():
    """Bar Chart: Kelompok Tani vs Total Lahan"""
    try:
        query = """
            SELECT "KELOMPOK TANI" as kelompok, 
                   ROUND(SUM("TOTAL LAHAN (M2)")::numeric / 10000, 2) as total_lahan_ha
            FROM data_raw
            WHERE "KELOMPOK TANI" IS NOT NULL 
              AND "KELOMPOK TANI" != ''
              AND "TOTAL LAHAN (M2)" IS NOT NULL
              AND "TOTAL LAHAN (M2)" > 0
            GROUP BY "KELOMPOK TANI"
            ORDER BY total_lahan_ha DESC
            LIMIT 10
        """
        result = await database.fetch_all(query)
        return [
            {"kelompok": r["kelompok"], "total_lahan_ha": float(r["total_lahan_ha"])}
            for r in result
        ]
    except Exception as e:
        print(f"Error: {e}")
        return []


@router.get("/kelompok-tani-vs-populasi")
async def kelompok_tani_vs_populasi():
    """Bar Chart: Kelompok Tani vs Populasi Kopi"""
    try:
        query = """
            SELECT "KELOMPOK TANI" as kelompok, 
                   COUNT(*) as total_populasi
            FROM data_raw
            WHERE "KELOMPOK TANI" IS NOT NULL AND "KELOMPOK TANI" != ''
            GROUP BY "KELOMPOK TANI"
            ORDER BY total_populasi DESC
            LIMIT 10
        """
        result = await database.fetch_all(query)
        return [
            {"kelompok": r["kelompok"], "total_populasi": r["total_populasi"]}
            for r in result
        ]
    except Exception as e:
        print(f"Error: {e}")
        return []

from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime


# ===============================
# 👤 PETANI SCHEMAS
# ===============================
class PetaniBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    kecamatan: Optional[str] = Field(None, alias="KECAMATAN")
    desa: Optional[str] = Field(None, alias="DESA")
    dusun: Optional[str] = Field(None, alias="DUSUN")
    rt: Optional[int] = Field(None, alias="RT")
    rw: Optional[int] = Field(None, alias="RW")
    surveyor: Optional[str] = Field(None, alias="SURVEYOR")
    tgl_pendataan: Optional[str] = Field(None, alias="TGL PENDATAAN")
    pemeriksa: Optional[str] = Field(None, alias="PEMERIKSA")
    tgl_periksa: Optional[str] = Field(None, alias="TGL PERIKSA")
    nama: Optional[str] = Field(None, alias="NAMA")
    jenis_kelamin: Optional[str] = Field(None, alias="JENIS KELAMIN")
    usia: Optional[int] = Field(None, alias="USIA")
    no_hp: Optional[int] = Field(None, alias="NO HP")  # INT8
    kelompok_tani: Optional[str] = Field(None, alias="KELOMPOK TANI")
    lama_bertani: Optional[str] = Field(None, alias="LAMA BERTANI")
    total_lahan_m2: Optional[int] = Field(None, alias="TOTAL LAHAN (M2)")
    jumlah_lahan: Optional[int] = Field(None, alias="JUMLAH LAHAN")
    status_kepemilikan: Optional[str] = Field(None, alias="STATUS KEPEMILIKAN")
    jenis_kopi: Optional[str] = Field(None, alias="JENIS KOPI")
    varietas_kopi: Optional[str] = Field(None, alias="VARIETAS KOPI")
    varietas_unggul: Optional[str] = Field(None, alias="VARIETAS UNGGUL")
    populasi_kopi: Optional[str] = Field(None, alias="POPULASI KOPI")
    tanaman_lainnya: Optional[str] = Field(None, alias="TANAMAN LAINNYA")
    metode_budidaya: Optional[str] = Field(None, alias="METODE BUDIDAYA")
    pupuk: Optional[str] = Field(None, alias="PUPUK")
    sistem_irigasi: Optional[str] = Field(None, alias="SISTEM IRIGASI")
    hasil_per_tahun_kg: Optional[int] = Field(None, alias="HASIL PER TAHUN (kg)")
    panen_non_kopi: Optional[str] = Field(None, alias="PANEN NON KOPI")
    metode_panen: Optional[str] = Field(None, alias="METODE PANEN")
    metode_pengolahan: Optional[str] = Field(None, alias="METODE PENGOLAHAN")
    alat_pengolahan: Optional[str] = Field(None, alias="ALAT PENGOLAHAN")
    lama_fermentasi: Optional[str] = Field(None, alias="LAMA FERMENTASI")
    proses_pengeringan: Optional[str] = Field(None, alias="PROSES PENGERINGAN")
    bentuk_penyimpanan: Optional[str] = Field(None, alias="BENTUK PENYIMPANAN")
    kadar_air: Optional[str] = Field(None, alias="KADAR AIR")
    sistem_penyimpanan: Optional[str] = Field(None, alias="SISTEM PENYIMPANAN")
    metode_penjualan: Optional[str] = Field(None, alias="METODE PENJUALAN")
    harga_jual_per_kg: Optional[str] = Field(None, alias="HARGA JUAL PER KG")
    kemitraan: Optional[str] = Field(None, alias="KEMITRAAN")
    masalah: Optional[str] = Field(None, alias="MASALAH")
    pelatihan_yang_diperlukan: Optional[str] = Field(
        None, alias="PELATIHAN YANG DIPERLUKAN"
    )
    catatan: Optional[str] = Field(None, alias="CATATAN")

    # ===== VALIDATORS =====

    # Validator untuk field integer murni
    @field_validator(
        "rt",
        "rw",
        "usia",
        "total_lahan_m2",
        "jumlah_lahan",
        "hasil_per_tahun_kg",
        mode="before",
    )
    @classmethod
    def clean_integer_fields(cls, v):
        """Bersihkan dan konversi field integer murni"""
        if v is None or v == "" or v == "-":
            return None
        if isinstance(v, int):
            return v
        try:
            cleaned = str(v).replace(".", "").replace(",", "").strip()
            if cleaned == "" or cleaned == "-":
                return None
            return int(float(cleaned))
        except (ValueError, AttributeError, TypeError):
            return None

    # Validator untuk tanggal
    @field_validator("tgl_pendataan", "tgl_periksa", mode="before")
    @classmethod
    def clean_date_fields(cls, v):
        """Format tanggal ke dd/mm/yyyy sebagai string"""
        if v is None or v == "" or v == "-":
            return None
        try:
            v_str = str(v).strip()
            # Jika sudah format dd/mm/yyyy, return as is
            if "/" in v_str and len(v_str.split("/")) == 3:
                parts = v_str.split("/")
                if len(parts[0]) <= 2:
                    return v_str
            # Jika format yyyy-mm-dd, konversi ke dd/mm/yyyy
            if "-" in v_str:
                date_obj = datetime.strptime(v_str[:10], "%Y-%m-%d")
                return date_obj.strftime("%d/%m/%Y")
            return v_str
        except:
            return str(v) if v else None

    # Validator untuk NO HP - konversi ke INTEGER
    @field_validator("no_hp", mode="before")
    @classmethod
    def clean_phone(cls, v):
        """Bersihkan nomor HP dan konversi ke integer"""
        if v is None or v == "" or v == "-":
            return None
        # Hilangkan karakter non-digit
        cleaned = "".join(filter(str.isdigit, str(v)))
        if not cleaned:
            return None
        # Hapus prefix 0
        if cleaned.startswith("0"):
            cleaned = cleaned[1:]
        # Hapus prefix 62
        if cleaned.startswith("62"):
            cleaned = cleaned[2:]
        # Konversi ke integer
        try:
            return int(cleaned) if cleaned else None
        except ValueError:
            return None

    # Validator untuk LAMA BERTANI
    @field_validator("lama_bertani", mode="before")
    @classmethod
    def clean_lama_bertani(cls, v):
        """Format lama bertani dengan suffix 'th'"""
        if v is None or v == "" or v == "-":
            return None
        try:
            v_str = str(v).strip()
            # Jika sudah ada "th", bersihkan dan format ulang
            if "th" in v_str.lower() or "tahun" in v_str.lower():
                cleaned = (
                    v_str.lower()
                    .replace("th", "")
                    .replace("tahun", "")
                    .replace(".", "")
                    .replace(",", "")
                    .strip()
                )
                if cleaned and cleaned.isdigit():
                    return f"{int(cleaned)} th"
                return None
            # Jika hanya angka, tambahkan suffix
            cleaned = v_str.replace(".", "").replace(",", "").strip()
            if cleaned and cleaned.isdigit():
                return f"{int(cleaned)} th"
            return v_str if v_str else None
        except (ValueError, AttributeError):
            return str(v) if v else None

    # Validator untuk POPULASI KOPI
    @field_validator("populasi_kopi", mode="before")
    @classmethod
    def clean_populasi_kopi(cls, v):
        """Format populasi kopi dengan suffix 'btg' dan titik ribuan"""
        if v is None or v == "" or v == "-":
            return None
        try:
            v_str = str(v).strip()
            suffix = "btg"
            if "btg" in v_str.lower():
                cleaned = (
                    v_str.lower()
                    .replace("btg", "")
                    .replace(".", "")
                    .replace(",", "")
                    .strip()
                )
            elif "pohon" in v_str.lower():
                cleaned = (
                    v_str.lower()
                    .replace("pohon", "")
                    .replace(".", "")
                    .replace(",", "")
                    .strip()
                )
            else:
                cleaned = v_str.replace(".", "").replace(",", "").strip()

            if cleaned and cleaned.isdigit():
                num = int(cleaned)
                return f"{num:,}".replace(",", ".") + " " + suffix
            return v_str if v_str else None
        except (ValueError, AttributeError):
            return str(v) if v else None

    # Validator untuk HARGA JUAL
    @field_validator("harga_jual_per_kg", mode="before")
    @classmethod
    def clean_currency(cls, v):
        """Format harga dengan prefix Rp dan titik ribuan"""
        if v is None or v == "" or v == "-":
            return None
        try:
            cleaned = str(v).replace("Rp", "").replace(".", "").replace(",", "").strip()
            if cleaned == "" or cleaned == "-":
                return None
            num_value = int(float(cleaned))
            return f"Rp {num_value:,}".replace(",", ".")
        except (ValueError, AttributeError):
            return str(v) if v else None

    # Validator untuk JENIS KELAMIN
    @field_validator("jenis_kelamin", mode="before")
    @classmethod
    def clean_gender(cls, v):
        """Validasi jenis kelamin hanya L atau P"""
        if v is None or v == "" or v == "-":
            return None
        v_str = str(v).strip().upper()
        if v_str in ["L", "M", "LAKI-LAKI", "MALE"]:
            return "L"
        elif v_str in ["P", "PEREMPUAN", "FEMALE", "W", "WANITA"]:
            return "P"
        return v_str


class PetaniCreate(PetaniBase):
    """Schema untuk create petani (tanpa NO)"""

    pass


class Petani(PetaniBase):
    """Schema untuk response petani (dengan NO)"""

    no: int = Field(..., alias="NO")


# ===============================
# 🔐 AUTENTIKASI SCHEMAS
# ===============================
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class User(BaseModel):
    username: str


class UserInDB(User):
    hashed_password: str


# ===============================
# 💡 REKOMENDASI SCHEMAS
# ===============================
class RecommendationRequest(BaseModel):
    masalah: str
    detail_petani: Optional[Dict[str, Any]] = {}


# ===============================
# 📋 LAPORAN MASALAH SCHEMAS
# ===============================
class LaporanMasalahRequest(BaseModel):
    """Schema untuk request laporan masalah baru"""

    masalah: str
    nama_petani: str
    detail_petani: Optional[Dict[str, Any]] = None


class LaporanMasalahResponse(BaseModel):
    """Schema untuk response laporan masalah"""

    id: int
    nama_petani: str
    masalah: str
    detail_petani: Optional[Dict[str, Any]]
    status: str  # 'pending', 'valid', 'invalid'
    validated_by: Optional[str] = None
    validated_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ValidateLaporanRequest(BaseModel):
    """Schema untuk validasi laporan (admin/internal)"""

    laporan_id: int
    status: str  # 'valid' atau 'invalid'
    validator_name: str
    catatan_validator: Optional[str] = None

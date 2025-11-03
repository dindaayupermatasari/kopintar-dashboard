from datetime import datetime


def format_currency(value):
    """
    Format angka jadi Rp dengan titik ribuan.
    Input: 72000 atau "72000" atau "Rp 72.000"
    Output: "Rp 72.000"
    """
    if not value or str(value).strip() in ["-", "", "None"]:
        return "-"
    try:
        # Bersihkan dari format Rp jika sudah ada
        cleaned = str(value).replace("Rp", "").replace(".", "").replace(",", "").strip()
        if cleaned == "" or cleaned == "-":
            return "-"
        num_value = int(float(cleaned))
        return f"Rp {num_value:,}".replace(",", ".")
    except (ValueError, AttributeError):
        return str(value)


def format_number(value):
    """
    Format angka biasa pakai titik ribuan, pertahankan suffix.
    Input: 2400 atau "2400 btg" atau "2.400 btg"
    Output: "2.400 btg"
    """
    if not value or str(value).strip() in ["-", "", "None"]:
        return "-"
    try:
        value_str = str(value).strip()
        suffix = ""

        # Ekstrak suffix (misalnya "btg", "pohon")
        parts = value_str.split()
        if len(parts) > 1:
            # Ada spasi, ambil suffix dari bagian terakhir
            suffix = " " + " ".join(parts[1:])
            value_str = parts[0]
        else:
            # Tidak ada spasi, cek karakter non-digit di akhir
            i = len(value_str) - 1
            while i >= 0 and not value_str[i].isdigit():
                i -= 1
            if i < len(value_str) - 1:
                suffix = " " + value_str[i + 1 :]
                value_str = value_str[: i + 1]

        # Bersihkan angka dari format ribuan
        cleaned = value_str.replace(".", "").replace(",", "")
        if cleaned == "" or cleaned == "-":
            return "-"
        num_value = int(float(cleaned))
        return f"{num_value:,}".replace(",", ".") + suffix
    except (ValueError, AttributeError):
        return str(value)


def format_date(value):
    """
    Ubah format yyyy-mm-dd atau datetime jadi dd/mm/yyyy
    Input: "2025-12-05" atau datetime object atau "05/12/2025"
    Output: "05/12/2025"
    """
    if not value or str(value).strip() in ["-", "", "None"]:
        return "-"
    try:
        if isinstance(value, datetime):
            return value.strftime("%d/%m/%Y")

        value_str = str(value).strip()

        # Jika sudah format dd/mm/yyyy, return as is
        if "/" in value_str and len(value_str.split("/")) == 3:
            parts = value_str.split("/")
            if len(parts[0]) <= 2:  # Day di depan
                return value_str

        # Parse dari format yyyy-mm-dd
        if "-" in value_str:
            date_obj = datetime.strptime(value_str[:10], "%Y-%m-%d")
            return date_obj.strftime("%d/%m/%Y")

        return value_str
    except Exception:
        return str(value)


def parse_date_to_db(value):
    """
    Konversi format dd/mm/yyyy ke yyyy-mm-dd untuk database
    Input: "05/12/2025"
    Output: "2025-12-05"
    """
    if not value or str(value).strip() in ["-", "", "None"]:
        return None
    try:
        value_str = str(value).strip()

        # Jika sudah format yyyy-mm-dd, return as is
        if "-" in value_str:
            return value_str[:10]

        # Parse dari format dd/mm/yyyy
        if "/" in value_str:
            date_obj = datetime.strptime(value_str, "%d/%m/%Y")
            return date_obj.strftime("%Y-%m-%d")

        return value_str
    except Exception:
        return None


def clean_currency_input(value):
    """
    Bersihkan input currency dari frontend untuk disimpan ke database
    Input: "Rp 72.000" atau "72000" atau "72.000"
    Output: 72000 (integer) atau None
    """
    if not value or str(value).strip() in ["-", "", "None"]:
        return None
    try:
        cleaned = str(value).replace("Rp", "").replace(".", "").replace(",", "").strip()
        if cleaned == "" or cleaned == "-":
            return None
        return int(float(cleaned))
    except (ValueError, AttributeError):
        return None


def clean_number_input(value):
    """
    Bersihkan input number dengan suffix dari frontend
    Input: "2400 btg" atau "2.400 btg"
    Output: 2400 (integer) atau None
    """
    if not value or str(value).strip() in ["-", "", "None"]:
        return None
    try:
        value_str = str(value).strip()
        # Ambil hanya bagian numerik di awal
        parts = value_str.split()
        if parts:
            cleaned = parts[0].replace(".", "").replace(",", "")
            if cleaned and cleaned != "-":
                return int(float(cleaned))
        return None
    except (ValueError, AttributeError):
        return None


def clean_phone_number(value):
    """
    Bersihkan nomor HP untuk format database
    Input: "085646411390" atau "62 856 464 11390" atau "+62-856-464-11390"
    Output: "85646411390" (tanpa 0 dan 62 di depan)
    """
    if not value or str(value).strip() in ["-", "", "None"]:
        return None
    try:
        # Hilangkan semua karakter non-digit
        cleaned = "".join(filter(str.isdigit, str(value)))
        if not cleaned:
            return None

        # Hapus prefix 0
        if cleaned.startswith("0"):
            cleaned = cleaned[1:]

        # Hapus prefix 62 (kode negara Indonesia)
        if cleaned.startswith("62"):
            cleaned = cleaned[2:]

        return cleaned if cleaned else None
    except (ValueError, AttributeError):
        return None


def format_phone_display(value, with_country_code=False):
    if not value or str(value).strip() in ["-", "", "None"]:
        return "-"
    try:
        cleaned = str(value).strip()
        if with_country_code:
            if not cleaned.startswith("+62"):
                cleaned = "+62" + cleaned.lstrip("0")
        else:
            if not cleaned.startswith("0"):
                cleaned = "0" + cleaned
        return cleaned
    except:
        return str(value)


def safe_str(value):
    """
    Konversi value ke string dengan aman
    Input: None atau "" atau "-" atau value apapun
    Output: None untuk empty values, string untuk lainnya
    """
    if value is None:
        return None
    value_str = str(value).strip()
    if value_str in ["", "-", "None", "nan", "NaN"]:
        return None
    return value_str


def safe_int(value):
    """
    Konversi value ke integer dengan aman
    Input: "123" atau 123 atau "123.45" atau None
    Output: 123 atau None
    """
    if value is None or str(value).strip() in ["", "-", "None", "nan", "NaN"]:
        return None
    try:
        # Bersihkan dari format ribuan/currency
        cleaned = str(value).replace("Rp", "").replace(".", "").replace(",", "").strip()
        if cleaned == "" or cleaned == "-":
            return None
        return int(float(cleaned))
    except (ValueError, AttributeError):
        return None

import asyncio
from backend.database import database  # import sesuai struktur project


async def main():
    # hubungkan ke database
    await database.connect()

    # ambil semua data
    rows = await database.fetch_all("SELECT * FROM data_raw;")

    # tampilkan jumlah nilai kosong per kolom sebelum pengisian
    print("Jumlah nilai kosong per kolom:")
    for column in rows[0].keys():
        kosong = sum(1 for row in rows if row[column] in [None, ""])
        print(f"{column}: {kosong}")

    # periksa dan isi kolom teks yang kosong dengan 'TIDAK ADA'
    processed_rows = []
    for row in rows:
        row_dict = dict(row)  # ubah Record jadi dict agar bisa diedit
        for key, value in row_dict.items():
            if not isinstance(value, (int, float)) and value in [None, ""]:
                row_dict[key] = "TIDAK ADA"
        processed_rows.append(row_dict)

    # cek ulang jumlah nilai kosong setelah pengisian
    print("\nJumlah nilai kosong per kolom setelah pengisian:")
    for column in processed_rows[0].keys():
        kosong = sum(1 for row in processed_rows if row[column] in [None, ""])
        print(f"{column}: {kosong}")

    # tampilkan 5 baris pertama untuk dicek
    print("\nContoh 5 data pertama:")
    for i, row in enumerate(processed_rows[:5], start=1):
        print(f"Row {i}: {row}")

    # putuskan koneksi setelah selesai
    await database.disconnect()


if __name__ == "__main__":
    asyncio.run(main())

from typing import List
from .database import database
from .schemas import PetaniCreate

TABLE_NAME = "data_raw"


# -----------------------
# GET
# -----------------------
async def get_all_petani(skip: int = 0, limit: int = 100) -> List:
    """Ambil semua data petani dari database"""
    query = f'SELECT * FROM {TABLE_NAME} ORDER BY "NO" LIMIT :limit OFFSET :skip'
    records = await database.fetch_all(query, values={"limit": limit, "skip": skip})
    return [dict(row) for row in records]


async def get_petani_by_no(petani_no: int):
    """Ambil satu data petani berdasarkan NO"""
    query = f'SELECT * FROM {TABLE_NAME} WHERE "NO" = :no'
    row = await database.fetch_one(query, values={"no": petani_no})
    if not row:
        return None
    return dict(row)


# -----------------------
# CREATE
# -----------------------
async def create_petani(petani: PetaniCreate):
    """Tambah data petani baru"""
    # Ambil data dari Pydantic model (sudah divalidasi dan diformat oleh validators)
    data = petani.dict(by_alias=True, exclude_unset=True, exclude_none=True)

    # PENTING: Hapus kolom NO agar database generate otomatis
    data.pop("NO", None)

    if not data:
        raise ValueError("Tidak ada data valid untuk disimpan")

    # Ambil NO maksimal yang ada di database dan tambah 1
    max_no_query = f'SELECT COALESCE(MAX("NO"), 0) + 1 as next_no FROM {TABLE_NAME}'
    next_no = await database.fetch_val(max_no_query)

    # Tambahkan NO baru ke data
    data["NO"] = next_no

    # Buat query INSERT dengan semua kolom termasuk NO
    columns = [f'"{col}"' for col in data.keys()]
    placeholders = [
        f':{col.replace(" ", "_").replace("(", "").replace(")", "").replace("/", "_")}'
        for col in data.keys()
    ]

    values_for_query = {
        col.replace(" ", "_").replace("(", "").replace(")", "").replace("/", "_"): v
        for col, v in data.items()
    }

    query = f"""
        INSERT INTO {TABLE_NAME} ({', '.join(columns)})
        VALUES ({', '.join(placeholders)})
        RETURNING "NO"
    """

    new_petani_no = await database.fetch_val(query, values=values_for_query)

    # Return data yang baru dibuat
    return await get_petani_by_no(new_petani_no)


# -----------------------
# UPDATE
# -----------------------
async def update_petani(petani_no: int, petani: PetaniCreate):
    """Update data petani"""
    # Ambil data dari Pydantic model (sudah divalidasi dan diformat oleh validators)
    data = petani.dict(by_alias=True, exclude_unset=True, exclude_none=True)
    data.pop("NO", None)  # Jangan update NO

    if not data:
        return await get_petani_by_no(petani_no)

    # Buat query UPDATE
    update_fields = [
        f'"{col}" = :{col.replace(" ", "_").replace("(", "").replace(")", "").replace("/", "_")}'
        for col in data.keys()
    ]

    values_for_query = {
        col.replace(" ", "_").replace("(", "").replace(")", "").replace("/", "_"): v
        for col, v in data.items()
    }
    values_for_query["no"] = petani_no

    query = f"""
        UPDATE {TABLE_NAME}
        SET {', '.join(update_fields)}
        WHERE "NO" = :no
    """

    await database.execute(query, values=values_for_query)

    # Return data yang sudah diupdate
    return await get_petani_by_no(petani_no)


# -----------------------
# DELETE
# -----------------------
async def delete_petani(petani_no: int):
    """Hapus data petani"""
    query = f'DELETE FROM {TABLE_NAME} WHERE "NO" = :no RETURNING "NO"'
    deleted = await database.fetch_val(query, values={"no": petani_no})
    if deleted is None:
        return None
    return {"status": "deleted", "NO": deleted}

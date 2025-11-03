from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from .. import crud, schemas, auth

router = APIRouter(prefix="/petani", tags=["Petani"])


# =============================
# 🟢 GET — Bisa diakses publik
# =============================
@router.get("/", response_model=List[schemas.Petani])
async def read_all_petani(skip: int = 0, limit: int = 100):
    """Membaca semua data petani (tanpa login)."""
    return await crud.get_all_petani(skip, limit)


@router.get("/{petani_no}", response_model=schemas.Petani)
async def read_petani_by_no(petani_no: int):
    """Membaca satu data petani berdasarkan nomor (tanpa login)."""
    db_petani = await crud.get_petani_by_no(petani_no)
    if db_petani is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Petani tidak ditemukan",
        )
    return db_petani


# ==================================
# 🔒 CRUD — Hanya bisa jika login
# ==================================
@router.post(
    "/", response_model=schemas.Petani, dependencies=[Depends(auth.get_current_user)]
)
async def add_petani_data(petani: schemas.PetaniCreate):
    """Menambah data petani baru (butuh login)."""
    return await crud.create_petani(petani)


@router.put(
    "/{petani_no}",
    response_model=schemas.Petani,
    dependencies=[Depends(auth.get_current_user)],
)
async def update_petani_data(petani_no: int, petani: schemas.PetaniCreate):
    """Mengupdate data petani (butuh login)."""
    updated = await crud.update_petani(petani_no, petani)
    if not updated:
        raise HTTPException(status_code=404, detail="Petani tidak ditemukan")
    return updated


@router.delete("/{petani_no}", dependencies=[Depends(auth.get_current_user)])
async def delete_petani_data(petani_no: int):
    """Menghapus data petani (butuh login)."""
    deleted = await crud.delete_petani(petani_no)
    if not deleted:
        raise HTTPException(status_code=404, detail="Petani tidak ditemukan")
    return deleted

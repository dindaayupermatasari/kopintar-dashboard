import api from "./api";

// Ambil semua data petani
export async function getAllPetani() {
  const res = await api.get("/petani/");
  return res.data;
}

// Tambah petani baru
export async function createPetani(data: any) {
  const res = await api.post("/petani/", data);
  return res.data;
}

// Hapus petani
export async function deletePetani(id: number) {
  const res = await api.delete(`/petani/${id}`);
  return res.data;
}

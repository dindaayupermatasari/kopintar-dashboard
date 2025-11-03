import api from "./api";

// Summary
export async function getDashboardSummary() {
  try {
    const res = await api.get("/dashboard/summary");
    return res.data;
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    throw error;
  }
}

// Pie Charts
export async function getDistribusiJenisKopi() {
  try {
    const res = await api.get("/dashboard/distribusi-jenis-kopi");
    return res.data;
  } catch (error) {
    console.error("Error fetching jenis kopi:", error);
    return [];
  }
}

export async function getDistribusiMetodePanen() {
  try {
    const res = await api.get("/dashboard/distribusi-metode-panen");
    return res.data;
  } catch (error) {
    console.error("Error fetching metode panen:", error);
    return [];
  }
}

export async function getDistribusiMetodePengolahan() {
  try {
    const res = await api.get("/dashboard/distribusi-metode-pengolahan");
    return res.data;
  } catch (error) {
    console.error("Error fetching metode pengolahan:", error);
    return [];
  }
}

export async function getDistribusiProsesPengeringan() {
  try {
    const res = await api.get("/dashboard/distribusi-proses-pengeringan");
    return res.data;
  } catch (error) {
    console.error("Error fetching proses pengeringan:", error);
    return [];
  }
}

export async function getDistribusiMetodePenjualan() {
  try {
    const res = await api.get("/dashboard/distribusi-metode-penjualan");
    return res.data;
  } catch (error) {
    console.error("Error fetching metode penjualan:", error);
    return [];
  }
}

// Bar Charts
export async function getDistribusiVarietasKopi() {
  try {
    const res = await api.get("/dashboard/distribusi-varietas-kopi");
    return res.data;
  } catch (error) {
    console.error("Error fetching varietas kopi:", error);
    return [];
  }
}

export async function getKelompokTaniVsHasil() {
  try {
    const res = await api.get("/dashboard/kelompok-tani-vs-hasil");
    return res.data;
  } catch (error) {
    console.error("Error fetching kelompok vs hasil:", error);
    return [];
  }
}

export async function getKelompokTaniVsLahan() {
  try {
    const res = await api.get("/dashboard/kelompok-tani-vs-lahan");
    return res.data;
  } catch (error) {
    console.error("Error fetching kelompok vs lahan:", error);
    return [];
  }
}

export async function getKelompokTaniVsPopulasi() {
  try {
    const res = await api.get("/dashboard/kelompok-tani-vs-populasi");
    return res.data;
  } catch (error) {
    console.error("Error fetching kelompok vs populasi:", error);
    return [];
  }
}
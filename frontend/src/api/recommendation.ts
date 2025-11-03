// recommendation.ts
import api from "./api";

export interface DetailPetani {
  [key: string]: any;
}

// Fungsi untuk panggil endpoint rekomendasi
export const getRecommendation = async (
  masalah: string,
  detail_petani: DetailPetani = {}
) => {
  try {
    const response = await api.post("/analysis/recommendation", {
      masalah,
      detail_petani,
    });
    return response.data;
  } catch (err: any) {
    console.error("Error saat memanggil API rekomendasi:", err);
    throw new Error("Gagal mengambil rekomendasi dari server.");
  }
};

// Fungsi untuk submit laporan masalah - nama_petani WAJIB
export const submitLaporanMasalah = async (
  masalah: string,
  nama_petani: string,
  detail_petani: DetailPetani = {}
) => {
  try {
    const response = await api.post("/analysis/laporan-masalah", {
      masalah,
      nama_petani,
      detail_petani,
    });
    return response.data;
  } catch (err: any) {
    console.error("Error saat submit laporan:", err);
    throw new Error("Gagal menyimpan laporan ke server.");
  }
};

// Format rekomendasi dengan format yang bersih dan mudah dibaca
export const formatRecommendation = (recommendation: any): string => {
  if (!recommendation) return "❌ Tidak ada rekomendasi yang ditemukan.";

  let rec;
  
  // Parse jika berbentuk string JSON
  if (typeof recommendation === "string") {
    try {
      rec = JSON.parse(recommendation);
    } catch {
      // Jika gagal parse, kembalikan string mentah
      return recommendation;
    }
  } else {
    rec = recommendation;
  }

  const sections = [];

  // 1. Masalah Utama
  if (rec.masalah_utama) {
    sections.push(`Masalah Utama\n${rec.masalah_utama}`);
  }

  // 2. Prioritas Penanganan
  if (rec.prioritas_penanganan && Array.isArray(rec.prioritas_penanganan)) {
    const prioritas = rec.prioritas_penanganan
      .map((item, i) => `${i + 1}. ${item}`)
      .join('\n');
    sections.push(`Prioritas Penanganan:\n${prioritas}`);
  }

  // 3. Rekomendasi Pelatihan
  if (rec.rekomendasi_pelatihan && Array.isArray(rec.rekomendasi_pelatihan)) {
    const pelatihan = rec.rekomendasi_pelatihan
      .map((item, i) => {
        if (typeof item === 'object' && item.topik) {
          return `${i + 1}. ${item.topik}\n   ${item.deskripsi || ''}`;
        }
        return `${i + 1}. ${item}`;
      })
      .join('\n');
    sections.push(`Rekomendasi Pelatihan:\n${pelatihan}`);
  }

  // 4. Solusi Praktis - dengan parsing steps
  if (rec.solusi_praktis && Array.isArray(rec.solusi_praktis)) {
    const solusi = rec.solusi_praktis
      .map((item, i) => {
        if (typeof item === 'object' && item.nama_solusi) {
          const desc = item.deskripsi || '';
          
          // Pisahkan deskripsi yang berisi langkah-langkah (1. 2. 3.)
          // Replace angka di awal dengan bullet point
          const formattedDesc = desc
            .replace(/(\d+)\.\s+/g, '\n   • ')  // Ganti "1. " dengan bullet
            .trim();
          
          return `${i + 1}. ${item.nama_solusi}${formattedDesc ? '\n   ' + formattedDesc : ''}`;
        }
        return `${i + 1}. ${item}`;
      })
      .join('\n');
    sections.push(`Solusi Praktis:\n${solusi}`);
  }

  // Gabungkan semua section dengan line break yang rapi
  return sections.join('\n\n');
};
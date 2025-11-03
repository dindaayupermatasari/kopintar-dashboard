import { useState, useEffect } from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import api from "../api/api";

interface EditPetaniPageProps {
  onBack: () => void;
  petaniData: any;
}

export function EditPetaniPage({ onBack, petaniData }: EditPetaniPageProps) {
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  // Daftar kolom yang ingin ditampilkan
  const fieldList = [
    "NAMA", "JENIS KELAMIN", "USIA", "NO HP",
    "KECAMATAN", "DESA", "DUSUN", "RT", "RW",
    "SURVEYOR", "TGL PENDATAAN", "PEMERIKSA", "TGL PERIKSA",
    "KELOMPOK TANI", "LAMA BERTANI", "TOTAL LAHAN (M2)", "JUMLAH LAHAN", "STATUS KEPEMILIKAN",
    "JENIS KOPI", "VARIETAS KOPI", "VARIETAS UNGGUL", "POPULASI KOPI",
    "TANAMAN LAINNYA", "METODE BUDIDAYA", "PUPUK", "SISTEM IRIGASI",
    "HASIL PER TAHUN (kg)", "PANEN NON KOPI", "METODE PANEN",
    "METODE PENGOLAHAN", "ALAT PENGOLAHAN", "LAMA FERMENTASI",
    "PROSES PENGERINGAN", "BENTUK PENYIMPANAN", "KADAR AIR",
    "SISTEM PENYIMPANAN", "METODE PENJUALAN", "HARGA JUAL PER KG",
    "KEMITRAAN", "MASALAH", "PELATIHAN YANG DIPERLUKAN", "CATATAN"
  ];

  // Fungsi bantu untuk samakan format key
  const normalizeKey = (key: string) =>
    key.toUpperCase()
      .replaceAll("_", " ")
      .replace("(KG)", "(kg)")
      .trim();

  useEffect(() => {
    if (petaniData) {
      const normalized: any = {};

      // Normalisasi semua key dari backend
      Object.entries(petaniData).forEach(([key, val]) => {
        const normKey = normalizeKey(key);
        normalized[normKey] =
          typeof val === "object" && val !== null ? JSON.stringify(val) : val ?? "";
      });

      setFormData(normalized);
    }
  }, [petaniData]);

  const handleChange = (key: string, value: string | number) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Ambil token dari localStorage
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        alert("Anda harus login terlebih dahulu!");
        onBack();
        return;
      }

      // Normalisasi payload untuk backend
      const payload: any = {};
      
      Object.entries(formData).forEach(([key, val]) => {
        // Konversi key ke format backend (snake_case lowercase)
        const backendKey = key
          .replaceAll(" ", "_")
          .toLowerCase()
          .replace("(m2)", "(M2)")
          .replace("(kg)", "(kg)");
        
        // Handle konversi tipe data
        if (key === "USIA" || key === "JUMLAH LAHAN") {
          payload[backendKey] = val ? parseInt(val as string) : null;
        } else if (key === "TOTAL LAHAN (M2)" || key === "HASIL PER TAHUN (kg)" || key === "HARGA JUAL PER KG") {
          payload[backendKey] = val ? parseFloat(val as string) : null;
        } else {
          payload[backendKey] = val || null;
        }
      });

      // Ambil ID dari data petani (bisa dari field NO atau id)
      const petaniId = petaniData.NO || petaniData.id;

      if (!petaniId) {
        throw new Error("ID petani tidak ditemukan!");
      }

      console.log("📤 Sending payload:", payload);
      console.log("🎯 Petani ID:", petaniId);

      // Kirim PUT request dengan Authorization header
      const response = await api.put(`/petani/${petaniId}`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      console.log("✅ Response:", response.data);
      alert("✅ Data petani berhasil diperbarui!");
      onBack();
      
    } catch (err: any) {
      console.error("❌ Gagal update data petani:", err);
      
      if (err.response?.status === 401) {
        alert("Sesi login Anda telah berakhir. Silakan login kembali.");
        localStorage.removeItem("access_token");
        onBack();
      } else if (err.response?.status === 422) {
        console.error("Validation errors:", err.response.data);
        alert("Gagal menyimpan data. Periksa format input Anda.");
      } else {
        alert(`Gagal menyimpan data: ${err.response?.data?.detail || err.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!formData || Object.keys(formData).length === 0)
    return <p className="p-4">Memuat data petani...</p>;

  return (
    <div className="dark:text-gray-100 h-[82vh] overflow-y-auto">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>
        <h1 className="text-[#2d5f3f] dark:text-[#b88746] text-lg font-semibold">
          Edit Data Petani
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 bg-white dark:bg-[#242424] shadow-md border-0 mb-6 rounded-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fieldList.map((field) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field} className="capitalize text-gray-700 dark:text-gray-200">
                  {field}
                </Label>
                <Input
                  id={field}
                  value={formData[field] ?? ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="dark:bg-[#1a1a1a] dark:border-gray-700 dark:text-gray-100"
                  placeholder={`Masukkan ${field.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end gap-4 sticky bottom-0 bg-white dark:bg-[#1a1a1a] py-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={onBack}>
            <X className="w-4 h-4 mr-2" /> Batal
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="gap-2 bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59] dark:from-[#b88746] dark:to-[#d4a373] text-white hover:opacity-90"
          >
            <Save className="w-4 h-4" />
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
import { useState } from 'react';
import { ArrowLeft, Save, X, CalendarIcon } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import api from '../api/api';

interface TambahPetaniPageProps {
  onBack: () => void;
}

export function TambahPetaniPage({ onBack }: TambahPetaniPageProps) {
  const [tglPendataan, setTglPendataan] = useState<Date>();
  const [tglPeriksa, setTglPeriksa] = useState<Date>();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nama: '', usia: '', noHp: '', kecamatan: '', desa: '', dusun: '', dusunLainnya: '',
    rt: '', rtLainnya: '', rw: '', rwLainnya: '', surveyor: '', pemeriksa: '', jenisKelamin: '',
    kelompokTani: '', kelompokTaniLainnya: '', lamaBertani: '', totalLahan: '', jumlahLahan: '',
    statusKepemilikan: '', statusKepemilikanLainnya: '', jenisKopi: '', jenisKopiLainnya: '',
    varietasKopi: '', varietasKopiLainnya: '', varietasUnggul: '', varietasUnggulLainnya: '',
    populasiKopi: '', tanamanLainnya: '', tanamanLainnyaLainnya: '', metodeBudidaya: '',
    metodeBudidayaLainnya: '', pupuk: '', pupukLainnya: '', sistemIrigasi: '', sistemIrigasiLainnya: '',
    hasilPerTahun: '', panenNonKopi: '', panenNonKopiLainnya: '', metodePanen: '', metodePanenLainnya: '',
    metodePengolahan: '', metodePengolahanLainnya: '', alatPengolahan: '', alatPengolahanLainnya: '',
    lamaFermentasi: '', lamaFermentasiLainnya: '', prosesPengeringan: '', prosesPengeringanLainnya: '',
    bentukPenyimpanan: '', bentukPenyimpananLainnya: '', kadarAir: '', kadarAirLainnya: '',
    sistemPenyimpanan: '', sistemPenyimpananLainnya: '', metodePenjualan: '', metodePenjualanLainnya: '',
    hargaJualPerKg: '', kemitraan: '', kemitraanLainnya: '', masalah: '', pelatihanYangDiperlukan: '',
    catatan: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Anda harus login terlebih dahulu!");
        onBack();
        return;
      }

      const resolveValue = (mainValue: string, otherValue: string) => {
        if (mainValue === "Lainnya" && otherValue) return otherValue;
        return mainValue || null;
      };

      // Format tanggal ke format dd/mm/yyyy untuk backend
      const tglPendataanFormatted = tglPendataan
        ? format(tglPendataan, "dd/MM/yyyy")
        : null;
      const tglPeriksaFormatted = tglPeriksa
        ? format(tglPeriksa, "dd/MM/yyyy")
        : null;

      const payload = {
        KECAMATAN: formData.kecamatan || null,
        DESA: formData.desa || null,
        DUSUN: resolveValue(formData.dusun, formData.dusunLainnya),
        RT: resolveValue(formData.rt, formData.rtLainnya) ? parseInt(resolveValue(formData.rt, formData.rtLainnya)) : null,
        RW: resolveValue(formData.rw, formData.rwLainnya) ? parseInt(resolveValue(formData.rw, formData.rwLainnya)) : null,
        SURVEYOR: formData.surveyor || null,
        "TGL PENDATAAN": tglPendataanFormatted,
        PEMERIKSA: formData.pemeriksa || null,
        "TGL PERIKSA": tglPeriksaFormatted,
        NAMA: formData.nama || null,
        "JENIS KELAMIN": formData.jenisKelamin || null,
        USIA: formData.usia ? parseInt(formData.usia) : null,
        "NO HP": formData.noHp || null,
        "KELOMPOK TANI": resolveValue(formData.kelompokTani, formData.kelompokTaniLainnya),
        "LAMA BERTANI": formData.lamaBertani ? parseInt(formData.lamaBertani) : null,
        "TOTAL LAHAN (M2)": formData.totalLahan ? parseInt(formData.totalLahan) : null,
        "JUMLAH LAHAN": formData.jumlahLahan ? parseInt(formData.jumlahLahan) : null,
        "STATUS KEPEMILIKAN": resolveValue(formData.statusKepemilikan, formData.statusKepemilikanLainnya),
        "JENIS KOPI": resolveValue(formData.jenisKopi, formData.jenisKopiLainnya),
        "VARIETAS KOPI": resolveValue(formData.varietasKopi, formData.varietasKopiLainnya),
        "VARIETAS UNGGUL": resolveValue(formData.varietasUnggul, formData.varietasUnggulLainnya),
        "POPULASI KOPI": formData.populasiKopi ? parseInt(formData.populasiKopi) : null,
        "TANAMAN LAINNYA": formData.tanamanLainnya || null,
        "METODE BUDIDAYA": resolveValue(formData.metodeBudidaya, formData.metodeBudidayaLainnya),
        PUPUK: resolveValue(formData.pupuk, formData.pupukLainnya),
        "SISTEM IRIGASI": resolveValue(formData.sistemIrigasi, formData.sistemIrigasiLainnya),
        "HASIL PER TAHUN (kg)": formData.hasilPerTahun ? parseInt(formData.hasilPerTahun) : null,
        "PANEN NON KOPI": resolveValue(formData.panenNonKopi, formData.panenNonKopiLainnya),
        "METODE PANEN": resolveValue(formData.metodePanen, formData.metodePanenLainnya),
        "METODE PENGOLAHAN": resolveValue(formData.metodePengolahan, formData.metodePengolahanLainnya),
        "ALAT PENGOLAHAN": resolveValue(formData.alatPengolahan, formData.alatPengolahanLainnya),
        "LAMA FERMENTASI": resolveValue(formData.lamaFermentasi, formData.lamaFermentasiLainnya),
        "PROSES PENGERINGAN": resolveValue(formData.prosesPengeringan, formData.prosesPengeringanLainnya),
        "BENTUK PENYIMPANAN": resolveValue(formData.bentukPenyimpanan, formData.bentukPenyimpananLainnya),
        "KADAR AIR": resolveValue(formData.kadarAir, formData.kadarAirLainnya),
        "SISTEM PENYIMPANAN": resolveValue(formData.sistemPenyimpanan, formData.sistemPenyimpananLainnya),
        "METODE PENJUALAN": resolveValue(formData.metodePenjualan, formData.metodePenjualanLainnya),
        "HARGA JUAL PER KG": formData.hargaJualPerKg ? `Rp ${parseInt(formData.hargaJualPerKg).toLocaleString('id-ID')}` : null,
        KEMITRAAN: resolveValue(formData.kemitraan, formData.kemitraanLainnya),
        MASALAH: formData.masalah || null,
        "PELATIHAN YANG DIPERLUKAN": formData.pelatihanYangDiperlukan || null,
        CATATAN: formData.catatan || null,
      };

      const response = await api.post("/petani/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert("✅ Data petani berhasil ditambahkan!");
      onBack();
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert("Sesi login Anda telah berakhir. Silakan login kembali.");
        localStorage.removeItem("access_token");
        onBack();
      } else if (err.response?.status === 422) {
        console.error("Validation error:", err.response.data.detail);
        alert(
          "Gagal menyimpan data. Periksa format input Anda:\n" +
            JSON.stringify(err.response.data.detail, null, 2)
        );
      } else {
        alert(
          `Gagal menyimpan data: ${err.response?.data?.detail || err.message}`
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setTglPendataan(undefined);
    setTglPeriksa(undefined);
    setFormData({
      nama: '', usia: '', noHp: '', kecamatan: '', desa: '', dusun: '', dusunLainnya: '',
      rt: '', rtLainnya: '', rw: '', rwLainnya: '', surveyor: '', pemeriksa: '', jenisKelamin: '',
      kelompokTani: '', kelompokTaniLainnya: '', lamaBertani: '', totalLahan: '', jumlahLahan: '',
      statusKepemilikan: '', statusKepemilikanLainnya: '', jenisKopi: '', jenisKopiLainnya: '',
      varietasKopi: '', varietasKopiLainnya: '', varietasUnggul: '', varietasUnggulLainnya: '',
      populasiKopi: '', tanamanLainnya: '', tanamanLainnyaLainnya: '', metodeBudidaya: '',
      metodeBudidayaLainnya: '', pupuk: '', pupukLainnya: '', sistemIrigasi: '', sistemIrigasiLainnya: '',
      hasilPerTahun: '', panenNonKopi: '', panenNonKopiLainnya: '', metodePanen: '', metodePanenLainnya: '',
      metodePengolahan: '', metodePengolahanLainnya: '', alatPengolahan: '', alatPengolahanLainnya: '',
      lamaFermentasi: '', lamaFermentasiLainnya: '', prosesPengeringan: '', prosesPengeringanLainnya: '',
      bentukPenyimpanan: '', bentukPenyimpananLainnya: '', kadarAir: '', kadarAirLainnya: '',
      sistemPenyimpanan: '', sistemPenyimpananLainnya: '', metodePenjualan: '', metodePenjualanLainnya: '',
      hargaJualPerKg: '', kemitraan: '', kemitraanLainnya: '', masalah: '', pelatihanYangDiperlukan: '',
      catatan: '',
    });
  };

  return (
    <div className="dark:text-gray-100">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4 hover:bg-gray-100 dark:hover:bg-[#1a2e23]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Data Petani
        </Button>
        <h1 className="text-[#2d5f3f] dark:text-[#b88746] mb-2">Tambah Data Petani</h1>
        <p className="text-gray-600 dark:text-[#a3a3a3]">Lengkapi formulir di bawah untuk menambahkan data petani baru</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-8 bg-white dark:bg-[#242424] shadow-md border-0 mb-6">
          <h3 className="text-gray-900 dark:text-[#e5e5e5] mb-6">Informasi Dasar</h3>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama *</Label>
              <Input id="nama" placeholder="Contoh: Gatot" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} required className="border-gray-300 dark:border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jenisKelamin">Jenis Kelamin *</Label>
              <Select value={formData.jenisKelamin} onValueChange={(value) => setFormData({ ...formData, jenisKelamin: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih jenis kelamin" /></SelectTrigger>
                <SelectContent><SelectItem value="L">Laki-laki</SelectItem><SelectItem value="P">Perempuan</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usia">Usia</Label>
              <Input id="usia" type="number" placeholder="Contoh: 45" value={formData.usia} onChange={(e) => setFormData({ ...formData, usia: e.target.value })} className="border-gray-300 dark:border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noHp">No HP</Label>
              <Input id="noHp" type="text" placeholder="Contoh: 081234567890" value={formData.noHp} onChange={(e) => setFormData({ ...formData, noHp: e.target.value })} className="border-gray-300 dark:border-white/10" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Nomor akan disimpan tanpa awalan 0 atau +62</p>
            </div>
          </div>

          <h3 className="text-gray-900 dark:text-[#e5e5e5] mb-6 mt-8">Informasi Lokasi</h3>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="kecamatan">Kecamatan *</Label>
              <Input id="kecamatan" placeholder="Contoh: Doko" value={formData.kecamatan} onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })} required className="border-gray-300 dark:border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desa">Desa *</Label>
              <Input id="desa" placeholder="Contoh: Sumberurip" value={formData.desa} onChange={(e) => setFormData({ ...formData, desa: e.target.value })} required className="border-gray-300 dark:border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dusun">Dusun *</Label>
              <Select value={formData.dusun} onValueChange={(value) => setFormData({ ...formData, dusun: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih dusun" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sumberurip">Sumberurip</SelectItem>
                  <SelectItem value="Sumbermanggis">Sumbermanggis</SelectItem>
                  <SelectItem value="Jawai Talu">Jawai Talu</SelectItem>
                  <SelectItem value="Sumberagung">Sumberagung</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.dusun === 'Lainnya' && <Input placeholder="Sebutkan dusun lainnya" value={formData.dusunLainnya} onChange={(e) => setFormData({ ...formData, dusunLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rt">RT *</Label>
              <Select value={formData.rt} onValueChange={(value) => setFormData({ ...formData, rt: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih RT" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.rt === 'Lainnya' && <Input type="number" placeholder="Sebutkan RT lainnya" value={formData.rtLainnya} onChange={(e) => setFormData({ ...formData, rtLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rw">RW *</Label>
              <Select value={formData.rw} onValueChange={(value) => setFormData({ ...formData, rw: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih RW" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.rw === 'Lainnya' && <Input type="number" placeholder="Sebutkan RW lainnya" value={formData.rwLainnya} onChange={(e) => setFormData({ ...formData, rwLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
          </div>

          <h3 className="text-gray-900 dark:text-[#e5e5e5] mb-6 mt-8">Informasi Surveyor</h3>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="surveyor">Surveyor</Label>
              <Input id="surveyor" placeholder="Nama surveyor" value={formData.surveyor} onChange={(e) => setFormData({ ...formData, surveyor: e.target.value })} className="border-gray-300 dark:border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tglPendataan">Tanggal Pendataan</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="w-full flex items-center justify-start text-left font-normal border border-gray-300 dark:border-white/10 bg-white dark:bg-[#242424] hover:bg-gray-50 dark:hover:bg-[#1a2e23] px-3 py-2 rounded-md transition-colors">
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500 dark:text-[#a3a3a3]" />
                    <span className={tglPendataan ? "text-gray-900 dark:text-[#e5e5e5]" : "text-gray-500 dark:text-[#a3a3a3]"}>{tglPendataan ? format(tglPendataan, "PPP", { locale: id }) : "Pilih tanggal"}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 dark:bg-[#242424] dark:border-white/10">
                  <Calendar mode="single" selected={tglPendataan} onSelect={setTglPendataan} initialFocus locale={id} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pemeriksa">Pemeriksa</Label>
              <Input id="pemeriksa" placeholder="Nama pemeriksa" value={formData.pemeriksa} onChange={(e) => setFormData({ ...formData, pemeriksa: e.target.value })} className="border-gray-300 dark:border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tglPeriksa">Tanggal Periksa</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="w-full flex items-center justify-start text-left font-normal border border-gray-300 dark:border-white/10 bg-white dark:bg-[#242424] hover:bg-gray-50 dark:hover:bg-[#1a2e23] px-3 py-2 rounded-md transition-colors">
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500 dark:text-[#a3a3a3]" />
                    <span className={tglPeriksa ? "text-gray-900 dark:text-[#e5e5e5]" : "text-gray-500 dark:text-[#a3a3a3]"}>{tglPeriksa ? format(tglPeriksa, "PPP", { locale: id }) : "Pilih tanggal"}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 dark:bg-[#242424] dark:border-white/10">
                  <Calendar mode="single" selected={tglPeriksa} onSelect={setTglPeriksa} initialFocus locale={id} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <h3 className="text-gray-900 dark:text-[#e5e5e5] mb-6 mt-8">Informasi Pertanian</h3>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="kelompokTani">Kelompok Tani *</Label>
              <Select value={formData.kelompokTani} onValueChange={(value) => setFormData({ ...formData, kelompokTani: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih kelompok tani" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SBT 1">SBT 1</SelectItem>
                  <SelectItem value="SBT 2">SBT 2</SelectItem>
                  <SelectItem value="SBT 3">SBT 3</SelectItem>
                  <SelectItem value="SBT 4">SBT 4</SelectItem>
                  <SelectItem value="SBT 5">SBT 5</SelectItem>
                  <SelectItem value="SBT 6">SBT 6</SelectItem>
                  <SelectItem value="SBT 7">SBT 7</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.kelompokTani === 'Lainnya' && <Input placeholder="Sebutkan kelompok tani lainnya" value={formData.kelompokTaniLainnya} onChange={(e) => setFormData({ ...formData, kelompokTaniLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lamaBertani">Lama Bertani (tahun)</Label>
              <Input id="lamaBertani" type="number" placeholder="Contoh: 24" value={formData.lamaBertani} onChange={(e) => setFormData({ ...formData, lamaBertani: e.target.value })} className="border-gray-300 dark:border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalLahan">Total Lahan (M2)</Label>
              <Input id="totalLahan" type="number" placeholder="Contoh: 5000" value={formData.totalLahan} onChange={(e) => setFormData({ ...formData, totalLahan: e.target.value })} className="border-gray-300 dark:border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jumlahLahan">Jumlah Lahan</Label>
              <Input id="jumlahLahan" type="number" placeholder="Contoh: 2" value={formData.jumlahLahan} onChange={(e) => setFormData({ ...formData, jumlahLahan: e.target.value })} className="border-gray-300 dark:border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusKepemilikan">Status Kepemilikan</Label>
              <Select value={formData.statusKepemilikan} onValueChange={(value) => setFormData({ ...formData, statusKepemilikan: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Milik Sendiri">Milik Sendiri</SelectItem>
                  <SelectItem value="Sewa">Sewa</SelectItem>
                  <SelectItem value="Milik Keluarga">Milik Keluarga</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.statusKepemilikan === 'Lainnya' && <Input placeholder="Sebutkan status lainnya" value={formData.statusKepemilikanLainnya} onChange={(e) => setFormData({ ...formData, statusKepemilikanLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="jenisKopi">Jenis Kopi</Label>
              <Select value={formData.jenisKopi} onValueChange={(value) => setFormData({ ...formData, jenisKopi: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih jenis kopi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arabika">Arabika</SelectItem>
                  <SelectItem value="Robusta">Robusta</SelectItem>
                  <SelectItem value="Sersah">Sersah</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.jenisKopi === 'Lainnya' && <Input placeholder="Sebutkan jenis kopi lainnya" value={formData.jenisKopiLainnya} onChange={(e) => setFormData({ ...formData, jenisKopiLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="varietasKopi">Varietas Kopi </Label>
              <Input id="varietasKopi" placeholder="Contoh: Tugusari, Besuki, Sitam, BP 42" value={formData.varietasKopi} onChange={(e) => setFormData({ ...formData, varietasKopi: e.target.value })} className="border-gray-300 dark:border-white/10" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Tips: Pisahkan dengan koma untuk multiple pilihan</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="varietasUnggul">Varietas Unggul</Label>
              <Select value={formData.varietasUnggul} onValueChange={(value) => setFormData({ ...formData, varietasUnggul: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih varietas unggul" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unggul">Unggul</SelectItem>
                  <SelectItem value="Tugusari">Tugusari</SelectItem>
                  <SelectItem value="BP 38">BP 38</SelectItem>
                  <SelectItem value="Tidak ada">Tidak ada</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.varietasUnggul === 'Lainnya' && <Input placeholder="Sebutkan varietas unggul lainnya" value={formData.varietasUnggulLainnya} onChange={(e) => setFormData({ ...formData, varietasUnggulLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="populasiKopi">Populasi Kopi</Label>
              <Input id="populasiKopi" type="number" placeholder="Contoh: 2400" value={formData.populasiKopi} onChange={(e) => setFormData({ ...formData, populasiKopi: e.target.value })} className="border-gray-300 dark:border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanamanLainnya">Tanaman Lainnya </Label>
              <Input id="tanamanLainnya" placeholder="Contoh: Kelapa, Cengkeh, Rempah" value={formData.tanamanLainnya} onChange={(e) => setFormData({ ...formData, tanamanLainnya: e.target.value })} className="border-gray-300 dark:border-white/10" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Tips: Pisahkan dengan koma untuk multiple pilihan</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metodeBudidaya">Metode Budidaya</Label>
              <Select value={formData.metodeBudidaya} onValueChange={(value) => setFormData({ ...formData, metodeBudidaya: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih metode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kombinasi">Kombinasi</SelectItem>
                  <SelectItem value="Tradisional">Tradisional</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.metodeBudidaya === 'Lainnya' && <Input placeholder="Sebutkan metode lainnya" value={formData.metodeBudidayaLainnya} onChange={(e) => setFormData({ ...formData, metodeBudidayaLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pupuk">Pupuk</Label>
              <Select value={formData.pupuk} onValueChange={(value) => setFormData({ ...formData, pupuk: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih pupuk" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kombinasi">Kombinasi</SelectItem>
                  <SelectItem value="Organik">Organik</SelectItem>
                  <SelectItem value="Kimia">Kimia</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.pupuk === 'Lainnya' && <Input placeholder="Sebutkan pupuk lainnya" value={formData.pupukLainnya} onChange={(e) => setFormData({ ...formData, pupukLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sistemIrigasi">Sistem Irigasi</Label>
              <Select value={formData.sistemIrigasi} onValueChange={(value) => setFormData({ ...formData, sistemIrigasi: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih sistem" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tadah hujan">Tadah Hujan</SelectItem>
                  <SelectItem value="Kombinasi">Kombinasi</SelectItem>
                  <SelectItem value="Pompa air">Pompa Air</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.sistemIrigasi === 'Lainnya' && <Input placeholder="Sebutkan sistem lainnya" value={formData.sistemIrigasiLainnya} onChange={(e) => setFormData({ ...formData, sistemIrigasiLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hasilPerTahun">Hasil Per Tahun (kg)</Label>
              <Input id="hasilPerTahun" type="number" placeholder="Contoh: 500" value={formData.hasilPerTahun} onChange={(e) => setFormData({ ...formData, hasilPerTahun: e.target.value })} className="border-gray-300 dark:border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="panenNonKopi">Panen Non Kopi </Label>
              <Input id="panenNonKopi" placeholder="Contoh: Kelapa, Buah, Cengkeh" value={formData.panenNonKopi} onChange={(e) => setFormData({ ...formData, panenNonKopi: e.target.value })} className="border-gray-300 dark:border-white/10" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Tips: Pisahkan dengan koma untuk multiple pilihan</p>
            </div>
          </div>

          <h3 className="text-gray-900 dark:text-[#e5e5e5] mb-6 mt-8">Informasi Panen & Pengolahan</h3>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="metodePanen">Metode Panen</Label>
              <Select value={formData.metodePanen} onValueChange={(value) => setFormData({ ...formData, metodePanen: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih metode panen" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Petik Selektif">Petik Selektif</SelectItem>
                  <SelectItem value="Petik Merah">Petik Merah</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.metodePanen === 'Lainnya' && <Input placeholder="Sebutkan metode panen lainnya" value={formData.metodePanenLainnya} onChange={(e) => setFormData({ ...formData, metodePanenLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="metodePengolahan">Metode Pengolahan</Label>
              <Select value={formData.metodePengolahan} onValueChange={(value) => setFormData({ ...formData, metodePengolahan: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih metode pengolahan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Honey">Honey</SelectItem>
                  <SelectItem value="Natural">Natural</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.metodePengolahan === 'Lainnya' && <Input placeholder="Sebutkan metode pengolahan lainnya" value={formData.metodePengolahanLainnya} onChange={(e) => setFormData({ ...formData, metodePengolahanLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="alatPengolahan">Alat Pengolahan</Label>
              <Select value={formData.alatPengolahan} onValueChange={(value) => setFormData({ ...formData, alatPengolahan: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih alat" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pulper">Pulper</SelectItem>
                  <SelectItem value="Fermentasi">Fermentasi</SelectItem>
                  <SelectItem value="Tidak Punya">Tidak Punya</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.alatPengolahan === 'Lainnya' && <Input placeholder="Sebutkan alat lainnya" value={formData.alatPengolahanLainnya} onChange={(e) => setFormData({ ...formData, alatPengolahanLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lamaFermentasi">Lama Fermentasi</Label>
              <Select value={formData.lamaFermentasi} onValueChange={(value) => setFormData({ ...formData, lamaFermentasi: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih lama fermentasi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5 hari">5 hari</SelectItem>
                  <SelectItem value="10 hari">10 hari</SelectItem>
                  <SelectItem value="14 hari">14 hari</SelectItem>
                  <SelectItem value="20 hari">20 hari</SelectItem>
                  <SelectItem value="Tanpa Fermentasi">Tanpa Fermentasi</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.lamaFermentasi === 'Lainnya' && <Input placeholder="Sebutkan lama fermentasi lainnya" value={formData.lamaFermentasiLainnya} onChange={(e) => setFormData({ ...formData, lamaFermentasiLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="prosesPengeringan">Proses Pengeringan</Label>
              <Select value={formData.prosesPengeringan} onValueChange={(value) => setFormData({ ...formData, prosesPengeringan: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih proses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lantai">Lantai</SelectItem>
                  <SelectItem value="Widek">Widek</SelectItem>
                  <SelectItem value="Terpal">Terpal</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.prosesPengeringan === 'Lainnya' && <Input placeholder="Sebutkan proses lainnya" value={formData.prosesPengeringanLainnya} onChange={(e) => setFormData({ ...formData, prosesPengeringanLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bentukPenyimpanan">Bentuk Penyimpanan</Label>
              <Select value={formData.bentukPenyimpanan} onValueChange={(value) => setFormData({ ...formData, bentukPenyimpanan: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih bentuk" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sesek">Sesek</SelectItem>
                  <SelectItem value="Green Bean">Green Bean</SelectItem>
                  <SelectItem value="Gelondong">Gelondong</SelectItem>
                  <SelectItem value="Tidak Tahu">Tidak Tahu</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.bentukPenyimpanan === 'Lainnya' && <Input placeholder="Sebutkan bentuk lainnya" value={formData.bentukPenyimpananLainnya} onChange={(e) => setFormData({ ...formData, bentukPenyimpananLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="kadarAir">Kadar Air</Label>
              <Select value={formData.kadarAir} onValueChange={(value) => setFormData({ ...formData, kadarAir: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih kadar air" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tidak Tahu">Tidak Tahu</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.kadarAir === 'Lainnya' && <Input placeholder="Contoh: 12%" value={formData.kadarAirLainnya} onChange={(e) => setFormData({ ...formData, kadarAirLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sistemPenyimpanan">Sistem Penyimpanan</Label>
              <Select value={formData.sistemPenyimpanan} onValueChange={(value) => setFormData({ ...formData, sistemPenyimpanan: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih sistem" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Karung">Karung</SelectItem>
                  <SelectItem value="Plastik (iner)">Plastik (Iner)</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.sistemPenyimpanan === 'Lainnya' && <Input placeholder="Sebutkan sistem lainnya" value={formData.sistemPenyimpananLainnya} onChange={(e) => setFormData({ ...formData, sistemPenyimpananLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
          </div>

          <h3 className="text-gray-900 dark:text-[#e5e5e5] mb-6 mt-8">Informasi Penjualan</h3>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="metodePenjualan">Metode Penjualan</Label>
              <Select value={formData.metodePenjualan} onValueChange={(value) => setFormData({ ...formData, metodePenjualan: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih metode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tengkulak">Tengkulak</SelectItem>
                  <SelectItem value="Langsung">Langsung</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.metodePenjualan === 'Lainnya' && <Input placeholder="Sebutkan metode lainnya" value={formData.metodePenjualanLainnya} onChange={(e) => setFormData({ ...formData, metodePenjualanLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hargaJualPerKg">Harga Jual Per KG (Rp)</Label>
              <Input id="hargaJualPerKg" type="number" placeholder="Contoh: 72000" value={formData.hargaJualPerKg} onChange={(e) => setFormData({ ...formData, hargaJualPerKg: e.target.value })} className="border-gray-300 dark:border-white/10" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Masukkan angka saja tanpa "Rp"</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kemitraan">Kemitraan</Label>
              <Select value={formData.kemitraan} onValueChange={(value) => setFormData({ ...formData, kemitraan: value })}>
                <SelectTrigger className="border-gray-300 dark:border-white/10"><SelectValue placeholder="Pilih kemitraan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tengkulak">Tengkulak</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Koperasi">Koperasi</SelectItem>
                  <SelectItem value="Tidak Tahu">Tidak Tahu</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formData.kemitraan === 'Lainnya' && <Input placeholder="Sebutkan kemitraan lainnya" value={formData.kemitraanLainnya} onChange={(e) => setFormData({ ...formData, kemitraanLainnya: e.target.value })} className="mt-2 border-gray-300 dark:border-white/10" />}
            </div>
          </div>

          <h3 className="text-gray-900 dark:text-[#e5e5e5] mb-6 mt-8">Informasi Tambahan</h3>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="masalah">Masalah (Opsional)</Label>
              <Textarea id="masalah" placeholder="Masalah yang dihadapi petani... (contoh: Serangan hama)" value={formData.masalah} onChange={(e) => setFormData({ ...formData, masalah: e.target.value })} className="border-gray-300 dark:border-white/10 min-h-[80px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pelatihanYangDiperlukan">Pelatihan Yang Diperlukan (Opsional)</Label>
              <Textarea id="pelatihanYangDiperlukan" placeholder="Pelatihan yang dibutuhkan... (contoh: Pengendalian OPT)" value={formData.pelatihanYangDiperlukan} onChange={(e) => setFormData({ ...formData, pelatihanYangDiperlukan: e.target.value })} className="border-gray-300 dark:border-white/10 min-h-[80px]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan (Opsional)</Label>
              <Textarea id="catatan" placeholder="Catatan tambahan... (contoh: Menggunakan pupuk kimia urea)" value={formData.catatan} onChange={(e) => setFormData({ ...formData, catatan: e.target.value })} className="border-gray-300 dark:border-white/10 min-h-[80px]" />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleReset} className="gap-2 border-gray-300 dark:border-white/10" disabled={isSaving}>
            <X className="w-4 h-4" />
            Reset
          </Button>
          <Button type="submit" disabled={isSaving} className="gap-2 bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59] dark:from-[#b88746] dark:to-[#d4a373] hover:from-[#3d7050] hover:to-[#5a8c69] dark:hover:from-[#a07738] dark:hover:to-[#c49565] text-white">
            <Save className="w-4 h-4" />
            {isSaving ? 'Menyimpan...' : 'Simpan Data'}
          </Button>
        </div>
      </form>
    </div>
  );
}
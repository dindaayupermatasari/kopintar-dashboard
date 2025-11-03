import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface DetailPetaniPageProps {
  onBack: () => void;
  petaniData: any;
}

export function DetailPetaniPage({ onBack, petaniData }: DetailPetaniPageProps) {
  // Data lengkap petani (bisa diperluas sesuai kebutuhan)
  const detailData = {
    // Data Pribadi
    nama: petaniData?.nama || 'Gatot',
    jenisKelamin: 'Laki-laki',
    usia: petaniData?.usia || 46,
    
    // Lokasi
    kecamatan: 'Doko',
    desa: 'Sumberagung',
    dusun: petaniData?.dusun || 'Sumberurip',
    rt: '01',
    rw: '02',
    
    // Kontak & Administrasi
    noHp: petaniData?.noHp || '085646411390',
    surveyor: 'Ahmad Surya',
    tglPendataan: '15 Januari 2025',
    pemeriksa: 'Dr. Budi Santoso',
    tglPeriksa: '20 Januari 2025',
    
    // Kelompok Tani
    kelompokTani: petaniData?.kelompokTani || 'SBT 03',
    lamaBertani: '15 tahun',
    
    // Lahan
    totalLahan: petaniData?.lahan || '15.000',
    jumlahLahan: '3 bidang',
    statusKepemilikan: 'Milik Sendiri',
    
    // Tanaman
    jenisKopi: 'Arabika',
    varietasKopi: 'Kartika',
    varietasUnggul: 'Ya',
    populasiKopi: '1.200 pohon',
    tanamanLainnya: 'Pisang, Alpukat, Lamtoro',
    
    // Budidaya
    metodeBudidaya: 'Semi Organik',
    pupuk: 'Kompos + NPK',
    sistemIrigasi: 'Tadah Hujan',
    
    // Produksi
    hasilPerTahun: petaniData?.produksi || 680,
    panenNonKopi: 'Pisang 200kg/tahun, Alpukat 150kg/tahun',
    metodePanen: 'Selektif (Merah)',
    metodePengolahan: 'Natural',
    alatPengolahan: 'Manual + Mesin Pulper',
    lamaFermentasi: '36-48 jam',
    prosesPengeringan: 'Sinar Matahari (Terpal)',
    
    // Pasca Panen
    bentukPenyimpanan: 'Gabah Kering',
    kadarAir: '12-13%',
    sistemPenyimpanan: 'Karung di Gudang',
    
    // Pemasaran
    metodePenjualan: 'Langsung ke Tengkulak',
    hargaJualPerKg: petaniData?.harga || 'Rp 72.000',
    kemitraan: 'Tidak ada',
  };

  const sections = [
    {
      title: 'Data Pribadi',
      fields: [
        { label: 'Nama', value: detailData.nama },
        { label: 'Jenis Kelamin', value: detailData.jenisKelamin },
        { label: 'Usia', value: `${detailData.usia} tahun` },
      ]
    },
    {
      title: 'Lokasi',
      fields: [
        { label: 'Kecamatan', value: detailData.kecamatan },
        { label: 'Desa', value: detailData.desa },
        { label: 'Dusun', value: detailData.dusun },
        { label: 'RT', value: detailData.rt },
        { label: 'RW', value: detailData.rw },
      ]
    },
    {
      title: 'Kontak & Administrasi',
      fields: [
        { label: 'No HP', value: detailData.noHp },
        { label: 'Surveyor', value: detailData.surveyor },
        { label: 'Tanggal Pendataan', value: detailData.tglPendataan },
        { label: 'Pemeriksa', value: detailData.pemeriksa },
        { label: 'Tanggal Periksa', value: detailData.tglPeriksa },
      ]
    },
    {
      title: 'Kelompok Tani',
      fields: [
        { label: 'Kelompok Tani', value: detailData.kelompokTani },
        { label: 'Lama Bertani', value: detailData.lamaBertani },
      ]
    },
    {
      title: 'Informasi Lahan',
      fields: [
        { label: 'Total Lahan (M²)', value: detailData.totalLahan },
        { label: 'Jumlah Lahan', value: detailData.jumlahLahan },
        { label: 'Status Kepemilikan', value: detailData.statusKepemilikan },
      ]
    },
    {
      title: 'Tanaman Kopi',
      fields: [
        { label: 'Jenis Kopi', value: detailData.jenisKopi },
        { label: 'Varietas Kopi', value: detailData.varietasKopi },
        { label: 'Varietas Unggul', value: detailData.varietasUnggul },
        { label: 'Populasi Kopi', value: detailData.populasiKopi },
        { label: 'Tanaman Lainnya', value: detailData.tanamanLainnya },
      ]
    },
    {
      title: 'Metode Budidaya',
      fields: [
        { label: 'Metode Budidaya', value: detailData.metodeBudidaya },
        { label: 'Pupuk', value: detailData.pupuk },
        { label: 'Sistem Irigasi', value: detailData.sistemIrigasi },
      ]
    },
    {
      title: 'Produksi & Panen',
      fields: [
        { label: 'Hasil Per Tahun (kg)', value: detailData.hasilPerTahun },
        { label: 'Panen Non Kopi', value: detailData.panenNonKopi },
        { label: 'Metode Panen', value: detailData.metodePanen },
        { label: 'Metode Pengolahan', value: detailData.metodePengolahan },
        { label: 'Alat Pengolahan', value: detailData.alatPengolahan },
        { label: 'Lama Fermentasi', value: detailData.lamaFermentasi },
        { label: 'Proses Pengeringan', value: detailData.prosesPengeringan },
      ]
    },
    {
      title: 'Pasca Panen & Penyimpanan',
      fields: [
        { label: 'Bentuk Penyimpanan', value: detailData.bentukPenyimpanan },
        { label: 'Kadar Air', value: detailData.kadarAir },
        { label: 'Sistem Penyimpanan', value: detailData.sistemPenyimpanan },
      ]
    },
    {
      title: 'Pemasaran',
      fields: [
        { label: 'Metode Penjualan', value: detailData.metodePenjualan },
        { label: 'Harga Jual Per Kg', value: detailData.hargaJualPerKg },
        { label: 'Kemitraan', value: detailData.kemitraan },
      ]
    },
  ];

  return (
    <div className="dark:text-gray-100">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="gap-2 border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-[#1a2e23]"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
        <div>
          <h1 className="text-[#2d5f3f] dark:text-green-400 mb-1">Detail Data Petani</h1>
          <p className="text-sm text-gray-600 dark:text-[#a3a3a3]">
            Informasi lengkap petani kopi
          </p>
        </div>
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section, idx) => (
          <Card key={idx} className="p-6 bg-white dark:bg-[#242424] border-0 shadow-md">
            <h3 className="text-[#2d5f3f] dark:text-[#b88746] mb-4 pb-2 border-b border-gray-200 dark:border-white/10">
              {section.title}
            </h3>
            <div className="space-y-3">
              {section.fields.map((field, fieldIdx) => (
                <div key={fieldIdx} className="grid grid-cols-2 gap-4">
                  <p className="text-sm text-gray-600 dark:text-[#a3a3a3]">
                    {field.label}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-[#e5e5e5]">
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

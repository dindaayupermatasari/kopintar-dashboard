import { useState, useEffect } from "react";
import { Search, Download, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "./ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import api from "../api/api";
import { LoginDialog } from "./LoginDialog";
import * as XLSX from "xlsx";

interface DataPetaniPageProps {
  isLoggedIn: boolean;
  onLoginSuccess: () => void;
  onNavigateToTambahPetani?: () => void;
  onNavigateToEditPetani?: (petaniData: any) => void;
}

export function DataPetaniPage({
  isLoggedIn: isLoggedInProp,
  onLoginSuccess,
  onNavigateToTambahPetani,
  onNavigateToEditPetani,
}: DataPetaniPageProps) {
  const [petaniData, setPetaniData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [viewDetailData, setViewDetailData] = useState<any>(null);
  const [deleteConfirmData, setDeleteConfirmData] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isLoggedIn = isLoggedInProp;
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string; data?: any } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // === Fetch Data Petani ===
  const fetchPetani = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/petani/");
      const normalized = (res.data || []).map((item: any, index: number) => ({
        id: item["NO"] ?? index + 1,
        nama: item["NAMA"] ?? "-",
        dusun: item["DUSUN"] ?? "-",
        kelompok_tani: item["KELOMPOK TANI"] ?? "-",
        usia: item["USIA"] ?? "-",
        no_hp: item["NO HP"] ?? "-",
        luas_lahan: item["TOTAL LAHAN (M2)"] ?? "-",
        produksi: item["HASIL PER TAHUN (kg)"] ?? "-",
        harga: item["HARGA JUAL PER KG"] ?? "-",
        fullData: item,
      }));
      setPetaniData(normalized);
    } catch (error: any) {
      console.error("❌ Gagal memuat data petani:", error);
      if (error.response?.status === 401) {
        console.warn("⚠️ Unauthorized - Token mungkin expired");
        localStorage.removeItem("access_token");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPetani();
  }, []);

  // === Filter & Pagination ===
  const filteredData = petaniData.filter((p) =>
    (p.nama ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.dusun ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // === Export Handler dengan Semua Kolom ===
  const handleExport = (format: string) => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    // Urutan kolom sesuai dengan struktur lengkap
    const columnOrder = [
      "NO",
      "KECAMATAN",
      "DESA",
      "DUSUN",
      "RT",
      "RW",
      "SURVEYOR",
      "TGL PENDATAAN",
      "PEMERIKSA",
      "TGL PERIKSA",
      "NAMA",
      "JENIS KELAMIN",
      "USIA",
      "NO HP",
      "KELOMPOK TANI",
      "LAMA BERTANI",
      "TOTAL LAHAN (M2)",
      "JUMLAH LAHAN",
      "STATUS KEPEMILIKAN",
      "JENIS KOPI",
      "VARIETAS KOPI",
      "VARIETAS UNGGUL",
      "POPULASI KOPI",
      "TANAMAN LAINNYA",
      "METODE BUDIDAYA",
      "PUPUK",
      "SISTEM IRIGASI",
      "HASIL PER TAHUN (kg)",
      "PANEN NON KOPI",
      "METODE PANEN",
      "METODE PENGOLAHAN",
      "ALAT PENGOLAHAN",
      "LAMA FERMENTASI",
      "PROSES PENGERINGAN",
      "BENTUK PENYIMPANAN",
      "KADAR AIR",
      "SISTEM PENYIMPANAN",
      "METODE PENJUALAN",
      "HARGA JUAL PER KG",
      "KEMITRAAN",
      "MASALAH",
      "PELATIHAN YANG DIPERLUKAN",
      "CATATAN",
    ];

    // Transform data untuk export - gunakan fullData
    const exportData = filteredData.map((item) => {
      const row: any = {};
      columnOrder.forEach((col) => {
        row[col] = item.fullData[col] ?? "-";
      });
      return row;
    });

    switch (format) {
      case "CSV": {
        const worksheet = XLSX.utils.json_to_sheet(exportData, {
          header: columnOrder,
        });
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "data_petani_lengkap.csv";
        a.click();
        URL.revokeObjectURL(url);
        break;
      }
      case "Excel": {
        const worksheet = XLSX.utils.json_to_sheet(exportData, {
          header: columnOrder,
        });
        
        // Set column widths
        const wscols = columnOrder.map(() => ({ wch: 15 }));
        worksheet['!cols'] = wscols;
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Petani");
        XLSX.writeFile(workbook, "data_petani_lengkap.xlsx");
        break;
      }
      case "JSON": {
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "data_petani_lengkap.json";
        a.click();
        URL.revokeObjectURL(url);
        break;
      }
      default:
        alert("Format belum didukung");
    }
    setIsExportDialogOpen(false);
  };

  // === Login & CRUD Handlers ===
  const handleLoginSuccess = (token: string) => {
     console.log('✅ Login success in DataPetaniPage');
     localStorage.setItem("access_token", token);
     
     // ✅ Panggil callback dari App.tsx untuk update state
     onLoginSuccess();
     setShowLoginDialog(false);

    if (pendingAction) {
      switch (pendingAction.type) {
        case "add":
          onNavigateToTambahPetani?.();
          break;
        case "edit":
          onNavigateToEditPetani?.(pendingAction.data);
          break;
        case "delete":
          setDeleteConfirmData(pendingAction.data);
          break;
      }
      setPendingAction(null);
    }
  };

  const handleAddPetani = () => {
    if (!isLoggedIn) {
      setPendingAction({ type: "add" });
      setShowLoginDialog(true);
      return;
    }
    onNavigateToTambahPetani?.();
  };

  const handleEdit = async (f: any) => {
    if (!isLoggedIn) {
      setPendingAction({ type: "edit", data: f });
      setShowLoginDialog(true);
      return;
    }

    try {
      const res = await api.get(`/petani/${f.id}`);
      const petaniDetail = res.data;
      onNavigateToEditPetani?.(petaniDetail);
    } catch (error) {
      console.error("❌ Gagal memuat detail petani:", error);
      alert("Gagal mengambil detail petani. Coba lagi nanti.");
    }
  };

  const handleDeleteClick = (f: any) => {
    if (!isLoggedIn) {
      setPendingAction({ type: "delete", data: f });
      setShowLoginDialog(true);
      return;
    }
    setDeleteConfirmData(f);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmData) return;
    setIsDeleting(true);
    try {
      await api.delete(`/petani/${deleteConfirmData.id}`);
      await fetchPetani();
      setDeleteConfirmData(null);
    } catch {
      alert("Gagal menghapus data petani.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = (f: any) => setViewDetailData(f.fullData);

  if (isLoading) return <p className="text-center py-10">Memuat data...</p>;

  return (
    <div className="w-full max-w-full overflow-x-hidden dark:text-gray-100 px-2 sm:px-4 lg:px-6">
      {/* === HEADER === */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2d5f3f] dark:text-green-400 mb-2">Data Petani</h1>
        <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">Kelola dan pantau data petani kopi</p>
      </div>

      {/* === FILTER & ACTION === */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Bar - Flexible Width */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <Input
            placeholder="Cari Nama / Dusun"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 sm:pl-12 w-full text-xs sm:text-sm border-gray-300 dark:border-white/10 dark:bg-[#1a2e23] dark:text-[#e5e5e5] focus:border-[#2d5f3f] dark:focus:border-[#4a7c59]"
          />
        </div>

        {/* Action Buttons - Right Side */}
        <div className="flex gap-2 shrink-0">
          <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10 border-[#8b6f47] text-[#8b6f47] hover:bg-[#8b6f47] hover:text-white dark:border-[#8b6f47] dark:text-[#8b6f47] dark:hover:bg-[#8b6f47] dark:hover:text-white"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
                <span>Export</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] sm:w-full max-w-md dark:bg-[#242424] dark:border-white/10">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg dark:text-[#e5e5e5]">Export Data</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm dark:text-[#a3a3a3]">Pilih format file export</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-4">
                {["CSV", "Excel", "JSON"].map((fmt) => (
                  <Button
                    key={fmt}
                    onClick={() => handleExport(fmt)}
                    className="w-full justify-start gap-3 text-xs sm:text-sm bg-white dark:bg-[#1a2e23] text-gray-900 dark:text-[#e5e5e5] border border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#2d4a3a]"
                  >
                    <Download className="w-4 h-4" /> Export as {fmt}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleAddPetani}
            className="gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10 bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59] text-white hover:from-[#3d7050] hover:to-[#5a8c69]"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
            <span>Tambah Petani</span>
          </Button>
        </div>
      </div>

      {/* === TABLE === */}
      <Card className="w-full bg-white dark:bg-[#242424] shadow-md overflow-hidden border-0">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59] hover:from-[#2d5f3f] hover:to-[#4a7c59]">
                <TableHead className="text-white text-xs sm:text-sm whitespace-nowrap">NO</TableHead>
                <TableHead className="text-white text-xs sm:text-sm whitespace-nowrap">NAMA</TableHead>
                <TableHead className="text-white text-xs sm:text-sm whitespace-nowrap">DUSUN</TableHead>
                <TableHead className="text-white text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">KELOMPOK TANI</TableHead>
                <TableHead className="text-white text-xs sm:text-sm whitespace-nowrap">USIA</TableHead>
                <TableHead className="text-white text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">NO HP</TableHead>
                <TableHead className="text-white text-xs sm:text-sm whitespace-nowrap hidden xl:table-cell">TOTAL LAHAN (M2)</TableHead>
                <TableHead className="text-white text-xs sm:text-sm whitespace-nowrap hidden xl:table-cell">HASIL PER TAHUN (kg)</TableHead>
                <TableHead className="text-white text-xs sm:text-sm whitespace-nowrap hidden 2xl:table-cell">HARGA JUAL PER KG</TableHead>
                <TableHead className="text-white text-xs sm:text-sm text-center whitespace-nowrap">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((f, idx) => (
                <TableRow key={f.id} className={`hover:bg-green-50 dark:hover:bg-[#1a2e23] transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-[#242424]' : 'bg-gray-50 dark:bg-[#1a2e23]'}`}>
                  <TableCell className="text-gray-900 dark:text-[#e5e5e5] text-xs sm:text-sm">{startIndex + idx + 1}</TableCell>
                  <TableCell className="text-gray-900 dark:text-[#e5e5e5] text-xs sm:text-sm font-medium">{f.nama}</TableCell>
                  <TableCell className="text-gray-900 dark:text-[#e5e5e5] text-xs sm:text-sm">{f.dusun}</TableCell>
                  <TableCell className="hidden lg:table-cell text-gray-900 dark:text-[#e5e5e5] text-xs sm:text-sm">{f.kelompok_tani}</TableCell>
                  <TableCell className="text-gray-900 dark:text-[#e5e5e5] text-xs sm:text-sm">{f.usia}</TableCell>
                  <TableCell className="hidden md:table-cell text-gray-900 dark:text-[#e5e5e5] text-xs sm:text-sm">{f.no_hp}</TableCell>
                  <TableCell className="hidden xl:table-cell text-gray-900 dark:text-[#e5e5e5] text-xs sm:text-sm">{f.luas_lahan}</TableCell>
                  <TableCell className="hidden xl:table-cell text-gray-900 dark:text-[#e5e5e5] text-xs sm:text-sm">{f.produksi}</TableCell>
                  <TableCell className="hidden 2xl:table-cell text-gray-900 dark:text-[#e5e5e5] text-xs sm:text-sm">{f.harga}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1 sm:gap-2">
                      <button onClick={() => handleView(f)} title="Lihat Detail" className="p-1 sm:p-1.5 hover:bg-[#2d5f3f]/10 dark:hover:bg-[#4a7c59]/20 rounded-lg transition-colors">
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2d5f3f] dark:text-[#4a7c59]" />
                      </button>
                      <button onClick={() => handleEdit(f)} title="Edit" className="p-1 sm:p-1.5 hover:bg-[#8b6f47]/10 dark:hover:bg-[#b88746]/20 rounded-lg transition-colors">
                        <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8b6f47] dark:text-[#b88746]" />
                      </button>
                      <button onClick={() => handleDeleteClick(f)} title="Hapus" className="p-1 sm:p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* === PAGINATION === */}
      <div className="w-full mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="w-full sm:w-auto text-xs sm:text-sm border-gray-300 dark:border-white/10 dark:bg-[#1a2e23] dark:text-[#e5e5e5] dark:hover:bg-[#2d4a3a]"
        >
          Sebelumnya
        </Button>
        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          Halaman {currentPage} dari {totalPages || 1}
        </span>
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="w-full sm:w-auto text-xs sm:text-sm border-gray-300 dark:border-white/10 dark:bg-[#1a2e23] dark:text-[#e5e5e5] dark:hover:bg-[#2d4a3a]"
        >
          Selanjutnya
        </Button>
      </div>

      {/* === DIALOG LOGIN === */}
      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onLogin={handleLoginSuccess}
      />

      {/* === KONFIRMASI HAPUS === */}
      <AlertDialog open={!!deleteConfirmData} onOpenChange={() => setDeleteConfirmData(null)}>
        <AlertDialogContent className="w-[90vw] sm:w-full max-w-[420px] dark:bg-[#242424] dark:border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg dark:text-[#e5e5e5]">
              Konfirmasi Hapus Data
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm dark:text-[#a3a3a3]">
              Apakah Anda yakin ingin menghapus data petani{" "}
              <span className="font-semibold dark:text-[#e5e5e5]">
                {deleteConfirmData?.nama}
              </span>? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto text-xs sm:text-sm dark:border-white/10 dark:hover:bg-[#1a2e23]">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="w-full sm:w-auto text-xs sm:text-sm bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* === DETAIL PETANI === */}
      <Dialog open={!!viewDetailData} onOpenChange={() => setViewDetailData(null)}>
        <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-[#242424] dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg dark:text-[#e5e5e5]">Detail Data Petani</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm dark:text-[#a3a3a3]">Informasi lengkap petani kopi</DialogDescription>
          </DialogHeader>

          {viewDetailData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 text-xs sm:text-sm">
              {(() => {
                const orderedKeys = [
                  'NO', 'NAMA', "JENIS KELAMIN", "USIA", "NO HP",
                  "KECAMATAN", "DESA", "DUSUN", "RT", "RW",
                  "SURVEYOR", "TGL PENDATAAN", "PEMERIKSA", "TGL PERIKSA",
                  "KELOMPOK TANI", "LAMA BERTANI", "TOTAL LAHAN (M2)", "JUMLAH LAHAN",
                  "STATUS KEPEMILIKAN", "JENIS KOPI", "VARIETAS KOPI", "VARIETAS UNGGUL",
                  "POPULASI KOPI", "TANAMAN LAINNYA", "METODE BUDIDAYA", "PUPUK",
                  "SISTEM IRIGASI", "HASIL PER TAHUN (kg)", "PANEN NON KOPI",
                  "METODE PANEN", "METODE PENGOLAHAN", "ALAT PENGOLAHAN",
                  "LAMA FERMENTASI", "PROSES PENGERINGAN", "BENTUK PENYIMPANAN",
                  "KADAR AIR", "SISTEM PENYIMPANAN", "METODE PENJUALAN",
                  "HARGA JUAL PER KG", "KEMITRAAN", "MASALAH",
                  "PELATIHAN YANG DIPERLUKAN", "CATATAN",
                ];

                const remainingKeys = Object.keys(viewDetailData).filter(
                  (key) => !orderedKeys.includes(key)
                );

                const finalOrder = [...orderedKeys, ...remainingKeys];

                return finalOrder.map((key) => (
                  <div key={key} className="flex flex-col border-b border-gray-200 dark:border-gray-700 pb-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 text-[10px] sm:text-xs uppercase">
                      {key}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 mt-1">
                      {viewDetailData[key] !== null && viewDetailData[key] !== undefined
                        ? String(viewDetailData[key])
                        : "-"}
                    </span>
                  </div>
                ));
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
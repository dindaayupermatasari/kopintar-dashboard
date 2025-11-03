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
  onNavigateToTambahPetani?: () => void;
  onNavigateToEditPetani?: (petaniData: any) => void;
}

export function DataPetaniPage({
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

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access_token"));
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
      if (error.response?.status === 401) setIsLoggedIn(false);
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
    localStorage.setItem("access_token", token);
    setIsLoggedIn(true);
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
    <div className="dark:text-gray-100">
      {/* === HEADER === */}
      <div className="mb-8">
        <h1 className="text-[#2d5f3f] dark:text-green-400 mb-2">Data Petani</h1>
        <p className="text-gray-600 dark:text-gray-400">Kelola dan pantau data petani kopi</p>
      </div>

      {/* === FILTER & ACTION === */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Cari Nama / Dusun"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300 focus:border-[#2d5f3f]"
          />
        </div>

        <div className="flex gap-2">
          <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border-[#8b6f47] text-[#8b6f47] hover:bg-[#8b6f47] hover:text-white"
              >
                <Download className="w-4 h-4" /> Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Data</DialogTitle>
                <DialogDescription>Pilih format file export</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {["CSV", "Excel", "JSON"].map((fmt) => (
                  <Button
                    key={fmt}
                    onClick={() => handleExport(fmt)}
                    className="w-full justify-start gap-3 bg-white dark:bg-[#1a2e23] text-gray-900 dark:text-[#e5e5e5] border border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#2d4a3a]"
                  >
                    <Download className="w-4 h-4" /> Export as {fmt}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleAddPetani}
            className="gap-2 bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59] text-white hover:from-[#3d7050] hover:to-[#5a8c69]"
          >
            <Plus className="w-4 h-4" /> Tambah Petani
          </Button>
        </div>
      </div>

      {/* === TABLE === */}
      <Card className="bg-white dark:bg-[#242424] shadow-md overflow-hidden border-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59]">
              <TableHead className="text-white">NO</TableHead>
              <TableHead className="text-white">NAMA</TableHead>
              <TableHead className="text-white">DUSUN</TableHead>
              <TableHead className="text-white">KELOMPOK TANI</TableHead>
              <TableHead className="text-white">USIA</TableHead>
              <TableHead className="text-white">NO HP</TableHead>
              <TableHead className="text-white">TOTAL LAHAN (M2)</TableHead>
              <TableHead className="text-white">HASIL PER TAHUN (kg)</TableHead>
              <TableHead className="text-white">HARGA JUAL PER KG</TableHead>
              <TableHead className="text-white text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((f, idx) => (
              <TableRow key={f.id}>
                <TableCell>{startIndex + idx + 1}</TableCell>
                <TableCell>{f.nama}</TableCell>
                <TableCell>{f.dusun}</TableCell>
                <TableCell>{f.kelompok_tani}</TableCell>
                <TableCell>{f.usia}</TableCell>
                <TableCell>{f.no_hp}</TableCell>
                <TableCell>{f.luas_lahan}</TableCell>
                <TableCell>{f.produksi}</TableCell>
                <TableCell>{f.harga}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleView(f)} title="Lihat Detail">
                      <Eye className="w-4 h-4 text-[#2d5f3f] hover:text-[#4a7c59]" />
                    </button>
                    <button onClick={() => handleEdit(f)} title="Edit">
                      <Edit className="w-4 h-4 text-[#8b6f47] hover:text-[#a78a5e]" />
                    </button>
                    <button onClick={() => handleDeleteClick(f)} title="Hapus">
                      <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* === PAGINATION === */}
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Sebelumnya
        </Button>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Halaman {currentPage} dari {totalPages || 1}
        </span>
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Petani?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data petani <strong>{deleteConfirmData?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-red-500 hover:bg-red-600">
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* === DETAIL PETANI === */}
      <Dialog open={!!viewDetailData} onOpenChange={() => setViewDetailData(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Data Petani</DialogTitle>
            <DialogDescription>Informasi lengkap petani kopi</DialogDescription>
          </DialogHeader>

          {viewDetailData && (
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
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
                    <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase">
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
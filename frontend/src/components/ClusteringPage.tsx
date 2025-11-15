import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Label
} from 'recharts';
import { TrendingUp, Users, BarChart3, Lightbulb, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Mock data sebagai fallback
const MOCK_PRODUK_BUDIDAYA = {
  clustering_type: "Clustering Produktivitas dan Praktik Budidaya",
  model: "Hierarchical Clustering",
  total_petani: 20,
  clusters: [
    {
      cluster_id: 0,
      label: "Petani Expert dengan Produktivitas Sangat Tinggi",
      kategori: "Sangat Tinggi",
      petani_count: 5,
      petani_names: ["Ahmad Dahlan", "Siti Aminah", "Budi Santoso", "Dewi Lestari", "Hendra Kusuma"],
      persentase: 25,
      karakteristik: {
        avg_produktivitas_kg: 1050,
        avg_luas_lahan_m2: 3200,
        avg_lama_bertani_tahun: 18,
        avg_populasi_kopi: 550,
        metode_budidaya: "Modern",
        pupuk: "Kimia",
        metode_panen: "Selektif",
        sistem_irigasi: "Irigasi Tetes"
      }
    },
    {
      cluster_id: 1,
      label: "Petani Efisien dengan Produktivitas Tinggi",
      kategori: "Tinggi",
      petani_count: 7,
      petani_names: ["Rina Wulandari", "Yusuf Ibrahim", "Fitri Handayani"],
      persentase: 35,
      karakteristik: {
        avg_produktivitas_kg: 850,
        avg_luas_lahan_m2: 2600,
        avg_lama_bertani_tahun: 12,
        avg_populasi_kopi: 450,
        metode_budidaya: "Semi Modern",
        pupuk: "Organik",
        metode_panen: "Selektif",
        sistem_irigasi: "Tadah Hujan"
      }
    },
    {
      cluster_id: 2,
      label: "Petani Berkembang dengan Produktivitas Sedang",
      kategori: "Sedang",
      petani_count: 5,
      petani_names: ["Petani A", "Petani B", "Petani C"],
      persentase: 25,
      karakteristik: {
        avg_produktivitas_kg: 600,
        avg_luas_lahan_m2: 2000,
        avg_lama_bertani_tahun: 8,
        avg_populasi_kopi: 350,
        metode_budidaya: "Tradisional",
        pupuk: "Organik",
        metode_panen: "Manual",
        sistem_irigasi: "Tadah Hujan"
      }
    },
    {
      cluster_id: 3,
      label: "Petani Pemula dengan Produktivitas Rendah",
      kategori: "Rendah",
      petani_count: 3,
      petani_names: ["Petani D", "Petani E"],
      persentase: 15,
      karakteristik: {
        avg_produktivitas_kg: 400,
        avg_luas_lahan_m2: 1500,
        avg_lama_bertani_tahun: 5,
        avg_populasi_kopi: 250,
        metode_budidaya: "Tradisional",
        pupuk: "Manual",
        metode_panen: "Manual",
        sistem_irigasi: "Tadah Hujan"
      }
    }
  ]
};

const MOCK_PROFIL_PASAR = {
  clustering_type: "Clustering Profil Petani dan Pemasaran",
  model: "Hierarchical Clustering",
  total_petani: 20,
  clusters: [
    {
      cluster_id: 0,
      label: "Petani Berpengalaman dengan Pasar Premium",
      kategori: "Premium",
      petani_count: 6,
      petani_names: ["Ahmad Dahlan", "Siti Aminah", "Budi Santoso"],
      persentase: 30,
      karakteristik: {
        avg_harga_jual: 95000,
        lama_fermentasi: "24 jam",
        proses_pengeringan: "Dijemur",
        metode_penjualan: "Langsung ke Eksportir",
        bentuk_penyimpanan: "Biji Kering",
        sistem_penyimpanan: "Gudang Khusus",
        metode_pengolahan: "Washed Process"
      }
    },
    {
      cluster_id: 1,
      label: "Petani Modern dengan Pasar Menengah",
      kategori: "Menengah",
      petani_count: 8,
      petani_names: ["Dewi Lestari", "Hendra Kusuma"],
      persentase: 40,
      karakteristik: {
        avg_harga_jual: 85000,
        lama_fermentasi: "18 jam",
        proses_pengeringan: "Dijemur",
        metode_penjualan: "Kolektor",
        bentuk_penyimpanan: "Biji Kering",
        sistem_penyimpanan: "Karung",
        metode_pengolahan: "Natural"
      }
    },
    {
      cluster_id: 2,
      label: "Petani Produktif dengan Pasar Lokal",
      kategori: "Lokal",
      petani_count: 6,
      petani_names: ["Rina Wulandari", "Yusuf Ibrahim"],
      persentase: 30,
      karakteristik: {
        avg_harga_jual: 75000,
        lama_fermentasi: "12 jam",
        proses_pengeringan: "Dijemur",
        metode_penjualan: "Pasar Lokal",
        bentuk_penyimpanan: "Biji Basah",
        sistem_penyimpanan: "Karung",
        metode_pengolahan: "Tradisional"
      }
    }
  ]
};

interface Karakteristik {
  avg_produktivitas_kg?: number;
  avg_luas_lahan_m2?: number;
  avg_lama_bertani_tahun?: number;
  avg_populasi_kopi?: number;
  metode_budidaya?: string;
  pupuk?: string;
  metode_panen?: string;
  sistem_irigasi?: string;
  avg_harga_jual?: number;
  lama_fermentasi?: string;
  proses_pengeringan?: string;
  metode_penjualan?: string;
  bentuk_penyimpanan?: string;
  sistem_penyimpanan?: string;
  metode_pengolahan?: string;
}

interface Cluster {
  cluster_id: number;
  label: string;
  kategori: string;
  petani_count: number;
  petani_names?: string[];
  persentase: number;
  karakteristik: Karakteristik;
}

interface ClusteringData {
  clustering_type: string;
  model: string;
  total_petani: number;
  clusters: Cluster[];
  params?: {
    n_clusters: number;
    linkage: string;
  };
}

export function ClusteringPage() {
  const [produkBudidaya, setProdukBudidaya] = useState<ClusteringData | null>(null);
  const [profilPasar, setProfilPasar] = useState<ClusteringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClusteringData();
  }, []);

  const fetchClusteringData = async () => {
    try {
      setLoading(true);
      setError(null);

      try {
        // Try to fetch from API
        const produkRes = await fetch(`${API_BASE_URL}/analysis/cluster-produk-budidaya`);
        if (!produkRes.ok) throw new Error('API not available');
        const produkData = await produkRes.json();
        setProdukBudidaya(produkData);

        const pasarRes = await fetch(`${API_BASE_URL}/analysis/cluster-profil-pasar`);
        if (!pasarRes.ok) throw new Error('API not available');
        const pasarData = await pasarRes.json();
        setProfilPasar(pasarData);
        
        console.log('✅ Data loaded from API');
      } catch (apiError) {
        // Fallback to mock data if API fails
        console.warn('⚠️ API not available, using mock data');
        setProdukBudidaya(MOCK_PRODUK_BUDIDAYA);
        setProfilPasar(MOCK_PROFIL_PASAR);
      }

    } catch (err) {
      console.error('Error fetching clustering data:', err);
      // Use mock data even on error
      setProdukBudidaya(MOCK_PRODUK_BUDIDAYA);
      setProfilPasar(MOCK_PROFIL_PASAR);
    } finally {
      setLoading(false);
    }
  };

  const getDistribusiData = (clusters: Cluster[] | undefined) => {
    if (!clusters) return [];
    return clusters.map((c, idx) => ({
      name: `C${c.cluster_id}`,
      clusterId: c.cluster_id,
      value: c.petani_count,
      fill: COLORS[idx % COLORS.length]
    }));
  };

  const getDistribusiDataPasar = (clusters: Cluster[] | undefined) => {
    if (!clusters) return [];
    return clusters.map((c, idx) => ({
      name: `C${c.cluster_id}`,
      clusterId: c.cluster_id,
      value: c.petani_count,
      fill: COLORS_BROWN[idx % COLORS_BROWN.length]
    }));
  };

  // Custom tooltip untuk bar chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#242424] border border-gray-300 dark:border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-gray-900 dark:text-[#e5e5e5] font-medium text-xs sm:text-sm">
            Cluster {data.clusterId}: {data.value} Petani
          </p>
        </div>
      );
    }
    return null;
  };

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const COLORS = ['#2d5f3f', '#4a7c59', '#5a8c69', '#7aa084'];
  const COLORS_BROWN = ['#8b6f47', '#a78a5e', '#b88746', '#d4a373'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#2d5f3f]" />
          <p className="text-sm sm:text-base text-gray-600 dark:text-[#a3a3a3]">Memuat data clustering...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalPetani = produkBudidaya?.total_petani || 0;
  const totalClustersProduk = produkBudidaya?.clusters.length || 0;
  const totalClustersPasar = profilPasar?.clusters.length || 0;
  const distribusiProduk = getDistribusiData(produkBudidaya?.clusters);
  const distribusiPasar = getDistribusiDataPasar(profilPasar?.clusters);

  return (
    <div className="w-full dark:text-gray-100 space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6">
      {/* Header - Responsive */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2d5f3f] dark:text-[#b88746] mb-2">
          Analisis Clustering Petani Kopi
        </h1>
        <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-[#a3a3a3]">
          Hasil clustering menggunakan Machine Learning untuk segmentasi petani
        </p>
      </div>

      {/* Summary Cards - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] text-white border-0 shadow-lg">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-white/20 rounded-lg shrink-0">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-white/80 text-[10px] sm:text-xs md:text-sm">Total Clusters</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold truncate">{totalClustersProduk + totalClustersPasar}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 bg-gradient-to-br from-[#8b6f47] to-[#a78a5e] text-white border-0 shadow-lg">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-white/20 rounded-lg shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-white/80 text-[10px] sm:text-xs md:text-sm">Total Petani</p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold truncate">{totalPetani}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 bg-white dark:bg-[#242424] border-0 shadow-lg">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 dark:text-[#a3a3a3] text-[10px] sm:text-xs md:text-sm">Model Produk</p>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-900 dark:text-[#e5e5e5] font-medium truncate">{produkBudidaya?.model || 'N/A'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 bg-white dark:bg-[#242424] border-0 shadow-lg">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg shrink-0">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 md:w-6 md:h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 dark:text-[#a3a3a3] text-[10px] sm:text-xs md:text-sm">Model Pasar</p>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-900 dark:text-[#e5e5e5] font-medium truncate">{profilPasar?.model || 'N/A'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* CLUSTERING 1: PRODUKTIVITAS DAN PRAKTIK BUDAYA */}
      <Card className="p-3 sm:p-4 md:p-6 lg:p-8 bg-white dark:bg-[#242424] shadow-xl border-0">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-[#e5e5e5]">
                {produkBudidaya?.clustering_type || 'Clustering Produktivitas dan Praktik Budaya'}
              </h2>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-[#a3a3a3]">
                Analisis berdasarkan hasil panen, lahan, dan metode budidaya
              </p>
            </div>
          </div>
        </div>

        {/* Bar Chart - Responsive */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-[#e5e5e5] mb-2 sm:mb-3">Distribusi Cluster</h3>
          <Card className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-green-50 to-amber-50 dark:from-[#1a2e23] dark:to-[#2d4a3a] border border-[#2d5f3f]/20 dark:border-white/10">
            <div className="w-full" style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribusiProduk} margin={{ top: 20, right: 10, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#fff' }} 
                    stroke="#fff"
                  >
                    <Label 
                      value="Cluster" 
                      offset={-10} 
                      position="insideBottom" 
                      className="fill-[#2d5f3f] dark:fill-white"
                      style={{ fontSize: '11px', fontWeight: '600' }}
                    />
                  </XAxis>
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#fff' }} 
                    stroke="#fff"
                    width={40}
                  >
                    <Label 
                      value="Jumlah Petani" 
                      angle={-90} 
                      position="insideLeft" 
                      className="fill-[#2d5f3f] dark:fill-white"
                      style={{ fontSize: '11px', fontWeight: '600', textAnchor: 'middle' }}
                    />
                  </YAxis>
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#2d5f3f" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Tabel Karakteristik - Horizontal Scroll FIXED */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-[#e5e5e5] mb-2 sm:mb-3">Karakteristik Cluster</h3>
          
          <div className="-mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="overflow-hidden border border-gray-200 dark:border-white/10 rounded-lg shadow-md">
                  <table className="min-w-full border-collapse" style={{ minWidth: '900px' }}>
                    <thead>
                      <tr className="bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59]">
                        <th className="text-white font-semibold text-left px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs whitespace-nowrap sticky left-0 z-20 bg-[#2d5f3f] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">Cluster</th>
                        <th className="text-white font-semibold text-left px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs whitespace-nowrap sticky left-[60px] sm:left-[75px] z-20 bg-[#2d5f3f] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] min-w-[180px]">Label</th>
                        <th className="text-white font-semibold text-center px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs whitespace-nowrap min-w-[70px]">Petani</th>
                        <th className="text-white font-semibold text-center px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs bg-green-700 whitespace-nowrap min-w-[100px]">Hasil/Tahun</th>
                        <th className="text-white font-semibold text-center px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs whitespace-nowrap min-w-[100px]">Luas Lahan</th>
                        <th className="text-white font-semibold text-center px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs whitespace-nowrap min-w-[130px]">Metode Budidaya</th>
                        <th className="text-white font-semibold text-center px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs whitespace-nowrap min-w-[90px]">Pupuk</th>
                        <th className="text-white font-semibold text-center px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs whitespace-nowrap min-w-[120px]">Metode Panen</th>
                        <th className="text-white font-semibold text-center px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs whitespace-nowrap min-w-[100px]">Lama Bertani</th>
                        <th className="text-white font-semibold text-center px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs whitespace-nowrap min-w-[110px]">Populasi Kopi</th>
                        <th className="text-white font-semibold text-center px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs whitespace-nowrap min-w-[120px]">Sistem Irigasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produkBudidaya?.clusters.map((cluster, index) => (
                        <tr key={cluster.cluster_id} className={index % 2 === 0 ? 'bg-white dark:bg-[#242424]' : 'bg-gray-50 dark:bg-[#1a2e23]'}>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap sticky left-0 z-10 bg-inherit shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            <div className="flex items-center justify-center">
                              <Badge className="bg-[#2d5f3f] dark:bg-[#4a7c59] hover:bg-[#2d5f3f] text-white text-[10px] px-2 py-1 min-w-[28px] text-center">
                                {cluster.cluster_id}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs text-gray-900 dark:text-[#e5e5e5] font-medium sticky left-[60px] sm:left-[75px] z-10 bg-inherit shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{cluster.label}</td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.petani_count}</td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs text-center bg-green-50 dark:bg-green-900/20 font-bold text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">
                            {formatNumber(cluster.karakteristik.avg_produktivitas_kg || 0)} kg
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">
                            {formatNumber(cluster.karakteristik.avg_luas_lahan_m2 || 0)} m²
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs text-center bg-green-50 dark:bg-green-900/20 font-bold text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">
                            {cluster.karakteristik.metode_budidaya || 'N/A'}
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.karakteristik.pupuk || 'N/A'}</td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.karakteristik.metode_panen || 'N/A'}</td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">
                            {formatNumber(cluster.karakteristik.avg_lama_bertani_tahun || 0)} th
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">
                            {formatNumber(cluster.karakteristik.avg_populasi_kopi || 0)}
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.karakteristik.sistem_irigasi || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insight Cards - Responsive */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-[#e5e5e5] mb-3 sm:mb-4 flex items-center gap-2">
            <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-500 shrink-0" />
            Daftar Petani dan Insight per Cluster
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {produkBudidaya?.clusters.map((cluster) => (
              <Card key={cluster.cluster_id} className="overflow-hidden border-2 border-gray-200 dark:border-white/10 hover:border-[#2d5f3f] dark:hover:border-[#4a7c59] transition-all">
                <div className="bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59] p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-white text-[#2d5f3f] hover:bg-white text-xs sm:text-sm px-2 sm:px-3 py-1">
                        Cluster {cluster.cluster_id}
                      </Badge>
                      <h4 className="text-white font-semibold text-sm sm:text-base md:text-lg">{cluster.label}</h4>
                    </div>
                    <Badge className="bg-white/20 text-white hover:bg-white/20 border-white/40 text-xs sm:text-sm px-2 sm:px-3 py-1 w-fit">
                      {cluster.petani_count} Petani
                    </Badge>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 md:p-6 bg-white dark:bg-[#242424]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <h5 className="font-bold text-gray-800 dark:text-[#e5e5e5] mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2d5f3f] shrink-0" />
                        Daftar Petani:
                      </h5>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {cluster.petani_names && cluster.petani_names.length > 0 ? (
                          cluster.petani_names.map((name, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px] sm:text-xs px-2 py-1">
                              {name}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">Data tidak tersedia</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-bold text-gray-800 dark:text-[#e5e5e5] mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm">
                        <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                        Interpretasi & Insight:
                      </h5>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg p-2 sm:p-3">
                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-800 dark:text-[#d4d4d4] leading-relaxed">
                          {getInsightProduk(cluster.label, cluster.karakteristik.avg_produktivitas_kg || 0, cluster.karakteristik.metode_budidaya || 'N/A')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      {/* CLUSTERING 2: PROFIL PETANI DAN PEMASARAN */}
      <Card className="p-3 sm:p-4 md:p-6 lg:p-8 bg-white dark:bg-[#242424] shadow-xl border-0">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#8b6f47] to-[#a78a5e] rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-[#e5e5e5]">
                {profilPasar?.clustering_type || 'Clustering Profil Petani dan Pemasaran'}
              </h2>
              <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-[#a3a3a3]">
                Analisis berdasarkan profil petani dan strategi pemasaran
              </p>
            </div>
          </div>
        </div>

        {/* Bar Chart - Responsive */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-[#e5e5e5] mb-2 sm:mb-3">Distribusi Cluster</h3>
          <Card className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#2d2416] dark:to-[#3d3426] border border-[#8b6f47]/20 dark:border-white/10">
            <div className="w-full" style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribusiPasar} margin={{ top: 20, right: 10, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#fff' }} 
                    stroke="#fff"
                  >
                    <Label 
                      value="Cluster" 
                      offset={-10} 
                      position="insideBottom" 
                      className="fill-[#8b6f47] dark:fill-white"
                      style={{ fontSize: '11px', fontWeight: '600' }}
                    />
                  </XAxis>
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#fff' }} 
                    stroke="#fff"
                    width={40}
                  >
                    <Label 
                      value="Jumlah Petani" 
                      angle={-90} 
                      position="insideLeft" 
                      className="fill-[#8b6f47] dark:fill-white"
                      style={{ fontSize: '11px', fontWeight: '600', textAnchor: 'middle' }}
                    />
                  </YAxis>
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#8b6f47" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Tabel Karakteristik - Horizontal Scroll FIXED */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-[#e5e5e5] mb-2 sm:mb-3">Karakteristik Cluster</h3>
          
          <div className="-mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
                  <table className="min-w-full border-collapse bg-white dark:bg-[#242424]" style={{ minWidth: '1100px' }}>
                    <thead>
                      <tr className="bg-gradient-to-r from-[#8b6f47] to-[#a78a5e]">
                        <th className="text-white font-semibold text-left px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs whitespace-nowrap sticky left-0 z-20 bg-[#8b6f47] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">Cluster</th>
                        <th className="text-white font-semibold text-left px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs whitespace-nowrap sticky left-[60px] sm:left-[75px] z-20 bg-[#8b6f47] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] min-w-[180px]">Label</th>
                        <th className="text-white font-semibold text-center px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs whitespace-nowrap min-w-[70px]">Petani</th>
                        <th className="text-white font-semibold text-center px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs bg-amber-700 whitespace-nowrap min-w-[100px]">Harga Jual</th>
                        <th className="text-white font-semibold text-center px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs whitespace-nowrap min-w-[130px]">Metode Penjualan</th>
                        <th className="text-white font-semibold text-center px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs bg-amber-700 whitespace-nowrap min-w-[130px]">Metode Pengolahan</th>
                        <th className="text-white font-semibold text-center px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs whitespace-nowrap min-w-[120px]">Lama Fermentasi</th>
                        <th className="text-white font-semibold text-center px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs whitespace-nowrap min-w-[130px]">Proses Pengeringan</th>
                        <th className="text-white font-semibold text-center px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs whitespace-nowrap min-w-[130px]">Bentuk Penyimpanan</th>
                        <th className="text-white font-semibold text-center px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs whitespace-nowrap min-w-[130px]">Sistem Penyimpanan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profilPasar?.clusters.map((cluster, index) => (
                        <tr key={cluster.cluster_id} className={index % 2 === 0 ? 'bg-white dark:bg-[#242424]' : 'bg-amber-50/30 dark:bg-[#2d2416]'}>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap sticky left-0 z-10 bg-inherit shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            <div className="flex items-center justify-center">
                              <Badge className="bg-[#8b6f47] dark:bg-[#a78a5e] hover:bg-[#8b6f47] text-white text-[10px] px-2 py-1 min-w-[28px] text-center">
                                {cluster.cluster_id}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs text-gray-900 dark:text-[#e5e5e5] font-medium sticky left-[60px] sm:left-[75px] z-10 bg-inherit shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{cluster.label}</td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.petani_count}</td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs text-center bg-amber-100 dark:bg-amber-900/20 font-bold text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">
                            Rp {formatNumber(cluster.karakteristik.avg_harga_jual || 0)}
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.karakteristik.metode_penjualan || 'N/A'}</td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs text-center bg-amber-100 dark:bg-amber-900/20 font-bold text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">
                            {cluster.karakteristik.metode_pengolahan || 'N/A'}
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.karakteristik.lama_fermentasi || 'N/A'}</td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.karakteristik.proses_pengeringan || 'N/A'}</td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.karakteristik.bentuk_penyimpanan || 'N/A'}</td>
                          <td className="px-2 sm:px-3 py-2 sm:py-3 text-[10px] sm:text-xs text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.karakteristik.sistem_penyimpanan || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insight Cards - Responsive */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-[#e5e5e5] mb-3 sm:mb-4 flex items-center gap-2">
            <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-500 shrink-0" />
            Daftar Petani dan Insight per Cluster
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {profilPasar?.clusters.map((cluster) => (
              <Card key={cluster.cluster_id} className="overflow-hidden border-2 border-gray-200 dark:border-white/10 hover:border-[#8b6f47] dark:hover:border-[#a78a5e] transition-all">
                <div className="bg-gradient-to-r from-[#8b6f47] to-[#a78a5e] p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-white text-[#8b6f47] hover:bg-white text-xs sm:text-sm px-2 sm:px-3 py-1">
                        Cluster {cluster.cluster_id}
                      </Badge>
                      <h4 className="text-white font-semibold text-sm sm:text-base md:text-lg">{cluster.label}</h4>
                    </div>
                    <Badge className="bg-white/20 text-white hover:bg-white/20 border-white/40 text-xs sm:text-sm px-2 sm:px-3 py-1 w-fit">
                      {cluster.petani_count} Petani
                    </Badge>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 md:p-6 bg-white dark:bg-[#242424]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <h5 className="font-bold text-gray-800 dark:text-[#e5e5e5] mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8b6f47] shrink-0" />
                        Daftar Petani:
                      </h5>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {cluster.petani_names && cluster.petani_names.length > 0 ? (
                          cluster.petani_names.map((name, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px] sm:text-xs px-2 py-1 border-amber-300">
                              {name}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">Data tidak tersedia</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-bold text-gray-800 dark:text-[#e5e5e5] mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm">
                        <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                        Interpretasi & Insight:
                      </h5>
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-500 dark:border-amber-400 rounded-r-lg p-2 sm:p-3">
                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-800 dark:text-[#d4d4d4] leading-relaxed">
                          {getInsightPasar(cluster.label, cluster.karakteristik.avg_harga_jual || 0, cluster.karakteristik.metode_penjualan || 'N/A', cluster.karakteristik.metode_pengolahan || 'N/A')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Helper functions untuk generate insight
function getInsightProduk(label: string, avgProduksi: number, metodeBudidaya: string): string {
  if (label.includes('Expert') || label.includes('Sangat Tinggi')) {
    return `Kelompok petani yang sudah expert dan produktivitas sangat tinggi menunjukkan kinerja luar biasa dengan hasil rata-rata sekitar ${avgProduksi.toFixed(0)} kg per tahun. Mayoritas menggunakan metode budidaya ${metodeBudidaya}, dengan pengalaman bertani puluhan tahun dan manajemen lahan yang efisien.`;
  } 
  else if (label.includes('Efisien') || label.includes('Tinggi')) {
    return `Kelompok petani efisien memiliki produktivitas yang solid (${avgProduksi.toFixed(0)} kg/tahun) meskipun dengan luas lahan relatif kecil. Penggunaan metode budidaya ${metodeBudidaya} menunjukkan orientasi pada efisiensi dan keberlanjutan.`;
  } 
  else if (label.includes('Berkembang') || label.includes('Sedang')) {
    return `Kelompok petani sudah berkembang dan produktivitas stabil mencerminkan petani yang sudah mulai adaptif terhadap praktik modern dengan hasil sekitar ${avgProduksi.toFixed(0)} kg/tahun.`;
  } 
  else if (label.includes('Pemula') || label.includes('Rendah')) {
    return `Kelompok petani yang masih pemula dan produktivitas rendah masih menghadapi tantangan dalam peningkatan hasil panen (rata-rata ${avgProduksi.toFixed(0)} kg/tahun).`;
  } 
  else {
    return `Kelompok petani ini memiliki karakteristik unik dengan hasil rata-rata ${avgProduksi.toFixed(0)} kg per tahun menggunakan metode ${metodeBudidaya}.`;
  }
}

function getInsightPasar(label: string, avgHarga: number, metodePenjualan: string, metodePengolahan: string): string {
  if (label.includes('Berpengalaman') || label.includes('Premium')) {
    return `Kelompok petani berpengalaman yang sudah mampu menjangkau pasar premium dengan rata-rata harga jual Rp ${avgHarga.toFixed(0)}/kg. Umumnya menggunakan metode penjualan ${metodePenjualan} dengan pengolahan ${metodePengolahan} yang terstandarisasi.`;
  } else if (label.includes('Modern') || label.includes('Menengah')) {
    return `Kelompok petani modern dengan harga jual semi-premium sekitar Rp ${avgHarga.toFixed(0)}/kg. Mereka menerapkan metode penjualan ${metodePenjualan} dan pengolahan ${metodePengolahan} yang cukup efisien.`;
  } else if (label.includes('Produktif') || label.includes('Lokal')) {
    return `Kelompok petani konvensional yang masih berfokus pada pasar lokal dengan rata-rata harga jual Rp ${avgHarga.toFixed(0)}/kg. Umumnya menggunakan metode penjualan ${metodePenjualan} dan pengolahan ${metodePengolahan}.`;
  } else {
    return `Cluster ini belum terklasifikasi secara spesifik. Diperlukan analisis lebih lanjut untuk menentukan karakteristik petani.`;
  }
}
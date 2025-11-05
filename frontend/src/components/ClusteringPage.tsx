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
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { TrendingUp, Users, BarChart3, Lightbulb, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const API_BASE_URL = 'http://127.0.0.1:8000';

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

      const produkRes = await fetch(`${API_BASE_URL}/analysis/cluster-produk-budidaya`);
      if (!produkRes.ok) throw new Error('Gagal mengambil data produk budidaya');
      const produkData = await produkRes.json();
      setProdukBudidaya(produkData);

      const pasarRes = await fetch(`${API_BASE_URL}/analysis/cluster-profil-pasar`);
      if (!pasarRes.ok) throw new Error('Gagal mengambil data profil pasar');
      const pasarData = await pasarRes.json();
      setProfilPasar(pasarData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      console.error('Error fetching clustering data:', err);
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
          <p className="text-gray-900 dark:text-[#e5e5e5] font-medium">
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
          <p className="text-gray-600 dark:text-[#a3a3a3]">Memuat data clustering...</p>
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
    <div className="w-full max-w-full overflow-x-hidden dark:text-gray-100 space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6">
      {/* Header - Responsive */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2d5f3f] dark:text-[#b88746] mb-2">
          Analisis Clustering Petani Kopi
        </h1>
        <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-[#a3a3a3]">
          Hasil clustering menggunakan Machine Learning untuk segmentasi petani
        </p>
      </div>

      {/* Summary Cards - Full Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] text-white border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-white/20 rounded-lg shrink-0">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-white/80 text-xs sm:text-sm">Total Clusters</p>
              <p className="text-xl sm:text-2xl font-bold truncate">{totalClustersProduk + totalClustersPasar}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-[#8b6f47] to-[#a78a5e] text-white border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-white/20 rounded-lg shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-white/80 text-xs sm:text-sm">Total Petani</p>
              <p className="text-xl sm:text-2xl font-bold truncate">{totalPetani}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-[#242424] border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/20 rounded-lg shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 dark:text-[#a3a3a3] text-xs sm:text-sm">Model Produk</p>
              <p className="text-sm sm:text-base lg:text-lg text-gray-900 dark:text-[#e5e5e5] font-medium truncate">{produkBudidaya?.model || 'N/A'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-[#242424] border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg shrink-0">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 dark:text-[#a3a3a3] text-xs sm:text-sm">Model Pasar</p>
              <p className="text-sm sm:text-base lg:text-lg text-gray-900 dark:text-[#e5e5e5] font-medium truncate">{profilPasar?.model || 'N/A'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* CLUSTERING 1: PRODUKTIVITAS DAN PRAKTIK BUDAYA */}
      <Card className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-[#242424] shadow-xl border-0 overflow-hidden">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] rounded-xl flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-[#e5e5e5]">
                {produkBudidaya?.clustering_type || 'Clustering Produktivitas dan Praktik Budaya'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3]">
                Analisis berdasarkan hasil panen, lahan, dan metode budidaya
              </p>
            </div>
          </div>
        </div>

        {/* Distribusi Cluster - Bar Chart Only */}
        <div className="mb-6">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-[#e5e5e5] mb-3">Distribusi Cluster</h3>
          <Card className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-amber-50 dark:from-[#1a2e23] dark:to-[#2d4a3a] border border-[#2d5f3f]/20 dark:border-white/10">
            <ResponsiveContainer width="100%" height={300} className="sm:h-[350px]">
              <BarChart data={distribusiProduk} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#666' }} 
                  stroke="#666"
                >
                  <Label 
                    value="Cluster" 
                    offset={-10} 
                    position="insideBottom" 
                    style={{ fontSize: '13px', fill: '#2d5f3f', fontWeight: '600' }}
                    className="dark:fill-[#b88746]"
                  />
                </XAxis>
                <YAxis 
                  tick={{ fontSize: 11, fill: '#666' }} 
                  stroke="#666"
                >
                  <Label 
                    value="Jumlah Petani" 
                    angle={-90} 
                    position="insideLeft" 
                    style={{ fontSize: '13px', fill: '#2d5f3f', fontWeight: '600', textAnchor: 'middle' }}
                    className="dark:fill-[#b88746]"
                  />
                </YAxis>
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#2d5f3f" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Tabel Karakteristik - ALWAYS VISIBLE with Horizontal Scroll & Sticky Columns */}
        <div className="mb-6">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-[#e5e5e5] mb-3">Karakteristik Cluster</h3>
          
          {/* Table wrapper - ALWAYS shows, no conditional rendering */}
          <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-md">
            <table className="w-full caption-bottom text-xs border-collapse relative">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59] hover:from-[#2d5f3f] hover:to-[#4a7c59]">
                  <TableHead className="text-white whitespace-nowrap sticky left-0 z-20 bg-[#2d5f3f] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">Cluster</TableHead>
                  <TableHead className="text-white whitespace-nowrap sticky left-[70px] z-20 bg-[#2d5f3f] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] min-w-[180px]">Label</TableHead>
                  <TableHead className="text-white text-center whitespace-nowrap">Petani</TableHead>
                  <TableHead className="text-white text-center bg-green-700 whitespace-nowrap min-w-[100px]">Hasil/Tahun</TableHead>
                  <TableHead className="text-white text-center whitespace-nowrap min-w-[100px]">Luas Lahan</TableHead>
                  <TableHead className="text-white text-center bg-green-700 whitespace-nowrap min-w-[130px]">Budidaya</TableHead>
                  <TableHead className="text-white text-center whitespace-nowrap min-w-[100px]">Pupuk</TableHead>
                  <TableHead className="text-white text-center whitespace-nowrap min-w-[120px]">Panen</TableHead>
                  <TableHead className="text-white text-center whitespace-nowrap min-w-[100px]">Bertani</TableHead>
                  <TableHead className="text-white text-center whitespace-nowrap min-w-[110px]">Populasi</TableHead>
                  <TableHead className="text-white text-center whitespace-nowrap min-w-[120px]">Irigasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produkBudidaya?.clusters.map((cluster, index) => (
                  <TableRow
                    key={cluster.cluster_id}
                    className="bg-transparent dark:bg-transparent hover:bg-[#2d5f3f]/10 transition-colors"
                    >
                    <TableCell className="whitespace-nowrap sticky left-0 z-10 bg-inherit shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <Badge className="bg-[#2d5f3f] dark:bg-[#4a7c59] hover:bg-[#2d5f3f] dark:hover:bg-[#4a7c59] text-white text-xs">
                        {cluster.cluster_id}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-[#e5e5e5] font-medium whitespace-nowrap sticky left-[70px] z-10 bg-inherit shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{cluster.label}</TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.petani_count}</TableCell>
                    <TableCell className="text-center bg-green-50 dark:bg-green-900/20 font-bold text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">
                      {formatNumber(cluster.karakteristik.avg_produktivitas_kg || 0)} kg
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">
                      {formatNumber(cluster.karakteristik.avg_luas_lahan_m2 || 0)} m²
                    </TableCell>
                    <TableCell className="text-center bg-green-50 dark:bg-green-900/20 font-bold text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">
                      {cluster.karakteristik.metode_budidaya || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.karakteristik.pupuk || 'N/A'}</TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.karakteristik.metode_panen || 'N/A'}</TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">
                      {formatNumber(cluster.karakteristik.avg_lama_bertani_tahun || 0)} th
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">
                      {formatNumber(cluster.karakteristik.avg_populasi_kopi || 0)}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.karakteristik.sistem_irigasi || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          </div>
        </div>

        {/* Insight Cards - Responsive */}
        <div className="mb-6">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-[#e5e5e5] mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
            Daftar Petani dan Insight per Cluster
          </h3>
          <div className="space-y-4">
            {produkBudidaya?.clusters.map((cluster) => (
              <Card key={cluster.cluster_id} className="overflow-hidden border-2 border-gray-200 dark:border-white/10 hover:border-[#2d5f3f] dark:hover:border-[#4a7c59] transition-all">
                <div className="bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59] p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-white text-[#2d5f3f] hover:bg-white text-sm sm:text-base px-3 py-1">
                        Cluster {cluster.cluster_id}
                      </Badge>
                      <h4 className="text-white font-semibold text-sm sm:text-lg">{cluster.label}</h4>
                    </div>
                    <Badge className="bg-white/20 text-white hover:bg-white/20 border-white/40 text-xs sm:text-sm px-3 py-1 w-fit">
                      {cluster.petani_count} Petani
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 bg-white dark:bg-[#242424]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Daftar Petani */}
                    <div>
                      <h5 className="font-bold text-gray-800 dark:text-[#e5e5e5] mb-3 flex items-center gap-2 text-xs sm:text-sm">
                        <Users className="w-4 h-4 text-[#2d5f3f] shrink-0" />
                        Daftar Petani:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {cluster.petani_names && cluster.petani_names.length > 0 ? (
                          cluster.petani_names.map((name, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs px-2 py-1">
                              {name}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">Data tidak tersedia</p>
                        )}
                      </div>
                    </div>

                    {/* Interpretasi & Insight */}
                    <div>
                      <h5 className="font-bold text-gray-800 dark:text-[#e5e5e5] mb-3 flex items-center gap-2 text-xs sm:text-sm">
                        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                        Interpretasi & Insight:
                      </h5>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg p-3">
                        <p className="text-xs sm:text-sm text-gray-800 dark:text-[#d4d4d4] leading-relaxed">
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
      <Card className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-[#242424] shadow-xl border-0 overflow-hidden">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#8b6f47] to-[#a78a5e] rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-[#e5e5e5]">
                {profilPasar?.clustering_type || 'Clustering Profil Petani dan Pemasaran'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3]">
                Analisis berdasarkan profil petani dan strategi pemasaran
              </p>
            </div>
          </div>
        </div>

        {/* Distribusi Cluster - Bar Chart Only */}
        <div className="mb-6">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-[#e5e5e5] mb-3">Distribusi Cluster</h3>
          <Card className="p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#2d2416] dark:to-[#3d3426] border border-[#8b6f47]/20 dark:border-white/10">
            <ResponsiveContainer width="100%" height={300} className="sm:h-[350px]">
              <BarChart data={distribusiPasar} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#666' }} 
                  stroke="#666"
                >
                  <Label 
                    value="Cluster" 
                    offset={-10} 
                    position="insideBottom" 
                    style={{ fontSize: '13px', fill: '#8b6f47', fontWeight: '600' }}
                    className="dark:fill-[#b88746]"
                  />
                </XAxis>
                <YAxis 
                  tick={{ fontSize: 11, fill: '#666' }} 
                  stroke="#666"
                >
                  <Label 
                    value="Jumlah Petani" 
                    angle={-90} 
                    position="insideLeft" 
                    style={{ fontSize: '13px', fill: '#8b6f47', fontWeight: '600', textAnchor: 'middle' }}
                    className="dark:fill-[#b88746]"
                  />
                </YAxis>
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#8b6f47" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Tabel Karakteristik - ALWAYS VISIBLE with Horizontal Scroll & Sticky Columns */}
        <div className="mb-6">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-[#e5e5e5] mb-3">Karakteristik Cluster</h3>
          
          {/* Table wrapper - ALWAYS shows, no conditional rendering */}
          <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-md">
            <table className="w-full caption-bottom text-xs border-collapse relative">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#8b6f47] to-[#a78a5e] hover:from-[#8b6f47] hover:to-[#a78a5e]">
                  <TableHead className="text-white whitespace-nowrap sticky left-0 z-20 bg-[#8b6f47] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">Cluster</TableHead>
                  <TableHead className="text-white whitespace-nowrap sticky left-[70px] z-20 bg-[#8b6f47] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] min-w-[180px]">Label</TableHead>
                  <TableHead className="text-white text-center whitespace-nowrap">Petani</TableHead>
                  <TableHead className="text-white text-center bg-amber-700 whitespace-nowrap min-w-[100px]">Harga Jual</TableHead>
                  <TableHead className="text-white text-center whitespace-nowrap min-w-[130px]">Penjualan</TableHead>
                  <TableHead className="text-white text-center bg-amber-700 whitespace-nowrap min-w-[130px]">Pengolahan</TableHead>
                  <TableHead className="text-white text-center whitespace-nowrap min-w-[120px]">Fermentasi</TableHead>
                  <TableHead className="text-white text-center whitespace-nowrap min-w-[130px]">Pengeringan</TableHead>
                  <TableHead className="text-white text-center whitespace-nowrap min-w-[130px]">Penyimpanan</TableHead>
                  <TableHead className="text-white text-center whitespace-nowrap min-w-[130px]">Sistem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profilPasar?.clusters.map((cluster, index) => (
                  <TableRow
                    key={cluster.cluster_id}
                    className="bg-transparent dark:bg-transparent hover:bg-[#8b6f47]/10 transition-colors"
                  >
                    <TableCell className="whitespace-nowrap sticky left-0 z-10 bg-inherit shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      <Badge className="bg-[#8b6f47] dark:bg-[#a78a5e] hover:bg-[#8b6f47] text-white text-xs">
                        {cluster.cluster_id}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-[#e5e5e5] font-medium whitespace-nowrap sticky left-[70px] z-10 bg-inherit shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{cluster.label}</TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.petani_count}</TableCell>
                    <TableCell className="text-center bg-amber-50 dark:bg-amber-900/20 font-bold text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">
                      Rp {formatNumber(cluster.karakteristik.avg_harga_jual || 0)}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.karakteristik.metode_penjualan || 'N/A'}</TableCell>
                    <TableCell className="text-center bg-amber-50 dark:bg-amber-900/20 font-bold text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">
                      {cluster.karakteristik.metode_pengolahan || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.karakteristik.lama_fermentasi || 'N/A'}</TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.karakteristik.proses_pengeringan || 'N/A'}</TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.karakteristik.bentuk_penyimpanan || 'N/A'}</TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] whitespace-nowrap">{cluster.karakteristik.sistem_penyimpanan || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          </div>
        </div>

        {/* Insight Cards - Responsive */}
        <div className="mb-6">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-[#e5e5e5] mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
            Daftar Petani dan Insight per Cluster
          </h3>
          <div className="space-y-4">
            {profilPasar?.clusters.map((cluster) => (
              <Card key={cluster.cluster_id} className="overflow-hidden border-2 border-gray-200 dark:border-white/10 hover:border-[#8b6f47] dark:hover:border-[#a78a5e] transition-all">
                <div className="bg-gradient-to-r from-[#8b6f47] to-[#a78a5e] p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-white text-[#8b6f47] hover:bg-white text-sm sm:text-base px-3 py-1">
                        Cluster {cluster.cluster_id}
                      </Badge>
                      <h4 className="text-white font-semibold text-sm sm:text-lg">{cluster.label}</h4>
                    </div>
                    <Badge className="bg-white/20 text-white hover:bg-white/20 border-white/40 text-xs sm:text-sm px-3 py-1 w-fit">
                      {cluster.petani_count} Petani
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 bg-white dark:bg-[#242424]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Daftar Petani */}
                    <div>
                      <h5 className="font-bold text-gray-800 dark:text-[#e5e5e5] mb-3 flex items-center gap-2 text-xs sm:text-sm">
                        <Users className="w-4 h-4 text-[#8b6f47] shrink-0" />
                        Daftar Petani:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {cluster.petani_names && cluster.petani_names.length > 0 ? (
                          cluster.petani_names.map((name, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs px-2 py-1 border-amber-300">
                              {name}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">Data tidak tersedia</p>
                        )}
                      </div>
                    </div>

                    {/* Interpretasi & Insight */}
                    <div>
                      <h5 className="font-bold text-gray-800 dark:text-[#e5e5e5] mb-3 flex items-center gap-2 text-xs sm:text-sm">
                        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                        Interpretasi & Insight:
                      </h5>
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-500 dark:border-amber-400 rounded-r-lg p-3">
                        <p className="text-xs sm:text-sm text-gray-800 dark:text-[#d4d4d4] leading-relaxed">
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
  if (label.includes('Expert')) {
    return `Kelompok petani yang sudah expert dan produktivitas sangat tinggi menunjukkan kinerja luar biasa dengan hasil rata-rata sekitar ${avgProduksi.toFixed(0)} kg per tahun. Mayoritas menggunakan metode budidaya ${metodeBudidaya}, dengan pengalaman bertani puluhan tahun dan manajemen lahan yang efisien. Kelompok ini berpotensi menjadi mentor bagi petani lain, terutama dalam penerapan teknik pemetikan selektif dan penggunaan pupuk kimia secara tepat untuk menjaga konsistensi kualitas kopi.`;
  } 
  else if (label.includes('Efisien')) {
    return `Kelompok petani efisien memiliki produktivitas yang solid (${avgProduksi.toFixed(0)} kg/tahun) meskipun dengan luas lahan relatif kecil. Penggunaan metode budidaya ${metodeBudidaya} menunjukkan orientasi pada efisiensi dan keberlanjutan. Kelompok ini dapat ditingkatkan melalui akses terhadap pasar premium, pelatihan diversifikasi produk olahan kopi, dan peningkatan sistem irigasi agar hasil tetap stabil sepanjang tahun.`;
  } 
  else if (label.includes('Berkembang')) {
    return `Kelompok petani sudah berkembang dan produktivitas stabil mencerminkan petani yang sudah mulai adaptif terhadap praktik modern dengan hasil sekitar ${avgProduksi.toFixed(0)} kg/tahun. Metode budidaya ${metodeBudidaya} masih umum digunakan, tetapi konsistensi hasil menunjukkan potensi besar. Intervensi berupa pelatihan teknik budidaya organik, manajemen pupuk berimbang, serta dukungan peralatan panen dapat meningkatkan efisiensi dan pendapatan mereka.`;
  } 
  else if (label.includes('Pemula')) {
    return `Kelompok petani yang masih pemula dan produktivitas rendah masih menghadapi tantangan dalam peningkatan hasil panen (rata-rata ${avgProduksi.toFixed(0)} kg/tahun). Umumnya menggunakan metode budidaya ${metodeBudidaya} dan bergantung pada kondisi alam seperti tadah hujan. Mereka membutuhkan pendampingan intensif dalam pengelolaan lahan, penggunaan pupuk yang tepat, serta pelatihan dasar teknik panen agar produktivitas dan kualitas kopi dapat meningkat.`;
  } 
  else {
    return `Kelompok petani ini memiliki karakteristik unik dengan hasil rata-rata ${avgProduksi.toFixed(0)} kg per tahun menggunakan metode ${metodeBudidaya}. Perlu analisis lanjutan untuk menentukan strategi peningkatan hasil yang sesuai dengan kondisi lahan dan sumber daya yang tersedia.`;
  }
}

function getInsightPasar(label: string, avgHarga: number, metodePenjualan: string, metodePengolahan: string): string {
  if (label.includes('Petani Berpengalaman')) {
    return `Kelompok petani berpengalaman yang sudah mampu menjangkau pasar premium dengan rata-rata harga jual Rp ${avgHarga.toFixed(0)}/kg. Umumnya menggunakan metode penjualan ${metodePenjualan} dengan pengolahan ${metodePengolahan} yang terstandarisasi dan berfokus pada kualitas tinggi. Cluster ini menunjukkan kemandirian dan profesionalisme tinggi dalam pengelolaan hasil panen. Rekomendasi: pertahankan konsistensi mutu, perluas sertifikasi (organik/fair trade), dan tingkatkan branding untuk memperluas akses ke pasar ekspor.`;
  } else if (label.includes('Petani Modern')) {
    return `Kelompok petani modern dengan harga jual semi-premium sekitar Rp ${avgHarga.toFixed(0)}/kg. Mereka menerapkan metode penjualan ${metodePenjualan} dan pengolahan ${metodePengolahan} yang cukup efisien. Cluster ini memiliki potensi besar untuk naik ke pasar premium jika kualitas pasca-panen dan pengemasan terus ditingkatkan. Rekomendasi: lakukan pelatihan pengolahan modern, gunakan teknologi tepat guna, dan bangun kemitraan dengan pembeli premium.`;
  } else if (label.includes('Petani Produktif')) {
    return `Kelompok petani konvensional yang masih berfokus pada pasar lokal dengan rata-rata harga jual Rp ${avgHarga.toFixed(0)}/kg. Umumnya menggunakan metode penjualan ${metodePenjualan} dan pengolahan ${metodePengolahan} yang sederhana dan tradisional. Cluster ini memiliki potensi besar untuk berkembang melalui pendampingan intensif. Rekomendasi: tingkatkan pelatihan manajemen kualitas, akses pembiayaan mikro, serta bentuk koperasi untuk memperluas jaringan pasar dan meningkatkan daya saing.`;
  } else {
    return `Cluster ini belum terklasifikasi secara spesifik. Diperlukan analisis lebih lanjut untuk menentukan karakteristik petani dan segmentasi pasarnya.`;
  }
}

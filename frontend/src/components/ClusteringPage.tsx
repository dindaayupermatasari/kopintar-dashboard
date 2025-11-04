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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Table,
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
      value: c.petani_count,
      fill: COLORS[idx % COLORS.length]
    }));
  };

  const getDistribusiDataPasar = (clusters: Cluster[] | undefined) => {
    if (!clusters) return [];
    return clusters.map((c, idx) => ({
      name: `C${c.cluster_id}`,
      value: c.petani_count,
      fill: COLORS_BROWN[idx % COLORS_BROWN.length]
    }));
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
    <div className="w-full max-w-full dark:text-gray-100 space-y-6 md:space-y-8">
      {/* Header - Responsive */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#2d5f3f] dark:text-[#b88746] mb-2">
          Analisis Clustering Petani Kopi
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-[#a3a3a3]">
          Hasil clustering menggunakan Machine Learning untuk segmentasi petani
        </p>
      </div>

      {/* Summary Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4 md:p-5 bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] text-white border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-white/20 rounded-lg">
              <BarChart3 className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-white/80 text-xs md:text-sm">Total Clusters</p>
              <p className="text-xl md:text-2xl font-bold">{totalClustersProduk + totalClustersPasar}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-5 bg-gradient-to-br from-[#8b6f47] to-[#a78a5e] text-white border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-white/20 rounded-lg">
              <Users className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-white/80 text-xs md:text-sm">Total Petani</p>
              <p className="text-xl md:text-2xl font-bold">{totalPetani}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-5 bg-white dark:bg-[#242424] border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-[#a3a3a3] text-xs md:text-sm">Model Produk</p>
              <p className="text-base md:text-lg text-gray-900 dark:text-[#e5e5e5] font-medium">{produkBudidaya?.model || 'N/A'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-5 bg-white dark:bg-[#242424] border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 md:p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-[#a3a3a3] text-xs md:text-sm">Model Pasar</p>
              <p className="text-base md:text-lg text-gray-900 dark:text-[#e5e5e5] font-medium">{profilPasar?.model || 'N/A'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* CLUSTERING 1: PRODUKTIVITAS DAN PRAKTIK BUDAYA */}
      <Card className="p-4 md:p-6 lg:p-8 bg-white dark:bg-[#242424] shadow-xl border-0">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] rounded-xl flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-[#e5e5e5]">
                {produkBudidaya?.clustering_type || 'Clustering Produktivitas dan Praktik Budaya'}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-[#a3a3a3]">
                Analisis berdasarkan hasil panen, lahan, dan metode budidaya
              </p>
            </div>
          </div>
        </div>

        {/* Distribusi Cluster - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-[#e5e5e5] mb-3 md:mb-4">Distribusi Cluster</h3>
            <Card className="p-3 md:p-4 bg-gradient-to-br from-green-50 to-amber-50 dark:from-[#1a2e23] dark:to-[#2d4a3a] border border-[#2d5f3f]/20 dark:border-white/10">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={distribusiProduk}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#666" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="value" fill="#2d5f3f" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-[#e5e5e5] mb-3 md:mb-4">Proporsi Cluster</h3>
            <Card className="p-3 md:p-4 bg-gradient-to-br from-green-50 to-amber-50 dark:from-[#1a2e23] dark:to-[#2d4a3a] border border-[#2d5f3f]/20 dark:border-white/10">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={distribusiProduk}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distribusiProduk.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

        {/* Tabel Karakteristik - Scroll Horizontal */}
        <div className="mb-6 md:mb-8">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-[#e5e5e5] mb-3 md:mb-4">Karakteristik Cluster</h3>
          <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-white/10">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59] hover:from-[#2d5f3f] hover:to-[#4a7c59]">
                  <TableHead className="text-white text-xs md:text-sm whitespace-nowrap sticky left-0 z-10 bg-[#2d5f3f]">Cluster</TableHead>
                  <TableHead className="text-white text-xs md:text-sm whitespace-nowrap">Label</TableHead>
                  <TableHead className="text-white text-xs md:text-sm text-center whitespace-nowrap">Petani</TableHead>
                  <TableHead className="text-white text-xs md:text-sm text-center bg-green-700 whitespace-nowrap">Hasil/Tahun</TableHead>
                  <TableHead className="text-white text-xs md:text-sm text-center whitespace-nowrap">Luas Lahan</TableHead>
                  <TableHead className="text-white text-xs md:text-sm text-center whitespace-nowrap">Budidaya</TableHead>
                  <TableHead className="text-white text-xs md:text-sm text-center whitespace-nowrap">Pupuk</TableHead>
                  <TableHead className="text-white text-xs md:text-sm text-center whitespace-nowrap">Panen</TableHead>
                  <TableHead className="text-white text-xs md:text-sm text-center whitespace-nowrap">Lama Bertani</TableHead>
                  <TableHead className="text-white text-xs md:text-sm text-center whitespace-nowrap">Populasi</TableHead>
                  <TableHead className="text-white text-xs md:text-sm text-center whitespace-nowrap">Irigasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produkBudidaya?.clusters.map((cluster, index) => (
                  <TableRow key={cluster.cluster_id} className={index % 2 === 0 ? 'bg-white dark:bg-[#242424]' : 'bg-gray-50 dark:bg-[#1a2e23]'}>
                    <TableCell className="whitespace-nowrap sticky left-0 z-10 bg-inherit">
                      <Badge className="bg-[#2d5f3f] dark:bg-[#4a7c59] hover:bg-[#2d5f3f] dark:hover:bg-[#4a7c59] text-white text-xs">
                        {cluster.cluster_id}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-[#e5e5e5] font-medium text-xs md:text-sm max-w-[200px] truncate">
                      {cluster.label}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] text-xs md:text-sm whitespace-nowrap">
                      {cluster.petani_count}
                    </TableCell>
                    <TableCell className="text-center bg-green-50 dark:bg-green-900/20 font-bold text-gray-900 dark:text-[#e5e5e5] text-xs md:text-sm whitespace-nowrap">
                      {formatNumber(cluster.karakteristik.avg_produktivitas_kg || 0)} kg
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] text-xs md:text-sm whitespace-nowrap">
                      {formatNumber(cluster.karakteristik.avg_luas_lahan_m2 || 0)} m²
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] text-xs md:text-sm max-w-[150px] truncate">
                      {cluster.karakteristik.metode_budidaya || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] text-xs md:text-sm max-w-[120px] truncate">
                      {cluster.karakteristik.pupuk || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] text-xs md:text-sm max-w-[120px] truncate">
                      {cluster.karakteristik.metode_panen || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] text-xs md:text-sm whitespace-nowrap">
                      {formatNumber(cluster.karakteristik.avg_lama_bertani_tahun || 0)} th
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] text-xs md:text-sm whitespace-nowrap">
                      {formatNumber(cluster.karakteristik.avg_populasi_kopi || 0)}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] text-xs md:text-sm max-w-[120px] truncate">
                      {cluster.karakteristik.sistem_irigasi || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Insight Cards - Responsive */}
        <div className="mb-6 md:mb-8">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-[#e5e5e5] mb-4 md:mb-6 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
            Daftar Petani dan Insight per Cluster
          </h3>
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {produkBudidaya?.clusters.map((cluster) => (
              <Card key={cluster.cluster_id} className="overflow-hidden border-2 border-gray-200 dark:border-white/10 hover:border-[#2d5f3f] dark:hover:border-[#4a7c59] transition-all">
                <div className="bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59] p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                      <Badge className="bg-white text-[#2d5f3f] hover:bg-white text-sm md:text-lg px-3 md:px-4 py-1">
                        Cluster {cluster.cluster_id}
                      </Badge>
                      <h4 className="text-white font-semibold text-base md:text-xl">{cluster.label}</h4>
                    </div>
                    <Badge className="bg-white/20 text-white hover:bg-white/20 border-white/40 text-sm md:text-base px-3 py-1 w-fit">
                      {cluster.petani_count} Petani
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4 md:p-6 bg-white dark:bg-[#242424]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* Daftar Petani */}
                    <div>
                      <h5 className="font-bold text-gray-800 dark:text-[#e5e5e5] mb-3 flex items-center gap-2 text-sm md:text-base">
                        <Users className="w-4 h-4 md:w-5 md:h-5 text-[#2d5f3f]" />
                        Daftar Petani:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {cluster.petani_names && cluster.petani_names.length > 0 ? (
                          cluster.petani_names.map((name, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs md:text-sm px-2 md:px-3 py-1">
                              {name}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-xs md:text-sm text-gray-500 dark:text-[#a3a3a3]">Data tidak tersedia</p>
                        )}
                      </div>
                    </div>

                    {/* Interpretasi & Insight */}
                    <div>
                      <h5 className="font-bold text-gray-800 dark:text-[#e5e5e5] mb-3 flex items-center gap-2 text-sm md:text-base">
                        <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                        Interpretasi & Insight:
                      </h5>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg p-3 md:p-4">
                        <p className="text-xs md:text-sm text-gray-800 dark:text-[#d4d4d4] leading-relaxed">
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
      <Card className="p-4 md:p-6 lg:p-8 bg-white dark:bg-[#242424] shadow-xl border-0">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#8b6f47] to-[#a78a5e] rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-[#e5e5e5]">
                {profilPasar?.clustering_type || 'Clustering Profil Petani dan Pemasaran'}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 dark:text-[#a3a3a3]">
                Analisis berdasarkan profil petani dan strategi pemasaran
              </p>
            </div>
          </div>
        </div>

        {/* Distribusi Cluster - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-[#e5e5e5] mb-3 md:mb-4">Distribusi Cluster</h3>
            <Card className="p-3 md:p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#2d2416] dark:to-[#3d3426] border border-[#8b6f47]/20 dark:border-white/10">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={distribusiPasar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#666" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="value" fill="#8b6f47" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-[#e5e5e5] mb-3 md:mb-4">Proporsi Cluster</h3>
            <Card className="p-3 md:p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#2d2416] dark:to-[#3d3426] border border-[#8b6f47]/20 dark:border-white/10">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={distribusiPasar}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distribusiPasar.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_BROWN[index % COLORS_BROWN.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

        {/* Tabel Karakteristik - Scroll Horizontal */}
        <div className="mb-6 md:mb-8">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-[#e5e5e5] mb-3 md:mb-4">Karakteristik Cluster</h3>
          <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-white/10">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#8b6f47] to-[#a78a5e] hover:from-[#8b6f47] hover:to-[#a78a5e]">
                  <TableHead className="text-white text-xs md:text-sm whitespace-nowrap sticky left-0 z-10 bg-[#8b6f47]">Cluster</TableHead>
                  <TableHead className="text-white text-xs md:text-sm whitespace-nowrap">Label</TableHead>
                  <TableHead className="text-white text-xs md:text-sm text-center whitespace-nowrap">Petani</TableHead>
                  <TableHead className="text-white text-xs md:text-sm text-center bg-amber-700 whitespace-nowrap">Harga Jual</TableHead>
                  <TableHead className="text-white text-xs md:text-sm text-center whitespace-nowrap">Fermentasi</TableHead>
                  <TableHead className="text-white text-xs md:text-sm text-center whitespace-nowrap">Pengeringan</TableHead>
                  <TableHead className="text-white text-xs md:text-sm text-center whitespace-nowrap">Penjualan</TableHead>
                  <TableHead className="text-white text-xs md:text-sm text-center whitespace-nowrap">Penyimpanan</TableHead>
                  <TableHead className="text-white text-xs md:text-sm text-center whitespace-nowrap">Sistem</TableHead>
                  <TableHead className="text-white text-xs md:text-sm text-center whitespace-nowrap">Pengolahan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profilPasar?.clusters.map((cluster, index) => (
                  <TableRow key={cluster.cluster_id} className={index % 2 === 0 ? 'bg-white dark:bg-[#242424]' : 'bg-gray-50 dark:bg-[#1a2e23]'}>
                    <TableCell className="whitespace-nowrap sticky left-0 z-10 bg-inherit">
                      <Badge className="bg-[#8b6f47] dark:bg-[#a78a5e] hover:bg-[#8b6f47] dark:hover:bg-[#a78a5e] text-white text-xs">
                        {cluster.cluster_id}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-[#e5e5e5] font-medium text-xs md:text-sm max-w-[200px] truncate">
                      {cluster.label}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] text-xs md:text-sm whitespace-nowrap">
                      {cluster.petani_count}
                    </TableCell>
                    <TableCell className="text-center bg-amber-50 dark:bg-amber-900/20 font-bold text-gray-900 dark:text-[#e5e5e5] text-xs md:text-sm whitespace-nowrap">
                      Rp {formatNumber(cluster.karakteristik.avg_harga_jual || 0)}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] text-xs md:text-sm max-w-[120px] truncate">
                      {cluster.karakteristik.lama_fermentasi || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] text-xs md:text-sm max-w-[120px] truncate">
                      {cluster.karakteristik.proses_pengeringan || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] text-xs md:text-sm max-w-[120px] truncate">
                      {cluster.karakteristik.metode_penjualan || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] text-xs md:text-sm max-w-[120px] truncate">
                      {cluster.karakteristik.bentuk_penyimpanan || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] text-xs md:text-sm max-w-[120px] truncate">
                      {cluster.karakteristik.sistem_penyimpanan || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5] text-xs md:text-sm max-w-[120px] truncate">
                      {cluster.karakteristik.metode_pengolahan || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Insight Cards - Responsive */}
        <div className="mb-6 md:mb-8">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-[#e5e5e5] mb-4 md:mb-6 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
            Daftar Petani dan Insight per Cluster
          </h3>
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {profilPasar?.clusters.map((cluster) => (
              <Card key={cluster.cluster_id} className="overflow-hidden border-2 border-gray-200 dark:border-white/10 hover:border-[#8b6f47] dark:hover:border-[#a78a5e] transition-all">
                <div className="bg-gradient-to-r from-[#8b6f47] to-[#a78a5e] p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                      <Badge className="bg-white text-[#8b6f47] hover:bg-white text-sm md:text-lg px-3 md:px-4 py-1">
                        Cluster {cluster.cluster_id}
                      </Badge>
                      <h4 className="text-white font-semibold text-base md:text-xl">{cluster.label}</h4>
                    </div>
                    <Badge className="bg-white/20 text-white hover:bg-white/20 border-white/40 text-sm md:text-base px-3 py-1 w-fit">
                      {cluster.petani_count} Petani
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4 md:p-6 bg-white dark:bg-[#242424]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* Daftar Petani */}
                    <div>
                      <h5 className="font-bold text-gray-800 dark:text-[#e5e5e5] mb-3 flex items-center gap-2 text-sm md:text-base">
                        <Users className="w-4 h-4 md:w-5 md:h-5 text-[#8b6f47]" />
                        Daftar Petani:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {cluster.petani_names && cluster.petani_names.length > 0 ? (
                          cluster.petani_names.map((name, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs md:text-sm px-2 md:px-3 py-1 border-amber-300">
                              {name}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-xs md:text-sm text-gray-500 dark:text-[#a3a3a3]">Data tidak tersedia</p>
                        )}
                      </div>
                    </div>

                    {/* Interpretasi & Insight */}
                    <div>
                      <h5 className="font-bold text-gray-800 dark:text-[#e5e5e5] mb-3 flex items-center gap-2 text-sm md:text-base">
                        <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                        Interpretasi & Insight:
                      </h5>
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-500 dark:border-amber-400 rounded-r-lg p-3 md:p-4">
                        <p className="text-xs md:text-sm text-gray-800 dark:text-[#d4d4d4] leading-relaxed">
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
  if (label.includes('Sangat Tinggi')) {
    return `Kelompok petani dengan pengalaman tinggi dan hasil panen sangat produktif (${avgProduksi.toFixed(0)} kg/tahun). Mayoritas menggunakan metode budidaya ${metodeBudidaya}. Cluster ini dapat menjadi role model untuk penerapan praktik pertanian berkelanjutan dan pelatihan bagi kelompok lain dalam hal teknik budidaya modern, manajemen lahan yang efisien, dan optimalisasi penggunaan pupuk.`;
  } else if (label.includes('Tinggi')) {
    return `Petani dengan produktivitas tinggi (${avgProduksi.toFixed(0)} kg/tahun) dan efisiensi yang baik dengan metode ${metodeBudidaya}. Potensi untuk meningkat lebih tinggi jika akses pasar dan harga jual diperbaiki melalui inovasi pupuk organik, teknik panen yang lebih modern, dan diversifikasi varietas kopi yang ditanam.`;
  } else if (label.includes('Sedang')) {
    return `Kelompok petani dengan produktivitas sedang (${avgProduksi.toFixed(0)} kg/tahun) menggunakan metode ${metodeBudidaya} yang cenderung semi-tradisional. Cocok untuk intervensi pelatihan teknologi pertanian modern, manajemen lahan yang lebih baik, serta akses terhadap pupuk berkualitas dan sistem irigasi yang memadai untuk meningkatkan hasil panen.`;
  } else {
    return `Petani dengan produktivitas terbatas (${avgProduksi.toFixed(0)} kg/tahun), menggunakan metode ${metodeBudidaya}. Memerlukan dukungan intensif baik dari segi pelatihan teknis, pembiayaan mikro, akses ke input pertanian berkualitas, maupun pembentukan koperasi untuk meningkatkan hasil panen dan kesejahteraan ekonomi.`;
  }
}

function getInsightPasar(label: string, avgHarga: number, metodePenjualan: string, metodePengolahan: string): string {
  if (label.includes('Petani Berpengalaman')) {
    return `Kelompok petani berpengalaman yang sudah mampu menjangkau pasar premium dengan rata-rata harga jual Rp ${avgHarga.toFixed(0)}/kg. 
    Umumnya menggunakan metode penjualan ${metodePenjualan} dengan pengolahan ${metodePengolahan} yang terstandarisasi dan berfokus pada kualitas tinggi. 
    Cluster ini menunjukkan kemandirian dan profesionalisme tinggi dalam pengelolaan hasil panen. 
    Rekomendasi: pertahankan konsistensi mutu, perluas sertifikasi (organik/fair trade), dan tingkatkan branding untuk memperluas akses ke pasar ekspor.`;

  } else if (label.includes('Petani Modern')) {
    return `Kelompok petani modern dengan harga jual semi-premium sekitar Rp ${avgHarga.toFixed(0)}/kg. 
    Mereka menerapkan metode penjualan ${metodePenjualan} dan pengolahan ${metodePengolahan} yang cukup efisien. 
    Cluster ini memiliki potensi besar untuk naik ke pasar premium jika kualitas pasca-panen dan pengemasan terus ditingkatkan. 
    Rekomendasi: lakukan pelatihan pengolahan modern, gunakan teknologi tepat guna, dan bangun kemitraan dengan pembeli premium.`;

  } else if (label.includes('Petani Konvensional')) {
    return `Kelompok petani konvensional yang masih berfokus pada pasar lokal dengan rata-rata harga jual Rp ${avgHarga.toFixed(0)}/kg. 
    Umumnya menggunakan metode penjualan ${metodePenjualan} dan pengolahan ${metodePengolahan} yang sederhana dan tradisional. 
    Cluster ini memiliki potensi besar untuk berkembang melalui pendampingan intensif. 
    Rekomendasi: tingkatkan pelatihan manajemen kualitas, akses pembiayaan mikro, serta bentuk koperasi untuk memperluas jaringan pasar dan meningkatkan daya saing.`;

  } else {
    return `Cluster ini belum terklasifikasi secara spesifik. Diperlukan analisis lebih lanjut untuk menentukan karakteristik petani dan segmentasi pasarnya.`;
  }
}


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
      name: `Cluster ${c.cluster_id}`,
      value: c.petani_count,
      fill: COLORS[idx % COLORS.length]
    }));
  };

  const getDistribusiDataPasar = (clusters: Cluster[] | undefined) => {
    if (!clusters) return [];
    return clusters.map((c, idx) => ({
      name: `Cluster ${c.cluster_id}`,
      value: c.petani_count,
      fill: COLORS_BROWN[idx % COLORS_BROWN.length]
    }));
  };

  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const safeGet = (obj: any, path: string, defaultValue: any = 'N/A') => {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      if (result === undefined || result === null) return defaultValue;
      result = result[key];
    }
    return result === undefined || result === null ? defaultValue : result;
  };

  const COLORS = ['#2d5f3f', '#4a7c59', '#5a8c69', '#7aa084'];
  const COLORS_BROWN = ['#8b6f47', '#a78a5e', '#b88746', '#d4a373'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#2d5f3f]" />
          <p className="text-gray-600 dark:text-[#a3a3a3]">Memuat data clustering...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
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
    <div className="dark:text-gray-100 space-y-8">
      {/* Header - FIXED */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2d5f3f] dark:text-[#b88746] mb-2">
          Analisis Clustering Petani Kopi
        </h1>
        <p className="text-gray-600 dark:text-[#a3a3a3]">
          Hasil clustering menggunakan Machine Learning untuk segmentasi petani
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] text-white border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Total Clusters</p>
              <p className="text-2xl">{totalClustersProduk + totalClustersPasar}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-[#8b6f47] to-[#a78a5e] text-white border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Total Petani</p>
              <p className="text-2xl">{totalPetani}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-[#242424] border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-[#a3a3a3] text-sm">Model Produk</p>
              <p className="text-lg text-gray-900 dark:text-[#e5e5e5]">{produkBudidaya?.model || 'N/A'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-[#242424] border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-[#a3a3a3] text-sm">Model Pasar</p>
              <p className="text-sm text-gray-900 dark:text-[#e5e5e5]">{profilPasar?.model || 'N/A'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* CLUSTERING 1: PRODUKTIVITAS DAN PRAKTIK BUDAYA */}
      <Card className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-[#242424] shadow-xl border-0">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-[#e5e5e5]">
                {produkBudidaya?.clustering_type || 'Produk & Budidaya'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3]">
                Analisis menggunakan {produkBudidaya?.model} dengan {totalClustersProduk} cluster
              </p>
            </div>
          </div>
        </div>

        {/* Distribusi Cluster */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#e5e5e5] mb-4">Distribusi Cluster</h3>
            <Card className="p-4 bg-gradient-to-br from-green-50 to-amber-50 dark:from-[#1a2e23] dark:to-[#2d4a3a] border border-[#2d5f3f]/20 dark:border-white/10">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distribusiProduk}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#666" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#2d5f3f" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#e5e5e5] mb-4">Proporsi Cluster</h3>
            <Card className="p-4 bg-gradient-to-br from-green-50 to-amber-50 dark:from-[#1a2e23] dark:to-[#2d4a3a] border border-[#2d5f3f]/20 dark:border-white/10">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distribusiProduk}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name.split(' ')[1]}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
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

        {/* Tabel Karakteristik - UPDATED */}
        <div className="mb-8">
          <h3 className="text-gray-900 dark:text-[#e5e5e5] mb-4">Karakteristik Cluster</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59] hover:from-[#2d5f3f] hover:to-[#4a7c59]">
                  <TableHead className="text-white">Cluster</TableHead>
                  <TableHead className="text-white">Label</TableHead>
                  <TableHead className="text-white text-center">Jumlah Petani</TableHead>
                  <TableHead className="text-white text-center bg-green-700">Hasil/Tahun (kg)</TableHead>
                  <TableHead className="text-white text-center">Luas Lahan (m²)</TableHead>
                  <TableHead className="text-white text-center bg-green-700">Metode Budidaya</TableHead>
                  <TableHead className="text-white text-center">Pupuk</TableHead>
                  <TableHead className="text-white text-center">Metode Panen</TableHead>
                  <TableHead className="text-white text-center">Lama Bertani (th)</TableHead>
                  <TableHead className="text-white text-center">Populasi Kopi</TableHead>
                  <TableHead className="text-white text-center">Sistem Irigasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produkBudidaya?.clusters.map((cluster, index) => (
                  <TableRow key={cluster.cluster_id} className={index % 2 === 0 ? 'bg-white dark:bg-[#242424]' : 'bg-gray-50 dark:bg-[#1a2e23]'}>
                    <TableCell>
                      <Badge className="bg-[#2d5f3f] dark:bg-[#4a7c59] hover:bg-[#2d5f3f] dark:hover:bg-[#4a7c59] text-white">
                        {cluster.cluster_id}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-[#e5e5e5] font-medium">
                      {cluster.label}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5]">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-4 h-4" />
                        {cluster.petani_count}
                      </div>
                    </TableCell>
                    <TableCell className="text-center bg-green-50 dark:bg-green-900/20 font-bold text-gray-900 dark:text-[#e5e5e5]">
                      {formatNumber(cluster.karakteristik.avg_produktivitas_kg || 0)}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5]">
                      {formatNumber(cluster.karakteristik.avg_luas_lahan_m2 || 0)}
                    </TableCell>
                    <TableCell className="text-center bg-green-50 dark:bg-green-900/20 font-bold text-gray-900 dark:text-[#e5e5e5]">
                      {cluster.karakteristik.metode_budidaya || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5]">
                      {cluster.karakteristik.pupuk || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5]">
                      {cluster.karakteristik.metode_panen || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5]">
                      {formatNumber(cluster.karakteristik.avg_lama_bertani_tahun || 0)}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5]">
                      {formatNumber(cluster.karakteristik.avg_populasi_kopi || 0)}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5]">
                      {cluster.karakteristik.sistem_irigasi || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Insight Cards with Petani Names - UPDATED */}
        <div className="mb-8">
          <h3 className="text-gray-900 dark:text-[#e5e5e5] mb-6 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Daftar Petani dan Insight per Cluster
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {produkBudidaya?.clusters.map((cluster) => (
              <Card key={cluster.cluster_id} className="overflow-hidden border-2 border-gray-200 dark:border-white/10 hover:border-[#2d5f3f] dark:hover:border-[#4a7c59] transition-all">
                <div className="bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59] p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-white text-[#2d5f3f] hover:bg-white text-lg px-4 py-1">
                        Cluster {cluster.cluster_id}
                      </Badge>
                      <h4 className="text-white font-semibold text-xl">{cluster.label}</h4>
                    </div>
                    <Badge className="bg-white/20 text-white hover:bg-white/20 border-white/40 text-base px-3 py-1">
                      {cluster.petani_count} Petani
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6 bg-white dark:bg-[#242424]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daftar Petani */}
                    <div>
                      <h5 className="font-bold text-gray-800 dark:text-[#e5e5e5] mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#2d5f3f]" />
                        Daftar Petani:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {cluster.petani_names && cluster.petani_names.length > 0 ? (
                          cluster.petani_names.map((name, idx) => (
                            <Badge key={idx} variant="outline" className="text-sm px-3 py-1">
                              {name}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Data tidak tersedia</p>
                        )}
                      </div>
                    </div>

                    {/* Interpretasi & Insight */}
                    <div>
                      <h5 className="font-bold text-gray-800 dark:text-[#e5e5e5] mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        Interpretasi & Insight:
                      </h5>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg p-4">
                        <p className="text-sm text-gray-800 dark:text-[#d4d4d4] leading-relaxed">
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
      <Card className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-[#242424] shadow-xl border-0">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#8b6f47] to-[#a78a5e] rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-[#e5e5e5]">
                {profilPasar?.clustering_type || 'Profil Pasar'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3]">
                Analisis menggunakan {profilPasar?.model} dengan {totalClustersPasar} cluster
              </p>
            </div>
          </div>
        </div>

        {/* Distribusi Cluster */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#e5e5e5] mb-4">Distribusi Cluster</h3>
            <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#2d2416] dark:to-[#3d3426] border border-[#8b6f47]/20 dark:border-white/10">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distribusiPasar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#666" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#8b6f47" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#e5e5e5] mb-4">Proporsi Cluster</h3>
            <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#2d2416] dark:to-[#3d3426] border border-[#8b6f47]/20 dark:border-white/10">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distribusiPasar}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name.split(' ')[1]}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
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

        {/* Tabel Karakteristik - UPDATED */}
        <div className="mb-8">
          <h3 className="text-gray-900 dark:text-[#e5e5e5] mb-4">Karakteristik Cluster</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#8b6f47] to-[#a78a5e] hover:from-[#8b6f47] hover:to-[#a78a5e]">
                  <TableHead className="text-white">Cluster</TableHead>
                  <TableHead className="text-white">Label</TableHead>
                  <TableHead className="text-white text-center">Jumlah Petani</TableHead>
                  <TableHead className="text-white text-center bg-amber-700">Harga Jual (Rp/kg)</TableHead>
                  <TableHead className="text-white text-center">Lama Fermentasi</TableHead>
                  <TableHead className="text-white text-center">Proses Pengeringan</TableHead>
                  <TableHead className="text-white text-center bg-amber-700">Metode Penjualan</TableHead>
                  <TableHead className="text-white text-center">Bentuk Penyimpanan</TableHead>
                  <TableHead className="text-white text-center">Sistem Penyimpanan</TableHead>
                  <TableHead className="text-white text-center bg-amber-700">Metode Pengolahan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profilPasar?.clusters.map((cluster, index) => (
                  <TableRow key={cluster.cluster_id} className={index % 2 === 0 ? 'bg-white dark:bg-[#242424]' : 'bg-gray-50 dark:bg-[#1a2e23]'}>
                    <TableCell>
                      <Badge className="bg-[#8b6f47] dark:bg-[#a78a5e] hover:bg-[#8b6f47] dark:hover:bg-[#a78a5e] text-white">
                        {cluster.cluster_id}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-[#e5e5e5] font-medium">
                      {cluster.label}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5]">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-4 h-4" />
                        {cluster.petani_count}
                      </div>
                    </TableCell>
                    <TableCell className="text-center bg-amber-50 dark:bg-amber-900/20 font-bold text-gray-900 dark:text-[#e5e5e5]">
                      {formatNumber(cluster.karakteristik.avg_harga_jual || 0)}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5]">
                      {cluster.karakteristik.lama_fermentasi || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5]">
                      {cluster.karakteristik.proses_pengeringan || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center bg-amber-50 dark:bg-amber-900/20 font-bold text-gray-900 dark:text-[#e5e5e5]">
                      {cluster.karakteristik.metode_penjualan || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5]">
                      {cluster.karakteristik.bentuk_penyimpanan || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-[#e5e5e5]">
                      {cluster.karakteristik.sistem_penyimpanan || 'N/A'}
                    </TableCell>
                    <TableCell className="text-center bg-amber-50 dark:bg-amber-900/20 font-bold text-gray-900 dark:text-[#e5e5e5]">
                      {cluster.karakteristik.metode_pengolahan || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Insight Cards with Petani Names - UPDATED */}
        <div className="mb-8">
          <h3 className="text-gray-900 dark:text-[#e5e5e5] mb-6 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Daftar Petani dan Insight per Cluster
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {profilPasar?.clusters.map((cluster) => (
              <Card key={cluster.cluster_id} className="overflow-hidden border-2 border-gray-200 dark:border-white/10 hover:border-[#8b6f47] dark:hover:border-[#a78a5e] transition-all">
                <div className="bg-gradient-to-r from-[#8b6f47] to-[#a78a5e] p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-white text-[#8b6f47] hover:bg-white text-lg px-4 py-1">
                        Cluster {cluster.cluster_id}
                      </Badge>
                      <h4 className="text-white font-semibold text-xl">{cluster.label}</h4>
                    </div>
                    <Badge className="bg-white/20 text-white hover:bg-white/20 border-white/40 text-base px-3 py-1">
                      {cluster.petani_count} Petani
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6 bg-white dark:bg-[#242424]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daftar Petani */}
                    <div>
                      <h5 className="font-bold text-gray-800 dark:text-[#e5e5e5] mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#8b6f47]" />
                        Daftar Petani:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {cluster.petani_names && cluster.petani_names.length > 0 ? (
                          cluster.petani_names.map((name, idx) => (
                            <Badge key={idx} variant="outline" className="text-sm px-3 py-1 border-amber-300">
                              {name}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Data tidak tersedia</p>
                        )}
                      </div>
                    </div>

                    {/* Interpretasi & Insight */}
                    <div>
                      <h5 className="font-bold text-gray-800 dark:text-[#e5e5e5] mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        Interpretasi & Insight:
                      </h5>
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-500 dark:border-amber-400 rounded-r-lg p-4">
                        <p className="text-sm text-gray-800 dark:text-[#d4d4d4] leading-relaxed">
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
  if (label.includes('Premium')) {
    return `Petani yang sudah memasuki pasar premium dengan harga jual Rp ${avgHarga.toFixed(0)}/kg. Mayoritas menggunakan metode penjualan ${metodePenjualan} dengan pengolahan ${metodePengolahan}. Fokus pada peningkatan kualitas konsisten, sertifikasi produk (organik/fair trade), dan branding yang kuat untuk mempertahankan posisi di pasar premium serta membuka peluang ekspor.`;
  } else if (label.includes('Semi-Premium') || label.includes('Menengah')) {
    return `Petani dengan akses pasar menengah yang stabil (Rp ${avgHarga.toFixed(0)}/kg), menggunakan ${metodePenjualan} dan pengolahan ${metodePengolahan}. Potensi besar untuk naik ke pasar premium melalui peningkatan kualitas pengolahan pasca-panen, pengemasan yang lebih menarik, membangun branding lokal, dan mengakses channel distribusi yang lebih luas.`;
  } else {
    return `Petani yang masih berada di pasar lokal tradisional (Rp ${avgHarga.toFixed(0)}/kg) dengan ${metodePenjualan} dan metode pengolahan ${metodePengolahan}. Perlu pendampingan intensif untuk akses pasar yang lebih luas, peningkatan nilai jual melalui diversifikasi produk olahan kopi, pelatihan quality control, dan pembentukan kelompok tani untuk bargaining power yang lebih baik.`;
  }
}
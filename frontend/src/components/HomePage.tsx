// components/HomePage.tsx - CLEAN & SIMPLE
import { useEffect, useState } from "react";
import {
  MapPin,
  Users,
  Sprout,
  Coffee,
  DollarSign,
  TrendingUp,
  Package,
} from "lucide-react";
import {
  getDashboardSummary,
  getDistribusiJenisKopi,
  getDistribusiMetodePanen,
  getDistribusiMetodePengolahan,
  getDistribusiMetodePenjualan,
  getDistribusiVarietasKopi,
  getKelompokTaniVsHasil,
} from "../api/dashboard";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export function HomePage() {
  const [summary, setSummary] = useState<any>(null);
  const [pieCharts, setPieCharts] = useState({
    jenisKopi: [],
    metodePanen: [],
    metodePengolahan: [],
    metodePenjualan: [],
  });
  const [barCharts, setBarCharts] = useState({
    varietasKopi: [],
    kelompokVsHasil: [],
  });
  const [loading, setLoading] = useState(true);

  // Warna untuk PIE CHART - Multi color
  const PIE_COLORS = [
    "#2d5f3f", "#b45309", "#6b9d78", "#a78a5e", 
    "#d97706", "#c9a96e", "#3d6b4a", "#9d8860",
  ]; 

  // Filter data valid
  const filterValidData = (data: any[]) => {
    return data.filter(item => {
      if (!item.value || item.value <= 0) return false;
      const name = (item.name || '').toString().toLowerCase().trim();
      if (!name || name === '0' || name === '-' || name === 'null' || name === 'tidak ada' || name === 'none') {
        return false;
      }
      return true;
    });
  };

  // Fungsi untuk mengubah text menjadi Title Case (setiap kata diawali huruf besar)
  const toTitleCase = (str: string) => {
    if (!str) return str;
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Generate gradient colors untuk BAR CHART berdasarkan nilai (tinggi = gelap)
  const getBarColors = (data: any[]) => {
    if (data.length === 0) return [];
    
    const values = data.map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue;
    
    return data.map(item => {
      // Normalize value between 0 and 1
      const normalized = range === 0 ? 1 : (item.value - minValue) / range;
      // Opacity dari 0.5 (cukup terang) sampai 1.0 (sangat gelap) - range lebih kecil untuk gradient halus
      const opacity = 0.5 + (normalized * 0.5);
      
      // Base color: hijau kopi lebih gelap (#1a4d2e)
      const r = 26;
      const g = 77;
      const b = 46;
      
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          summaryData,
          jenisKopi,
          metodePanen,
          metodePengolahan,
          metodePenjualan,
          varietasKopi,
          kelompokHasil,
        ] = await Promise.all([
          getDashboardSummary(),
          getDistribusiJenisKopi(),
          getDistribusiMetodePanen(),
          getDistribusiMetodePengolahan(),
          getDistribusiMetodePenjualan(),
          getDistribusiVarietasKopi(),
          getKelompokTaniVsHasil(),
        ]);

        setSummary(summaryData);

        setPieCharts({
          jenisKopi: filterValidData(jenisKopi.map((d: any) => ({ name: d.kategori, value: d.jumlah }))).map(item => ({ ...item, name: toTitleCase(item.name) })),
          metodePanen: filterValidData(metodePanen.map((d: any) => ({ name: d.kategori, value: d.jumlah }))).map(item => ({ ...item, name: toTitleCase(item.name) })),
          metodePengolahan: filterValidData(metodePengolahan.map((d: any) => ({ name: d.kategori, value: d.jumlah }))).map(item => ({ ...item, name: toTitleCase(item.name) })),
          metodePenjualan: filterValidData(metodePenjualan.map((d: any) => ({ name: d.kategori, value: d.jumlah }))).map(item => ({ ...item, name: toTitleCase(item.name) })),
        });

        setBarCharts({
          varietasKopi: filterValidData(varietasKopi.map((d: any) => ({ name: d.varietas, value: d.jumlah }))).map(item => ({ ...item, name: toTitleCase(item.name) })),
          kelompokVsHasil: filterValidData(kelompokHasil.map((d: any) => ({ name: d.kelompok, value: d.total_hasil }))).map(item => ({ ...item, name: toTitleCase(item.name) })),
        });
      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-50 to-amber-50">
        <div className="text-center">
          <Coffee className="w-16 h-16 mx-auto mb-4 text-[#2d5f3f] animate-pulse" />
          <p className="text-lg text-gray-600 font-medium">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = summary
    ? [
        {
          icon: Users,
          label: "Total Petani",
          value: summary.total_petani?.toLocaleString("id-ID") || "0",
          unit: "Orang",
          iconBg: "#10b981",
        },
        {
          icon: Sprout,
          label: "Total Lahan",
          value: summary.total_lahan_ha?.toLocaleString("id-ID") || "0",
          unit: "Ha",
          iconBg: "#16a34a",
        },
        {
          icon: Package,
          label: "Kapasitas Produksi",
          value: summary.kapasitas_produksi_kg_tahun?.toLocaleString("id-ID") || "0",
          unit: "kg/tahun",
          iconBg: "#f59e0b",
        },
        {
          icon: DollarSign,
          label: "Rata-Rata Harga",
          value: summary.rata_rata_harga_rp > 0 
            ? `Rp ${summary.rata_rata_harga_rp.toLocaleString("id-ID")}`
            : "Rp 0",
          unit: "/kg",
          iconBg: "#eab308",
        },
        {
          icon: Coffee,
          label: "Total Populasi Kopi",
          value: summary.total_populasi_kopi?.toLocaleString("id-ID") || "0",
          unit: "Pohon",
          iconBg: "#f43f5e",
        },
      ]
    : [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-xl border-2 border-[#2d5f3f]">
          <p className="text-sm font-bold text-gray-800">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            <span className="font-bold text-[#2d5f3f]">{payload[0].value.toLocaleString("id-ID")}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.03) return null;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x} y={y} fill="#1f2937"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{ fontSize: '10px', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const PieChartCard = ({ data, title }: { data: any[]; title: string }) => {
    const validData = filterValidData(data);
    return (
      <div className="flex-1 bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 border border-gray-200 min-w-0">
        <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
          <div className="w-1 h-4 bg-gradient-to-b from-[#2d5f3f] to-[#4a7c59] rounded-full"></div>
          {title}
        </h3>
        {validData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={validData} cx="50%" cy="50%"
                labelLine={true} label={renderCustomLabel}
                outerRadius={60} fill="#8884d8"
                dataKey="value" paddingAngle={2}
              >
                {validData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                iconType="circle" iconSize={6}
                wrapperStyle={{ fontSize: "9px" }}
                formatter={(value) => {
                  const str = value.toString();
                  return str.length > 15 ? str.substring(0, 15) + "..." : str;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-400 text-xs">
            Tidak ada data
          </div>
        )}
      </div>
    );
  };

  const BarChartCard = ({ data, title }: { data: any[]; title: string }) => {
    const validData = filterValidData(data);
    const barColors = getBarColors(validData);
    
    return (
      <div className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 border border-gray-200">
        <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <div className="w-1.5 h-5 bg-gradient-to-b from-[#8b6f47] to-[#a78a5e] rounded-full"></div>
          {title}
        </h3>
        {validData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={validData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {validData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={barColors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
            Tidak ada data
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 relative overflow-hidden rounded-2xl p-8 text-white shadow-2xl" style={{ backgroundColor: '#2d5f3f' }}>
          <div className="absolute top-0 right-0 w-56 h-56 opacity-10">
            <Coffee className="w-full h-full" style={{ color: '#ffffff' }} />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">
              Dashboard Monitoring Produksi Kopi
            </h1>
            <div className="flex items-center text-white text-lg">
              <MapPin className="w-6 h-6 mr-2" />
              <span className="font-medium">Kecamatan Doko, Kabupaten Blitar</span>
            </div>
            <div className="mt-4">
              <div className="inline-block px-4 py-2 rounded-lg border border-white" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                <p className="text-xs text-white">Update Terakhir</p>
                <p className="text-sm font-semibold text-white">
                  {new Date().toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS - 5 KOLOM HORIZONTAL SEJAJAR */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#2d5f3f]" />
            <h2 className="text-xl font-bold text-gray-800">Ringkasan Statistik</h2>
          </div>
          <div className="flex gap-3 w-full">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="flex-1 bg-white rounded-xl p-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 min-w-0"
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md mb-3"
                    style={{ backgroundColor: stat.iconBg }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-xs text-gray-600 mb-2 font-medium leading-tight">{stat.label}</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-lg font-bold text-gray-900 break-words leading-tight">{stat.value}</p>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{stat.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PIE CHARTS - 4 KOLOM HORIZONTAL SEJAJAR */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-[#2d5f3f]" />
            <h2 className="text-xl font-bold text-gray-800">Distribusi Data Petani</h2>
          </div>
          <div className="flex gap-3 w-full">
            <PieChartCard data={pieCharts.jenisKopi} title="Jenis Kopi" />
            <PieChartCard data={pieCharts.metodePenjualan} title="Metode Penjualan" />
            <PieChartCard data={pieCharts.metodePanen} title="Metode Panen" />
            <PieChartCard data={pieCharts.metodePengolahan} title="Metode Pengolahan" />
          </div>
        </div>

        {/* BAR CHARTS - 2 KOLOM */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Coffee className="w-5 h-5 text-[#2d5f3f]" />
            <h2 className="text-xl font-bold text-gray-800">Analisis Produksi</h2>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <BarChartCard data={barCharts.varietasKopi} title="Distribusi Varietas Kopi" />
            <BarChartCard data={barCharts.kelompokVsHasil} title="Hasil Produksi per Kelompok Tani" />
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] flex items-center justify-center shadow-md">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Data Real-Time dari Database</p>
                <p className="text-xs text-gray-500">Sistem monitoring terintegrasi dengan database produksi</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Powered by</p>
              <p className="text-base font-bold text-[#2d5f3f]">Smart Dashboard Kopi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
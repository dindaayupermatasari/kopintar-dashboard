import { useEffect, useState, useRef } from "react";
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode changes
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);

  // FIX: Set background body dan html agar mengikuti dark mode
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    if (isDarkMode) {
      root.style.backgroundColor = '#121212';
      body.style.backgroundColor = '#121212';
    } else {
      root.style.backgroundColor = '#faf9f7';
      body.style.backgroundColor = '#faf9f7';
    }
    
    return () => {
      root.style.backgroundColor = '';
      body.style.backgroundColor = '';
    };
  }, [isDarkMode]);

  // Warna untuk PIE CHART - Multi color
  const PIE_COLORS = [
    "#2d5f3f", "#b45309", "#6b9d78", "#a78a5e", 
    "#d97706", "#c9a96e", "#3d6b4a", "#9d8860",
  ]; 

  // FUNGSI BARU: Menggabungkan data dengan nama yang sama
  const groupDataByName = (data: any[]) => {
    const grouped = new Map();
    
    data.forEach(item => {
      const normalizedName = toTitleCase((item.name || '').toString().trim());
      
      if (grouped.has(normalizedName)) {
        grouped.set(normalizedName, grouped.get(normalizedName) + item.value);
      } else {
        grouped.set(normalizedName, item.value);
      }
    });
    
    return Array.from(grouped, ([name, value]) => ({ name, value }));
  };

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

  // Fungsi untuk mengubah text menjadi Title Case
  const toTitleCase = (str: string) => {
    if (!str) return str;
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Generate gradient colors untuk BAR CHART
  const getBarColors = (data: any[]) => {
    if (data.length === 0) return [];
    
    const values = data.map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue;
    
    return data.map(item => {
      const normalized = range === 0 ? 1 : (item.value - minValue) / range;
      const opacity = 0.5 + (normalized * 0.5);
      
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
          jenisKopi: groupDataByName(filterValidData(jenisKopi.map((d: any) => ({ name: d.kategori, value: d.jumlah })))),
          metodePanen: groupDataByName(filterValidData(metodePanen.map((d: any) => ({ name: d.kategori, value: d.jumlah })))),
          metodePengolahan: groupDataByName(filterValidData(metodePengolahan.map((d: any) => ({ name: d.kategori, value: d.jumlah })))),
          metodePenjualan: groupDataByName(filterValidData(metodePenjualan.map((d: any) => ({ name: d.kategori, value: d.jumlah })))),
        });

        setBarCharts({
          varietasKopi: groupDataByName(filterValidData(varietasKopi.map((d: any) => ({ name: d.varietas, value: d.jumlah })))),
          kelompokVsHasil: groupDataByName(filterValidData(kelompokHasil.map((d: any) => ({ name: d.kelompok, value: d.total_hasil })))),
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
      <div 
        className="flex items-center justify-center h-screen"
        style={{ 
          backgroundColor: isDarkMode ? '#121212' : '#faf9f7',
          background: isDarkMode 
            ? 'linear-gradient(135deg, #121212 0%, #1a1a1a 50%, #121212 100%)'
            : 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #fef3c7 100%)'
        }}
      >
        <div className="text-center">
          <Coffee className="w-16 h-16 mx-auto mb-4 text-[#2d5f3f] dark:text-green-400 animate-pulse" />
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">Memuat data dashboard...</p>
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
        <div 
          className="p-3 rounded-lg shadow-xl border-2 border-[#2d5f3f] dark:border-green-500"
          style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }}
        >
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{payload[0].name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-bold text-[#2d5f3f] dark:text-green-400">{payload[0].value.toLocaleString("id-ID")}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipWithUnit = ({ active, payload, unit }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="p-3 rounded-lg shadow-xl border-2 border-[#2d5f3f] dark:border-green-500"
          style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }}
        >
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{payload[0].name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-bold text-[#2d5f3f] dark:text-green-400">{payload[0].value.toLocaleString("id-ID")}</span>
            {unit && <span className="text-xs ml-1 text-gray-500 dark:text-gray-400">{unit}</span>}
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
    
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    return (
      <text
        x={x} y={y} 
        fill={isDarkMode ? '#f3f4f6' : '#1f2937'}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{ fontSize: '10px', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const PieChartCard = ({ data, title, unit }: { data: any[]; title: string; unit?: string }) => {
    const validData = filterValidData(data);
    const chartRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      const timeout = setTimeout(() => {
        if (chartRef.current) {
          const svgs = chartRef.current.querySelectorAll('svg');
          svgs.forEach((svg: any) => {
            svg.style.backgroundColor = 'transparent';
          });
        }
      }, 100);
      
      return () => clearTimeout(timeout);
    }, [validData]);
    
    return (
      <div 
        className="flex-1 rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 border border-gray-300 dark:border-gray-600 min-w-0"
        style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }}
      >
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
          <div className="w-1 h-4 bg-gradient-to-b from-[#2d5f3f] to-[#4a7c59] dark:from-green-500 dark:to-green-600 rounded-full"></div>
          {title}
        </h3>
        {validData.length > 0 ? (
          <div ref={chartRef}>
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
                <Tooltip content={<CustomTooltipWithUnit unit={unit} />} />
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
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
            Tidak ada data
          </div>
        )}
      </div>
    );
  };

  const BarChartCard = ({ data, title, unit, xLabel, yLabel }: { data: any[]; title: string; unit?: string; xLabel?: string; yLabel?: string }) => {
    const validData = filterValidData(data);
    const barColors = getBarColors(validData);
    const chartRef = useRef<HTMLDivElement>(null);
    
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? "#e5e7eb" : "#4b5563";
    const gridColor = isDark ? "#4b5563" : "#e5e7eb";
    
    useEffect(() => {
      const timeout = setTimeout(() => {
        if (chartRef.current) {
          const svgs = chartRef.current.querySelectorAll('svg');
          svgs.forEach((svg: any) => {
            svg.style.backgroundColor = 'transparent';
          });
        }
      }, 100);
      
      return () => clearTimeout(timeout);
    }, [validData]);
    
    const maxValue = Math.max(...validData.map(d => d.value));
    const isHasilProduksi = title.includes("Hasil Produksi");
    
    let yAxisProps: any = {
      tick: { fontSize: 10, fill: textColor },
      label: { value: yLabel || '', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fontWeight: 'bold', fill: textColor, textAnchor: 'middle' } }
    };
    
    if (isHasilProduksi) {
      const maxRounded = Math.ceil(maxValue / 500) * 500 + 500;
      const ticks = [];
      for (let i = 0; i <= maxRounded; i += 500) {
        ticks.push(i);
      }
      yAxisProps.domain = [0, maxRounded];
      yAxisProps.ticks = ticks;
    }
    
    return (
      <div 
        className="rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 border border-gray-300 dark:border-gray-600"
        style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }}
      >
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
          <div className="w-1.5 h-5 bg-gradient-to-b from-[#8b6f47] to-[#a78a5e] dark:from-amber-600 dark:to-amber-700 rounded-full"></div>
          {title}
        </h3>
        {validData.length > 0 ? (
          <div ref={chartRef}>
            <ResponsiveContainer width="100%" height={310}>
              <BarChart 
                data={validData} 
                margin={{ bottom: 5, left: 10, right: 10, top: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: textColor }} 
                  angle={-25} 
                  textAnchor="end" 
                  height={85}
                  interval={0}
                  label={{ value: xLabel || '', position: 'insideBottom', offset: 0, style: { fontSize: 11, fontWeight: 'bold', fill: textColor } }}
                  stroke={gridColor}
                />
                <YAxis {...yAxisProps} stroke={gridColor} />
                <Tooltip content={<CustomTooltipWithUnit unit={unit} />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {validData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[310px] flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
            Tidak ada data
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen w-full p-6" 
      style={{ 
        backgroundColor: isDarkMode ? '#121212' : '#faf9f7',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #121212 0%, #1a1a1a 50%, #121212 100%)'
          : 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #fef3c7 100%)'
      }}
    >
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 relative overflow-visible rounded-2xl p-8 text-white shadow-2xl bg-[#2d5f3f] dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-800">
          <div className="flex items-center justify-between gap-8">
            <div className="relative z-10 flex-1">
              <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">
                Dashboard Monitoring Produksi Kopi
              </h1>
              <div className="flex items-center text-white text-lg">
                <MapPin className="w-6 h-6 mr-2" />
                <span className="font-medium">Kecamatan Doko, Kabupaten Blitar</span>
              </div>
              <div className="mt-4">
                <div className="inline-block px-4 py-2 rounded-lg border border-white bg-white/15 dark:bg-white/10 dark:border-gray-400">
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
            <div className="flex items-center justify-center opacity-30 dark:opacity-25">
              <Coffee style={{ width: '150px', height: '150px' }} className="text-white" />
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#2d5f3f] dark:text-green-400" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Ringkasan Statistik</h2>
          </div>
          <div className="flex gap-3 w-full">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-xl p-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-300 dark:border-gray-600 min-w-0"
                  style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }}
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md mb-3"
                    style={{ backgroundColor: stat.iconBg }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 font-medium leading-tight">{stat.label}</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100 break-words leading-tight">{stat.value}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{stat.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PIE CHARTS */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-[#2d5f3f] dark:text-green-400" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Distribusi Data Petani</h2>
          </div>
          <div className="flex gap-3 w-full">
            <PieChartCard data={pieCharts.jenisKopi} title="Jenis Kopi" unit=" Petani" />
            <PieChartCard data={pieCharts.metodePenjualan} title="Metode Penjualan" unit=" Petani" />
            <PieChartCard data={pieCharts.metodePanen} title="Metode Panen" unit=" Petani" />
            <PieChartCard data={pieCharts.metodePengolahan} title="Metode Pengolahan" unit=" Petani" />
          </div>
        </div>

        {/* BAR CHARTS */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Coffee className="w-5 h-5 text-[#2d5f3f] dark:text-green-400" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Analisis Produksi</h2>
          </div>
          <div className="flex gap-6 w-full">
            <div className="flex-1">
              <BarChartCard 
                data={barCharts.varietasKopi} 
                title="Distribusi Varietas Kopi" 
                unit=" Petani"
                xLabel="Varietas Kopi"
                yLabel="Jumlah Petani"
              />
            </div>
            <div className="flex-1">
              <BarChartCard 
                data={barCharts.kelompokVsHasil} 
                title="Hasil Produksi" 
                unit=" kg"
                xLabel="Kelompok Tani"
                yLabel="Hasil Produksi (kg)"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div 
          className="mt-8 rounded-xl shadow-md p-5 border border-gray-300 dark:border-gray-600"
          style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] dark:from-green-600 dark:to-green-700 flex items-center justify-center shadow-md">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Data Real-Time dari Database</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Sistem monitoring terintegrasi dengan database produksi</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 dark:text-gray-400">Powered by</p>
              <p className="text-base font-bold text-[#2d5f3f] dark:text-green-400">Smart Dashboard Kopi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
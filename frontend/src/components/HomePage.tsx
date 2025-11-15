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
      root.style.backgroundColor = '#ffffff';
      body.style.backgroundColor = '#ffffff';
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
          varietasKopi: groupDataByName(filterValidData(varietasKopi.map((d: any) => ({ name: d.varietas, value: d.jumlah })))).sort((a, b) => b.value - a.value),
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
          backgroundColor: isDarkMode ? '#121212' : '#ffffff',
          background: isDarkMode 
            ? 'linear-gradient(135deg, #121212 0%, #1a1a1a 50%, #121212 100%)'
            : '#ffffff'
        }}
      >
        <div className="text-center">
          <Coffee className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-[#2d5f3f] dark:text-green-400 animate-pulse" />
          <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-300 font-medium px-4">Memuat data dashboard...</p>
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
        className="flex-1 rounded-xl shadow-lg p-3 sm:p-4 hover:shadow-xl transition-all duration-300 border border-gray-300 dark:border-gray-600 min-w-0"
        style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }}
      >
        <h3 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
          <div className="w-1 h-3 sm:h-4 bg-gradient-to-b from-[#2d5f3f] to-[#4a7c59] dark:from-green-500 dark:to-green-600 rounded-full"></div>
          <span className="truncate">{title}</span>
          {title}
        </h3>
        {validData.length > 0 ? (
          <div ref={chartRef}>
            <ResponsiveContainer width="100%" height={180} className="sm:h-[200px]">
              <PieChart>
                <Pie
                  data={validData} cx="50%" cy="50%"
                  labelLine={true} label={renderCustomLabel}
                  outerRadius={55} fill="#8884d8"
                  dataKey="value" paddingAngle={2}
                >
                  {validData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltipWithUnit unit={unit} />} />
                <Legend 
                  iconType="circle" iconSize={5}
                  wrapperStyle={{ fontSize: "8px" }}
                  formatter={(value) => {
                    const str = value.toString();
                    return str.length > 15 ? str.substring(0, 12) + "..." : str;
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
        className="rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-5 hover:shadow-xl transition-all duration-300 border border-gray-300 dark:border-gray-600"
        style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }}
      >
        <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-100 mb-2 sm:mb-3 flex items-center gap-2">
          <div className="w-1 sm:w-1.5 h-4 sm:h-5 bg-gradient-to-b from-[#8b6f47] to-[#a78a5e] dark:from-amber-600 dark:to-amber-700 rounded-full"></div>
          <span className="truncate">{title}</span>
          {title}
        </h3>
        {validData.length > 0 ? (
          <div ref={chartRef}>
            <ResponsiveContainer width="100%" height={280} className="sm:h-[310px]">
              <BarChart 
                data={validData} 
                margin={{ bottom: 5, left: 5, right: 5, top: 15 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 9, fill: textColor }} 
                  angle={-25} 
                  textAnchor="end" 
                  height={75}
                  interval={0}
                  label={{ value: xLabel || '', position: 'insideBottom', offset: 0, style: { fontSize: 11, fontWeight: 'bold', fill: textColor } }}
                  stroke={gridColor}
                />
                <YAxis {...yAxisProps} stroke={gridColor} width={45} />
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
      className="min-h-screen w-full p-3 sm:p-4 lg:p-6" 
      style={{ 
        backgroundColor: isDarkMode ? '#121212' : '#ffffff',
        background: isDarkMode 
          ? 'linear-gradient(135deg, #121212 0%, #1a1a1a 50%, #121212 100%)'
          : '#ffffff'
      }}
    >
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER */}
        <div className="mb-6 sm:mb-8 relative overflow-hidden rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 text-white shadow-2xl bg-[#2d5f3f] dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 lg:gap-8">
            {/* Left Side - Content */}
            <div className="relative z-10 flex-1 space-y-3 sm:space-y-3.5">
              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg leading-tight">
                Dashboard Monitoring Produksi Kopi
              </h1>
              
              {/* Location - ICON DIPERBESAR */}
              <div className="flex items-center gap-2.5">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white shrink-0" />
                <span className="text-sm sm:text-base lg:text-lg font-medium text-white leading-snug">
                  Kecamatan Doko, Kabupaten Blitar
                </span>
              </div>

              {/* Update Badge */}
              <div className="inline-block">
                <div className="px-3 sm:px-4 py-2 rounded-lg border border-white/50 bg-white/15 dark:bg-white/10 dark:border-gray-400">
                  <p className="text-xs text-white/90">Update Terakhir</p>
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    {new Date().toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Coffee Icon TETAP 150px */}
            <div className="flex items-center justify-center sm:justify-end opacity-30 dark:opacity-25 flex-shrink-0">
              <Coffee style={{ width: '150px', height: '150px' }} className="text-white" />
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#2d5f3f] dark:text-green-400 shrink-0" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100">Ringkasan Statistik</h2>
          </div>
          
          {/* SOLUTION: flex-wrap untuk auto-wrap jika tidak muat */}
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="flex-1 min-w-[140px] sm:min-w-[160px] rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }}
                >
                  <div 
                    className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md mb-2 sm:mb-3"
                    style={{ backgroundColor: stat.iconBg }}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-1 sm:mb-2 font-medium leading-tight line-clamp-2">{stat.label}</p>
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-gray-100 break-words leading-tight">{stat.value}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{stat.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PIE CHARTS */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#2d5f3f] dark:text-green-400 shrink-0" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100">Distribusi Data Petani</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            <PieChartCard data={pieCharts.jenisKopi} title="Jenis Kopi" unit=" Petani" />
            <PieChartCard data={pieCharts.metodePenjualan} title="Metode Penjualan" unit=" Petani" />
            <PieChartCard data={pieCharts.metodePanen} title="Metode Panen" unit=" Petani" />
            <PieChartCard data={pieCharts.metodePengolahan} title="Metode Pengolahan" unit=" Petani" />
          </div>
        </div>

        {/* BAR CHARTS */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-[#2d5f3f] dark:text-green-400 shrink-0" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100">Analisis Produksi</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 w-full">
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
          className="mt-4 sm:mt-6 lg:mt-8 rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 lg:p-5 border border-gray-300 dark:border-gray-600"
          style={{ backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff' }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] dark:from-green-600 dark:to-green-700 flex items-center justify-center shadow-md">
                <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100">Data Real-Time dari Database</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Sistem monitoring terintegrasi dengan database produksi</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="t-xs text-gray-600 dark:text-gray-400">Powered by</p>
              <p className="t-sm sm:text-base font-bold text-[#2d5f3f] dark:text-green-400">Smart Dashboard Kopi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
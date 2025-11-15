import { Coffee, TrendingUp, BarChart3, Users, Sparkles, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const [imageError, setImageError] = useState(false);

  const features = [
    {
      icon: BarChart3,
      title: 'Analytics Real-time',
      description: 'Monitoring produksi kopi secara real-time dengan visualisasi data yang interaktif',
    },
    {
      icon: Users,
      title: 'Manajemen Petani',
      description: 'Kelola data petani kopi dengan sistem yang terorganisir dan mudah diakses',
    },
    {
      icon: TrendingUp,
      title: 'Clustering Analysis',
      description: 'Analisis produktivitas petani dengan algoritma clustering berbasis AI',
    },
    {
      icon: Sparkles,
      title: 'AI Recommendation',
      description: 'Dapatkan rekomendasi solusi permasalahan dari asisten AI yang cerdas',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf9f7] via-white to-green-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Coffee className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <h3 className="text-[#2d5f3f] text-base sm:text-lg md:text-xl font-bold whitespace-nowrap">Kopintar</h3>
          </div>
          <button 
            onClick={onEnter}
            className="bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59] hover:from-[#3d7050] hover:to-[#5a8c69] text-white gap-1 sm:gap-2 text-xs sm:text-sm md:text-base px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center shadow-md hover:shadow-lg whitespace-nowrap flex-shrink-0"
          >
            <span className="hidden sm:inline">Masuk Dashboard</span>
            <span className="sm:hidden">Masuk</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ paddingTop: '80px', paddingBottom: '100px' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#2d5f3f] mb-3 sm:mb-4 leading-tight">
                Kopintar
              </h1>
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-3 sm:mb-4 md:mb-6 font-medium leading-snug">
                Dashboard Analitik dan Monitoring Produksi Kopi Berbasis AI 
                di Kecamatan Doko, Kabupaten Blitar, Jawa Timur
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 md:mb-8 leading-relaxed">
                Platform monitoring dan analisis produktivitas petani kopi yang menggunakan teknologi AI untuk memberikan insight dan rekomendasi yang akurat, membantu meningkatkan kesejahteraan petani kopi di Indonesia.
              </p>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-[#2d5f3f]/20 to-[#8b6f47]/20 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl"></div>
              {!imageError ? (
                <img
                  src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80"
                  alt="Petani Kopi Indonesia"
                  className="relative rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl w-full h-[180px] sm:h-[240px] md:h-[300px] lg:h-[380px] xl:h-[420px] object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="relative rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl w-full h-[180px] sm:h-[240px] md:h-[300px] lg:h-[380px] xl:h-[420px] bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] flex items-center justify-center">
                  <Coffee className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 text-white/30" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Spacer - Jarak antara Hero dan Features */}
      <div className="h-16"></div>

      {/* Features Section */}
      <section style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Sistem lengkap untuk monitoring dan meningkatkan produktivitas petani kopi dengan teknologi terkini
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mb-8 sm:mb-10 md:mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="p-5 sm:p-6 bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg flex-shrink-0">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <p className="text-gray-500 text-xs sm:text-sm">
              ©Kopintar - Dashboard Monitoring Kopi Berbasis AI
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
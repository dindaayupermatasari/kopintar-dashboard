import { Coffee, TrendingUp, BarChart3, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
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
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] rounded-xl flex items-center justify-center shadow-lg">
              <Coffee className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-[#2d5f3f]">Kopintar</h3>
          </div>
          <Button 
            onClick={onEnter}
            className="bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59] hover:from-[#3d7050] hover:to-[#5a8c69] text-white gap-2"
          >
            Masuk Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-[#2d5f3f] mb-4 leading-tight">
              Kopintar
            </h1>
            <h2 className="text-gray-700 mb-6">
              Dashboard Analitik dan Monitoring Produksi Kopi Berbasis AI 
              di Kecamatan Doko, Kabupaten Blitar, Jawa Timur
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Platform monitoring dan analisis produktivitas petani kopi yang menggunakan teknologi AI untuk memberikan insight dan rekomendasi yang akurat, membantu meningkatkan kesejahteraan petani kopi di Indonesia.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#2d5f3f]/20 to-[#8b6f47]/20 rounded-3xl blur-2xl"></div>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80"
              alt="Petani Kopi Indonesia"
              className="relative rounded-2xl shadow-2xl w-full h-[500px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-gray-900 mb-4">Fitur Unggulan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Sistem lengkap untuk monitoring dan meningkatkan produktivitas petani kopi dengan teknologi terkini
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-sm">©Kopintar - Dashboard Monitoring Kopi Berbasis AI</p>
        </div>
      </section>
    </div>
  );
}

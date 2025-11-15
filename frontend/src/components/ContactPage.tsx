import { Mail, MapPin, Clock, MessageCircle, Instagram } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'kopintar.doko@gmail.com',
      link: 'https://mail.google.com/mail/?view=cm&fs=1&to=kopintar.doko@gmail.com',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: MapPin,
      title: 'Alamat',
      value: 'Jl. Raya ITS, Keputih, Sukolilo, Surabaya, Jawa Timur 60111',
      link: '#',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: Clock,
      title: 'Jam Operasional',
      value: 'Senin - Jumat, 08:00 - 16:00 WIB',
      link: '#',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const handleWhatsAppClick = () => {
    const phoneNumber = '6285183385395';
    const message = 'Halo, saya ingin bertanya tentang Kopintar';
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2d5f3f] dark:text-green-400 mb-2">
          Hubungi Kami
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Ada pertanyaan atau butuh bantuan? Tim kami siap membantu Anda
        </p>
      </div>

      {/* Contact Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Contact Info Card */}
        <Card className="p-4 sm:p-6 text-white shadow-lg border-0 flex flex-col bg-gradient-to-br from-[#8b6f47] to-[#a78a5e] dark:from-[#3b2412] dark:to-[#5c3a1f]">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
            Informasi Kontak
          </h3>
          <p className="text-xs sm:text-sm text-white/80 mb-4 sm:mb-5">
            Hubungi kami melalui berbagai channel yang tersedia.
          </p>
          <div className="space-y-3 sm:space-y-4 flex-1 flex flex-col justify-between">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <a
                  key={index}
                  href={info.link}
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-5 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-200"
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${info.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-white/70 mb-1 sm:mb-2">
                      {info.title}
                    </p>
                    <p className="text-sm sm:text-base text-white break-words leading-relaxed">
                      {info.value}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </Card>

        {/* WhatsApp & Instagram Cards */}
        <div className="flex flex-col gap-4 sm:gap-6 h-full">
          {/* WhatsApp Card */}
          <Card className="p-4 sm:p-5 text-white shadow-md border-0 flex-1 flex flex-col transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] dark:from-[#1a2e23] dark:to-[#2d4a35]">
            <div className="flex items-center gap-3 mb-2 sm:mb-2.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Chat via WhatsApp
                </h3>
                <p className="text-xs text-white/80">Respon cepat & otomatis</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-white/90 mb-3 leading-relaxed">
              Dapatkan bantuan langsung melalui bot WhatsApp kami. Sistem otomatis kami siap menjawab pertanyaan Anda 24/7.
            </p>
            <Button
              onClick={handleWhatsAppClick}
              className="w-full bg-white/20 hover:bg-white/30 text-white gap-2 font-semibold text-sm sm:text-base py-2 sm:py-2.5"
            >
              <MessageCircle className="w-4 h-4" />
              Mulai Chat WhatsApp
            </Button>
          </Card>

          {/* Instagram Card */}
          <Card 
            className="p-4 sm:p-5 text-white shadow-md border-0 flex-1 flex flex-col transition-all duration-300 hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)' }}
          >
            <div className="flex items-center gap-3 mb-2 sm:mb-2.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Follow Instagram
                </h3>
                <p className="text-xs text-white/80">@sdtpens</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-white/90 mb-3 leading-relaxed">
              Ikuti Instagram kami untuk informasi terkini seputar teknologi, kegiatan mahasiswa,
              dan event di Politeknik Elektronika Negeri Surabaya.
            </p>
            <Button
              onClick={() => window.open('https://instagram.com/sdtpens', '_blank')}
              className="w-full bg-white/20 hover:bg-white/30 text-white gap-2 font-semibold text-sm sm:text-base py-2 sm:py-2.5"
            >
              <Instagram className="w-4 h-4" />
              Kunjungi Instagram
            </Button>
          </Card>
        </div>
      </div>

      {/* Map Section */}
      <Card className="p-4 sm:p-6 bg-white dark:bg-[#242424] shadow-md border-0">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
          Lokasi Kami
        </h3>
        <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] bg-gray-100 dark:bg-gray-900/50 rounded-xl overflow-hidden">
          <iframe
            src="https://maps.google.com/maps?q=Politeknik+Elektronika+Negeri+Surabaya&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </Card>
    </div>
  );
}
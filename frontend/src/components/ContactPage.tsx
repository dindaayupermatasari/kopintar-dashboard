import { Mail, MapPin, Clock, MessageCircle, Instagram } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

export function ContactPage() {
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
    <div className="dark:text-gray-100">
      <div className="mb-8">
        <h1 className="text-[#2d5f3f] dark:text-green-400 mb-2">Hubungi Kami</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ada pertanyaan atau butuh bantuan? Tim kami siap membantu Anda
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Contact Info */}
        <Card className="p-6 bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] dark:from-[#1a2e23] dark:to-[#2d4a35] text-white shadow-lg border-0 flex flex-col">
          <h3 className="text-white mb-3">Informasi Kontak</h3>
          <p className="text-sm text-white/80 mb-5">
            Hubungi kami melalui berbagai channel yang tersedia.
          </p>
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <a
                  key={index}
                  href={info.link}
                  className="flex items-start gap-4 p-5 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-200"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${info.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/70 mb-2">{info.title}</p>
                    <p className="text-base text-white break-words leading-relaxed">{info.value}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </Card>

        {/* WhatsApp Bot & Instagram */}
        <div className="flex flex-col gap-2.5">
          {/* WhatsApp Bot Card */}
          <Card className="p-5 bg-white dark:bg-gray-800 shadow-md border-0 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-gray-100">Chat via WhatsApp</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Respon cepat & otomatis</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex-1">
              Dapatkan bantuan langsung melalui bot WhatsApp kami. Sistem otomatis kami siap menjawab pertanyaan Anda 24/7.
            </p>
            <Button 
              onClick={handleWhatsAppClick}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Mulai Chat WhatsApp
            </Button>
          </Card>

          {/* Instagram Card */}
          <Card className="p-5 bg-white dark:bg-gray-800 shadow-md border-0 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)' }}>
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-gray-100">Follow Instagram</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">@sdtpens</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex-1">
              Ikuti Instagram kami untuk informasi terkini seputar teknologi, kegiatan mahasiswa, dan event di Politeknik Elektronika Negeri Surabaya.
            </p>
            <Button 
              onClick={() => window.open('https://instagram.com/sdtpens', '_blank')}
              className="w-full text-white gap-2"
              style={{ background: 'linear-gradient(90deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)' }}
            >
              <Instagram className="w-4 h-4" />
              Kunjungi Instagram
            </Button>
          </Card>
        </div>
      </div>

      {/* Map Section */}
      <Card className="p-6 bg-white dark:bg-gray-800 shadow-md border-0">
        <h3 className="text-gray-900 dark:text-gray-100 mb-4">Lokasi Kami</h3>
        <div className="w-full h-[400px] bg-gray-100 dark:bg-gray-900/50 rounded-xl overflow-hidden">
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

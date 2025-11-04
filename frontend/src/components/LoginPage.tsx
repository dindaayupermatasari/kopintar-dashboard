import { useState } from 'react';
import { Coffee, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import api from '../api/api';

interface LoginPageProps {
  onLogin: (token: string) => void;
  onBack: () => void;
}

export function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔐 Attempting login with:', { username: loginData.username });
      
      // PENTING: Encode data sebagai URLSearchParams untuk application/x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append('username', loginData.username);
      params.append('password', loginData.password);
      
      console.log('📤 Sending request to /token endpoint...');
      console.log('📦 Request data:', params.toString());
      
      // Kirim request ke backend dengan Content-Type yang benar
      const response = await api.post('/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log('✅ Login response:', response.data);
      
      const token = response.data.access_token;
      
      if (!token) {
        throw new Error('Token tidak diterima dari server');
      }
      
      // Simpan token ke localStorage
      localStorage.setItem('access_token', token);
      console.log('💾 Token saved to localStorage');
      
      // Berhasil login - kirim token ke parent component
      onLogin(token);
      
      // Reset form
      setLoginData({ username: '', password: '' });
    } catch (err: any) {
      console.error('❌ Login error:', err);
      console.error('📋 Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
      });
      
      if (err.response?.status === 401) {
        setError('Username atau password salah. Coba lagi dengan: admin / admin123');
      } else if (err.response?.status === 422) {
        setError('Format data tidak valid. Periksa input Anda.');
      } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError('❌ Tidak dapat terhubung ke server. Pastikan backend berjalan di http://127.0.0.1:8000');
      } else if (err.response?.data?.detail) {
        setError(`Error: ${err.response.data.detail}`);
      } else if (err.message) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Terjadi kesalahan saat login. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf9f7] via-white to-green-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Side - Image & Branding */}
        <div className="relative bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] p-12 flex flex-col justify-between text-white">
          <div className="absolute inset-0 opacity-10">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80"
              alt="Coffee Pattern"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Coffee className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-white">Kopintar</h2>
            </div>
            <h1 className="text-white mb-4 leading-tight">
              Dashboard Monitoring Kopi Berbasis AI
            </h1>
            <p className="text-white/90 leading-relaxed">
              Platform analitik dan monitoring produksi kopi untuk meningkatkan kesejahteraan petani di Kecamatan Doko, Kabupaten Blitar, Jawa Timur.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-10 h-10 bg-[#8b6f47] rounded-lg flex items-center justify-center">
                <span className="text-white">✓</span>
              </div>
              <div>
                <p className="text-sm text-white">Real-time Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-10 h-10 bg-[#8b6f47] rounded-lg flex items-center justify-center">
                <span className="text-white">✓</span>
              </div>
              <div>
                <p className="text-sm text-white">AI Recommendations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="p-12 flex flex-col justify-center">
          <button 
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-[#2d5f3f] mb-6 flex items-center gap-2 transition-colors"
            disabled={isLoading}
          >
            ← Kembali ke Beranda
          </button>

          <div className="w-full">
            <div className="mb-6">
              <h2 className="text-gray-900 mb-2">Selamat Datang Kembali!</h2>
              <p className="text-gray-600">Masukkan kredensial Anda untuk melanjutkan</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="username"
                    placeholder="Masukkan username"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    className="pl-10 border-gray-300 focus:border-[#2d5f3f]"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="pl-10 border-gray-300 focus:border-[#2d5f3f]"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-gray-600">Ingat saya</span>
                </label>
                <a href="#" className="text-[#2d5f3f] hover:underline">Lupa password?</a>
              </div>

              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59] hover:from-[#3d7050] hover:to-[#5a8c69] text-white gap-2"
                disabled={isLoading}
              >
                {isLoading ? 'Memproses...' : 'Login'}
                <ArrowRight className="w-4 h-4" />
              </Button>

              {/* Debug Info - Hapus setelah berhasil */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
                <p className="font-semibold text-blue-800 mb-1">📝 Kredensial Login:</p>
                <p className="text-blue-700">Username: <code className="bg-blue-100 px-1 py-0.5 rounded">admin</code></p>
                <p className="text-blue-700">Password: <code className="bg-blue-100 px-1 py-0.5 rounded">admin123</code></p>
                <p className="text-blue-600 mt-2 text-[10px]">
                  💡 Buka Console (F12) untuk melihat detail debugging
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Lock, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import api from '../api/api';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (token: string) => void;
}

export function LoginDialog({ isOpen, onClose, onLogin }: LoginDialogProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Membuat FormData untuk OAuth2PasswordRequestForm
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      // Kirim request ke backend
      const response = await api.post('/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      const token = response.data.access_token;
      
      // Berhasil login
      onLogin(token);
      setUsername('');
      setPassword('');
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError('Username atau password salah');
      } else {
        setError('Terjadi kesalahan saat login. Coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dark:bg-[#242424] dark:border-white/10 max-w-[380px] p-6">
        <DialogHeader>
          <DialogTitle className="dark:text-[#e5e5e5] text-center text-lg">
            Login Administrator
          </DialogTitle>
          <DialogDescription className="dark:text-[#a3a3a3] text-center text-sm">
            Masukkan kredensial untuk melanjutkan
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <div className="space-y-2">
            <Label htmlFor="username" className="dark:text-[#e5e5e5]">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 dark:bg-[#1a2e23] dark:border-white/10 dark:text-[#e5e5e5]"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="dark:text-[#e5e5e5]">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 dark:bg-[#1a2e23] dark:border-white/10 dark:text-[#e5e5e5]"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 dark:border-white/10 dark:hover:bg-[#1a2e23] h-9"
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#2d5f3f] to-[#4a7c59] dark:from-[#b88746] dark:to-[#d4a373] hover:from-[#3d7050] hover:to-[#5a8c69] dark:hover:from-[#a07738] dark:hover:to-[#c49565] text-white h-9"
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : 'Login'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

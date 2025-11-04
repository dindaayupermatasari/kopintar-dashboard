import { User, Menu, Sun, Moon, LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  isLoggedIn: boolean;
}

export function Header({ 
  onToggleSidebar, 
  isSidebarOpen, 
  isDarkMode, 
  onToggleDarkMode,
  onLogout,
  isLoggedIn
}: HeaderProps) {

  return (
    <header className="bg-white dark:bg-[#242424] border-b border-gray-200 dark:border-white/10 px-6 py-4 shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleSidebar}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-[#1a2e23] rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-[#e5e5e5]" />
          </button>
          <div>
            {isLoggedIn ? (
              <>
                <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Selamat datang kembali,</p>
                <h3 className="text-lg font-semibold text-[#2d5f3f] dark:text-[#b88746]">Admin</h3>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 dark:text-[#a3a3a3]">Selamat datang,</p>
                <h3 className="text-lg font-semibold text-[#2d5f3f] dark:text-[#b88746]">Pengunjung</h3>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button 
            onClick={onToggleDarkMode}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-[#1a2e23] rounded-xl transition-colors"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-[#d4a373]" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* User Dropdown Menu - Hanya muncul jika sudah login */}
          {isLoggedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 pl-3 ml-2 border-l border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-[#1a2e23] px-3 py-2 rounded-xl transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#2d5f3f] to-[#4a7c59] dark:from-[#b88746] dark:to-[#d4a373] rounded-xl flex items-center justify-center shadow-sm">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm text-left hidden sm:block">
                    <p className="text-gray-900 dark:text-[#e5e5e5] font-medium">Admin</p>
                    <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">Administrator</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-[#a3a3a3] hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-48 dark:bg-[#242424] dark:border-white/10">
                <DropdownMenuLabel className="dark:text-[#e5e5e5]">Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator className="dark:bg-white/10" />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
                  onClick={onLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-medium">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
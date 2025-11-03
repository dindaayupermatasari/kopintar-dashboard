import { Home, Network, Users, Lightbulb, Mail, Coffee, X } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ currentPage, onNavigate, isOpen, onToggle }: SidebarProps) {
  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'clustering', label: 'Clustering', icon: Network },
    { id: 'data-petani', label: 'Data Petani', icon: Users },
    { id: 'rekomendasi', label: 'Rekomendasi', icon: Lightbulb },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 h-screen w-[280px] bg-[#2d5f3f] dark:bg-[#1a2e23] text-white flex flex-col shadow-xl z-50 transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:-translate-x-0 lg:w-0 lg:overflow-hidden'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-[#8b6f47] to-[#a78a5e] dark:from-[#b88746] dark:to-[#d4a373] rounded-xl flex items-center justify-center shadow-lg">
                <Coffee className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white">Kopintar</h3>
            </div>
            <button 
              onClick={onToggle}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto min-h-0">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#8b6f47] to-[#a78a5e] dark:from-[#b88746] dark:to-[#d4a373] shadow-lg scale-105'
                        : 'hover:bg-white/10 hover:translate-x-1'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>


      </div>
    </>
  );
}

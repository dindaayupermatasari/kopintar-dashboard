import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { ClusteringPage } from './components/ClusteringPage';
import { DataPetaniPage } from './components/DataPetaniPage';
import { RekomendasiPage } from './components/RekomendasiPage';
import { ContactPage } from './components/ContactPage';
import { LandingPage } from './components/LandingPage';
import { TambahPetaniPage } from './components/TambahPetaniPage';
import { EditPetaniPage } from './components/EditPetaniPage';
import { DetailPetaniPage } from './components/DetailPetaniPage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [editPetaniData, setEditPetaniData] = useState<any>(null);
  const [detailPetaniData, setDetailPetaniData] = useState<any>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'clustering':
        return <ClusteringPage />;
      case 'data-petani':
        return <DataPetaniPage 
          isLoggedIn={isLoggedIn}
          onLogin={handleLogin}
          onNavigateToTambahPetani={() => setCurrentPage('tambah-petani')} 
          onNavigateToEditPetani={(petaniData) => {
            setEditPetaniData(petaniData);
            setCurrentPage("edit-petani");
          }}
          onNavigateToDetailPetani={(data) => {
            setDetailPetaniData(data);
            setCurrentPage('detail-petani');
          }}
        />;
      case 'rekomendasi':
        return <RekomendasiPage />;
      case 'contact':
        return <ContactPage />;
      case 'tambah-petani':
        return <TambahPetaniPage onBack={() => setCurrentPage('data-petani')} />;
      case 'edit-petani':
        return <EditPetaniPage 
          onBack={() => setCurrentPage('data-petani')} 
          petaniData={editPetaniData}
        />;
      case 'detail-petani':
        return <DetailPetaniPage
          onBack={() => setCurrentPage('data-petani')}
          petaniData={detailPetaniData}
        />;
      default:
        return <HomePage />;
    }
  };

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  return (
    <div className="flex min-h-screen bg-[#faf9f7] dark:bg-[#121212]">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-0'}`}>
        <Header 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onLogout={handleLogout}
          isLoggedIn={isLoggedIn}
        />
        <main className="flex-1 p-4 sm:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Calculator, Clock, User, Trash2 } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react'; // Impor yang error tadi
import { motion, AnimatePresence } from 'framer-motion';

// --- Custom Hook for localStorage ---
// (Ini adalah cara React untuk mengelola data di localStorage)
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// --- BMI Helper Functions ---
// (Logika untuk menghitung dan mengkategorikan BMI)
const calculateBMI = (weight, height) => {
  if (weight > 0 && height > 0) {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return parseFloat(bmi.toFixed(1));
  }
  return 0;
};

const getBmiCategory = (bmi) => {
  if (bmi === 0) return { category: 'N/A', color: 'text-gray-500' };
  if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-500' };
  if (bmi >= 18.5 && bmi <= 24.9) return { category: 'Normal weight', color: 'text-green-500' };
  if (bmi >= 25 && bmi <= 29.9) return { category: 'Overweight', color: 'text-yellow-600' };
  if (bmi >= 30) return { category: 'Obese', color: 'text-red-500' };
  return { category: 'N/A', color: 'text-gray-500' };
};

const getIdealWeight = (height, gender) => {
  // Rumus Devine (salah satu dari banyak rumus)
  const heightInInches = height / 2.54;
  let idealWeightKg = 0;
  if (gender === 'male') {
    idealWeightKg = 50 + 2.3 * (heightInInches - 60);
  } else {
    idealWeightKg = 45.5 + 2.3 * (heightInInches - 60);
  }
  
  if (idealWeightKg < 0) return 'N/A';
  return `${idealWeightKg.toFixed(1)} kg`;
};

// --- Main App Component ---
// (Ini adalah komponen utama yang mengontrol semua state dan navigasi)
export default function App() {
  const [currentPage, setCurrentPage] = useState('calculator');
  const [history, setHistory] = useLocalStorage('bmiHistory', []);
  const [lastResult, setLastResult] = useState(null);
  
  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleCalculateBmi = (data) => {
    const bmi = calculateBMI(data.weight, data.height);
    const { category, color } = getBmiCategory(bmi);
    const idealWeight = getIdealWeight(data.height, data.gender);

    const newResult = {
      ...data,
      bmi,
      category,
      color,
      idealWeight,
      id: new Date().toISOString(),
      date: new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    };

    setLastResult(newResult);
    setHistory([newResult, ...history]);
    setCurrentPage('result');
  };

  const handleDeleteHistory = (id) => {
    setHistory(history.filter((item) => item.id !== id));
  };
  
  const renderPage = () => {
    switch (currentPage) {
      case 'calculator':
        return <BmiCalculatorPage onCalculate={handleCalculateBmi} />;
      case 'history':
        return <HistoryPage history={history} onDelete={handleDeleteHistory} />;
      case 'profile':
        return <ProfilePage />;
      case 'result':
        return <ResultPage result={lastResult} onBack={() => setCurrentPage('calculator')} />;
      default:
        return <BmiCalculatorPage onCalculate={handleCalculateBmi} />;
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-brand-light-purple flex flex-col">
      <PWABadge /> {/* Komponen PWA dari modul */}
      
      <main className="flex-grow pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Hanya tampilkan Navbar jika bukan di halaman hasil */}
      {(currentPage !== 'result') && (
        <MobileNavbar currentPage={currentPage} onNavigate={handleNavigate} />
      )}
    </div>
  );
}

// --- Page: BmiCalculatorPage ---
function BmiCalculatorPage({ onCalculate }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('female'); // 'male' or 'female'
  const [weight, setWeight] = useState(60);
  const [height, setHeight] = useState(170);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCalculate({ name, age, gender, weight, height });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">BMI Calculator</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Nama */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Nama</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama Anda"
            className="w-full mt-1 border-b-2 border-gray-200 focus:border-brand-purple focus:outline-none p-1"
          />
        </div>

        {/* Pemilih Jenis Kelamin */}
        <div className="grid grid-cols-2 gap-4">
          <GenderSelector 
            gender="male" 
            label="Male" 
            isSelected={gender === 'male'} 
            onSelect={() => setGender('male')} 
          />
          <GenderSelector 
            gender="female" 
            label="Female" 
            isSelected={gender === 'female'} 
            onSelect={() => setGender('female')} 
          />
        </div>

        {/* Slider Tinggi */}
        <ValueSlider
          label="Height (cm)"
          value={height}
          min={100}
          max={250}
          onChange={(e) => setHeight(parseInt(e.target.value))}
        />

        {/* Slider Berat & Umur */}
        <div className="grid grid-cols-2 gap-4">
          <ValueSlider
            label="Weight (kg)"
            value={weight}
            min={30}
            max={200}
            onChange={(e) => setWeight(parseInt(e.target.value))}
          />
          <ValueSlider
            label="Age"
            value={age}
            min={5}
            max={100}
            onChange={(e) => setAge(parseInt(e.target.value))}
          />
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          className="w-full text-white font-semibold py-4 rounded-xl shadow-lg
                     bg-gradient-to-r from-brand-blue to-brand-purple
                     hover:from-brand-blue hover:to-brand-blue transition-all duration-300
                     focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-opacity-50"
        >
          Calculate BMI
        </button>
      </form>
    </div>
  );
}

// --- Page: ResultPage ---
function ResultPage({ result, onBack }) {
  if (!result) {
    return (
      <div className="p-6 text-center">
        <p>Tidak ada hasil untuk ditampilkan.</p>
        <button onClick={onBack} className="mt-4 text-brand-purple font-semibold">
          Kembali
        </button>
      </div>
    );
  }
  
  // Logika untuk skala BMI
  const getBmiScaleIndicator = (bmi) => {
    if (bmi < 18.5) return 'left-0'; // Underweight
    if (bmi < 25) return 'left-1/4'; // Normal
    if (bmi < 30) return 'left-1/2'; // Overweight
    return 'left-3/4'; // Obese
  };

  return (
    <div className="p-6 space-y-6">
      <button onClick={onBack} className="text-brand-purple font-semibold">
        &larr; Kembali ke Kalkulator
      </button>

      <h1 className="text-2xl font-bold text-text-primary text-center">Your BMI</h1>

      <motion.div 
        className="bg-white rounded-xl shadow-xl p-8 flex flex-col items-center space-y-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <p className="text-6xl font-bold text-text-primary">{result.bmi}</p>
        <p className={`text-xl font-semibold ${result.color}`}>
          {result.category}
        </p>
        <p className="text-sm text-text-secondary text-center">
          {result.name ? `${result.name} | ` : ''}
          {result.age}th | {result.gender.charAt(0).toUpperCase() + result.gender.slice(1)} | {result.height}cm
        </p>
        
        {/* Skala BMI */}
        <div className="w-full pt-4">
          <div className="relative w-full h-2 bg-gray-200 rounded-full">
            <div className="absolute h-2 rounded-l-full bg-blue-500 w-1/4"></div>
            <div className="absolute h-2 bg-green-500 w-1/4 left-1/4"></div>
            <div className="absolute h-2 bg-yellow-600 w-1/4 left-1/2"></div>
            <div className="absolute h-2 rounded-r-full bg-red-500 w-1/4 left-3/4"></div>
            
            {/* Indikator */}
            <div className={`absolute -top-1 w-4 h-4 rounded-full bg-brand-purple ring-2 ring-white shadow-md ${getBmiScaleIndicator(result.bmi)} -ml-2`}></div>
          </div>
          <div className="flex justify-between text-xs text-text-secondary mt-2">
            <span>18.5</span>
            <span>25</span>
            <span>30</span>
          </div>
        </div>

      </motion.div>

      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <p className="text-text-secondary">Berat badan ideal Anda adalah</p>
        <p className="text-2xl font-bold text-text-primary mt-1">{result.idealWeight}</p>
        <p className="text-xs text-text-secondary mt-2">{result.date}</p>
      </div>
    </div>
  );
}

// --- Page: HistoryPage ---
function HistoryPage({ history, onDelete }) {
  if (history.length === 0) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-4">History</h1>
        <p className="text-text-secondary">History kosong. Mulai hitung BMI Anda!</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-text-primary">History</h1>
      <AnimatePresence>
        {history.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className={`text-3xl font-bold ${item.color}`}>
                {item.bmi}
              </div>
              <div>
                <p className="font-semibold text-text-primary">{item.category}</p>
                <p className="text-sm text-text-secondary">{item.date}</p>
              </div>
            </div>
            <button 
              onClick={() => onDelete(item.id)}
              className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
              aria-label="Delete history item"
            >
              <Trash2 size={20} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// --- Page: ProfilePage ---
function ProfilePage() {
  // GANTI DENGAN DATA ANDA
  const profileData = {
    name: "Elvina Nasywa Ariyani",
    nim: "21120123140136",
    kelompok: "Kelompok 13 Shift 03",
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
      <div className="bg-white rounded-xl shadow-xl p-8 space-y-4">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center mb-4">
            <User size={48} className="text-white" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">{profileData.name}</h2>
        </div>
        
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div>
            <p className="text-sm font-medium text-text-secondary">NIM</p>
            <p className="text-lg font-semibold text-text-primary">{profileData.nim}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Kelompok</p>
            <p className="text-lg font-semibold text-text-primary">{profileData.kelompok}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Component: MobileNavbar ---
// (Navigasi bawah yang meniru gambar)
function MobileNavbar({ currentPage, onNavigate }) {
  const navItems = [
    { name: 'calculator', label: 'Calculator', icon: Calculator },
    { name: 'history', label: 'History', icon: Clock },
    { name: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto 
                   bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.05)]
                   rounded-t-2xl border-t border-gray-200">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentPage === item.name;
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => onNavigate(item.name)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg 
                          transition-all duration-200
                          ${isActive ? 'text-brand-purple' : 'text-text-secondary'}`}
            >
              <Icon size={24} />
              <span className={`text-xs font-medium mt-1 ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// --- Component: GenderSelector ---
// (Komponen kartu untuk memilih jenis kelamin)
function GenderSelector({ gender, label, isSelected, onSelect }) {
  // Menggunakan ikon SVG sederhana untuk Male/Female
  const MaleIcon = () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5V19M5 12H19" transform="rotate(45 12 12) translate(0 -8)" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
  
  const FemaleIcon = () => (
     <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 16V22M9 19H15" />
    </svg>
  );

  const Icon = gender === 'male' ? MaleIcon : FemaleIcon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col items-center justify-center p-4 rounded-xl 
                  border-2 transition-all duration-200
                  ${isSelected ? 'bg-brand-light-purple border-brand-purple' : 'bg-white border-gray-200'}`}
    >
      <div className={`${isSelected ? 'text-brand-purple' : 'text-text-secondary'}`}>
        <Icon />
      </div>
      <span className={`mt-2 font-semibold ${isSelected ? 'text-brand-purple' : 'text-text-primary'}`}>
        {label}
      </span>
    </button>
  );
}

// --- Component: ValueSlider ---
// (Komponen kartu untuk input slider)
function ValueSlider({ label, value, min, max, onChange }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center">
      <label className="block text-sm font-medium text-text-secondary">{label}</label>
      <p className="text-4xl font-bold text-text-primary my-2">{value}</p>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-5
                   [&::-webkit-slider-thumb]:h-5
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-brand-purple
                   [&::-webkit-slider-thumb]:shadow-md"
      />
    </div>
  );
}

// --- Component: PWABadge (dari Modul) ---
// (Komponen ini menangani notifikasi update PWA)
function PWABadge() {
  const period = 60 * 60 * 1000; // Cek update setiap 1 jam

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return;
      if (r?.active?.state === 'activated') {
        registerPeriodicSync(period, swUrl, r);
      } else if (r?.installing) {
        r.installing.addEventListener('statechange', (e) => {
          const sw = e.target;
          if (sw.state === 'activated') {
            registerPeriodicSync(period, swUrl, r);
          }
        });
      }
    },
  });

  function close() {
    setOfflineReady(false);
    setNeedRefresh(false);
  }

  if (offlineReady || needRefresh) {
    return (
      <div className="fixed bottom-24 right-4 z-50" role="alert" aria-labelledby="toast-message">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[320px] max-w-md">
          <div className="mb-3">
            <span id="toast-message" className="text-sm text-gray-700 dark:text-gray-200">
              {offlineReady
                ? 'Aplikasi siap bekerja offline.'
                : 'Konten baru tersedia, klik muat ulang untuk memperbarui.'}
            </span>
          </div>
          <div className="flex gap-2 justify-end">
            {needRefresh && (
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => updateServiceWorker(true)}
              >
                Muat Ulang
              </button>
            )}
            <button
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              onClick={() => close()}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function registerPeriodicSync(period, swUrl, r) {
  if (period <= 0) return;

  setInterval(async () => {
    if ('onLine' in navigator && !navigator.onLine) {
      return;
    }

    const resp = await fetch(swUrl, {
      cache: 'no-store',
      headers: {
        'cache': 'no-store',
        'cache-control': 'no-cache',
      },
    });

    if (resp?.status === 200) {
      await r.update();
    }
  }, period);
}

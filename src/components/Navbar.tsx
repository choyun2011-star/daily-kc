import React, { useState } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  BookOpen,
  Sparkles,
  User,
  Settings,
  Plus,
  Camera,
  Droplet,
  Menu,
  X,
  Salad,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'food-database'
  | 'food-diary'
  | 'meal-ideas'
  | 'education'
  | 'profile'
  | 'settings';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenAddFood: () => void;
  onOpenPhotoAi: () => void;
  onOpenWaterModal: () => void;
  todayCalories: number;
  targetCalories: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenAddFood,
  onOpenPhotoAi,
  onOpenWaterModal,
  todayCalories,
  targetCalories,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Нүүр хуудас', icon: LayoutDashboard },
    { id: 'food-diary', label: 'Өдрийн тэмдэглэл', icon: UtensilsCrossed },
    { id: 'food-database', label: 'Хүнсний сан', icon: Salad },
    { id: 'meal-ideas', label: 'Хоолны санаа', icon: Sparkles },
    { id: 'education', label: 'Шим тэжээлийн мэдлэг', icon: BookOpen },
    { id: 'profile', label: 'Миний мэдээлэл', icon: User },
    { id: 'settings', label: 'Тохиргоо', icon: Settings },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E7E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <div
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4E6E56] to-[#395340] flex items-center justify-center text-white shadow-sm shadow-[#4E6E56]/30 group-hover:scale-105 transition-transform">
              <Salad className="w-5 h-5 text-[#E3F2E6]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-[#28382B]">Daily Kcal</span>
                <span className="text-[10px] font-semibold bg-[#E4ECE5] text-[#395340] px-1.5 py-0.5 rounded-md">
                  Монгол
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
                Өдрийн илчлэг ба шим тэжээл
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Today calorie badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFECE5] text-stone-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-[#5A7D63]"></span>
              <span>Өнөөдөр:</span>
              <strong className="text-stone-900 font-bold">{todayCalories}</strong>
              <span className="text-stone-400">/</span>
              <span className="text-stone-500">{targetCalories} ккал</span>
            </div>

            {/* Quick Water Button */}
            <button
              onClick={onOpenWaterModal}
              title="Ус нэмэх"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Droplet className="w-4 h-4 fill-cyan-500 text-cyan-600" />
              <span className="hidden sm:inline">Ус бүртгэх</span>
            </button>

            {/* Photo AI Button */}
            <button
              onClick={onOpenPhotoAi}
              title="Зураг таних (AI)"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#EFF5F0] hover:bg-[#E3EEE5] text-[#3B5441] border border-[#CADBCF] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#4E6E56]" />
              <span className="hidden sm:inline">Зураг таних (AI)</span>
            </button>

            {/* Primary Add Food Button */}
            <button
              onClick={onOpenAddFood}
              className="px-3.5 py-2 rounded-xl bg-[#5A7D63] hover:bg-[#4E6E56] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm shadow-[#5A7D63]/30 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Хоол нэмэх</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-stone-600 hover:bg-[#EFECE5] transition-colors"
              aria-label="Цэс нээх"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Sub-bar */}
        <div className="hidden lg:block border-t border-[#EDE8E0] bg-[#FAF8F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 py-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#5A7D63] text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-[#EFECE5]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E7E2D8] bg-[#FAF7F2] px-4 pt-3 pb-5 space-y-1 shadow-lg animate-fadeIn">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#5A7D63] text-white'
                      : 'text-stone-700 hover:bg-[#EFECE5]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar for easy one-thumb reach */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#E5DFD5] px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'dashboard' ? 'text-[#395340] font-bold' : 'text-stone-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Нүүр</span>
        </button>
        <button
          onClick={() => onTabChange('food-diary')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'food-diary' ? 'text-[#395340] font-bold' : 'text-stone-500'
          }`}
        >
          <UtensilsCrossed className="w-5 h-5 mb-0.5" />
          <span>Тэмдэглэл</span>
        </button>
        <button
          onClick={onOpenAddFood}
          className="flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-full bg-[#5A7D63] text-white shadow-md shadow-[#5A7D63]/40 active:scale-95 transition-transform"
          aria-label="Хоол нэмэх"
        >
          <Plus className="w-6 h-6" />
        </button>
        <button
          onClick={() => onTabChange('food-database')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'food-database' ? 'text-[#395340] font-bold' : 'text-stone-500'
          }`}
        >
          <Salad className="w-5 h-5 mb-0.5" />
          <span>Хүнс</span>
        </button>
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            currentTab === 'profile' ? 'text-[#395340] font-bold' : 'text-stone-500'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Мэдээлэл</span>
        </button>
      </nav>
    </>
  );
};

import React from 'react';
import {
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Droplet,
  Plus,
  Camera,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Utensils,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import {
  DiaryEntry,
  MealCategory,
  MEAL_CATEGORY_LABELS,
  NutritionalValues,
  UserProfile,
  WaterLog,
} from '../types/nutrition';

interface DashboardViewProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  diaryEntries: DiaryEntry[];
  waterLogs: WaterLog[];
  userProfile: UserProfile | null;
  dailyTotals: NutritionalValues;
  onOpenAddFood: (category?: MealCategory) => void;
  onOpenPhotoAi: () => void;
  onOpenWaterModal: () => void;
  onDeleteEntry: (id: string) => Promise<void>;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  selectedDate,
  onDateChange,
  diaryEntries,
  waterLogs,
  userProfile,
  dailyTotals,
  onOpenAddFood,
  onOpenPhotoAi,
  onOpenWaterModal,
  onDeleteEntry,
  onNavigateTab,
}) => {
  // Safe targets (from profile or standard healthy adult reference)
  const targetCalories = userProfile?.targetCalories || 2000;
  const targetProtein = userProfile?.targetProtein || 100;
  const targetCarbs = userProfile?.targetCarbs || 250;
  const targetFat = userProfile?.targetFat || 65;
  const targetWaterMl = userProfile?.targetWaterMl || 2200;

  const totalWaterConsumed = waterLogs.reduce((acc, log) => acc + log.amountMl, 0);

  // Remaining calories
  const remainingCalories = Math.max(0, targetCalories - dailyTotals.calories);
  const caloriePercentage = Math.min(100, Math.round((dailyTotals.calories / targetCalories) * 100));

  // Date manipulation helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  // Format date in natural Mongolian
  const formatMongolianDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const weekDays = [
      'Ням гараг',
      'Даваа гараг',
      'Мягмар гараг',
      'Лхагва гараг',
      'Пүрэв гараг',
      'Баасан гараг',
      'Бямба гараг',
    ];
    const weekDayName = weekDays[dateObj.getDay()];
    return `${year} оны ${month}-р сарын ${day}, ${weekDayName}`;
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Group entries by meal category
  const mealCategories: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  const groupedMeals = mealCategories.map((cat) => {
    const items = diaryEntries.filter((e) => e.mealCategory === cat);
    const subtotalCalories = items.reduce((sum, item) => sum + item.calories, 0);
    return {
      category: cat,
      label: MEAL_CATEGORY_LABELS[cat],
      items,
      subtotalCalories,
    };
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Date Switcher & Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E7E2D8] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EFF5F0] text-[#395340] flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#4E6E56]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              {formatMongolianDate(selectedDate)}
            </h2>
            <p className="text-xs text-stone-500">
              {isToday ? 'Өнөөдрийн шим тэжээлийн хураангуй' : 'Өнгөрсөн өдрийн бүртгэл'}
            </p>
          </div>
        </div>

        {/* Date Stepper Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
            title="Өмнөх өдөр"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {!isToday && (
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl bg-[#5A7D63]/10 hover:bg-[#5A7D63]/20 text-[#395340] text-xs font-bold transition-colors cursor-pointer"
            >
              Өнөөдөр рүү шилжих
            </button>
          )}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && onDateChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-700 bg-stone-50 cursor-pointer"
          />
          <button
            onClick={handleNextDay}
            className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
            title="Дараах өдөр"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main KPI Row: Calories & Macros */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Calorie Dial Card (5 cols on lg) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-white via-white to-[#F6FAF7] p-6 rounded-3xl border border-[#E2EAE4] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              Өдрийн илчлэг (ккал)
            </span>
            <span className="text-[11px] font-semibold bg-[#E7ECE8] text-[#2F4535] px-2.5 py-1 rounded-full">
              {caloriePercentage}%
            </span>
          </div>

          {/* Central Calorie Metric */}
          <div className="py-2 text-center">
            <div className="inline-block relative">
              <span className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight">
                {dailyTotals.calories}
              </span>
              <span className="text-sm font-semibold text-stone-400 block mt-1">
                Зорилтот {targetCalories} ккал-аас
              </span>
            </div>

            {/* Calorie Progress Bar */}
            <div className="w-full bg-stone-100 h-3 rounded-full mt-5 overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-[#5A7D63] to-[#405C46] h-full rounded-full transition-all duration-500"
                style={{ width: `${caloriePercentage}%` }}
              />
            </div>
          </div>

          {/* Calorie Subtotals */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100 text-center">
            <div className="bg-[#FAF7F2] p-2.5 rounded-2xl">
              <span className="text-[11px] text-stone-500 block">Авсан илчлэг</span>
              <strong className="text-sm sm:text-base font-bold text-stone-800">
                {dailyTotals.calories} ккал
              </strong>
            </div>
            <div className="bg-[#FAF7F2] p-2.5 rounded-2xl">
              <span className="text-[11px] text-stone-500 block">Үлдсэн илчлэг</span>
              <strong className="text-sm sm:text-base font-bold text-[#395340]">
                {remainingCalories} ккал
              </strong>
            </div>
          </div>
        </div>

        {/* Macronutrient Cards (7 cols on lg) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Protein */}
          <div className="bg-white p-5 rounded-3xl border border-[#EAE5DC] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <Dumbbell className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-stone-600 block">Уураг</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-stone-900">{dailyTotals.protein}</span>
                <span className="text-xs text-stone-400">/ {targetProtein}г</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((dailyTotals.protein / targetProtein) * 100))}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-stone-400 mt-1 block">
                {Math.round((dailyTotals.protein / targetProtein) * 100)}% биелэлт
              </span>
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-white p-5 rounded-3xl border border-[#EAE5DC] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <Wheat className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-stone-600 block">Нүүрс ус</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-stone-900">{dailyTotals.carbs}</span>
                <span className="text-xs text-stone-400">/ {targetCarbs}г</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-amber-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((dailyTotals.carbs / targetCarbs) * 100))}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-stone-400 mt-1 block">
                {Math.round((dailyTotals.carbs / targetCarbs) * 100)}% биелэлт
              </span>
            </div>
          </div>

          {/* Fat */}
          <div className="bg-white p-5 rounded-3xl border border-[#EAE5DC] shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-3">
                <Droplets className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-stone-600 block">Өөх тос</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-stone-900">{dailyTotals.fat}</span>
                <span className="text-xs text-stone-400">/ {targetFat}г</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-rose-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-600 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((dailyTotals.fat / targetFat) * 100))}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-stone-400 mt-1 block">
                {Math.round((dailyTotals.fat / targetFat) * 100)}% биелэлт
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Water & Quick Actions Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hydration Widget */}
        <div className="md:col-span-2 bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-white p-5 rounded-3xl border border-cyan-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Droplet className="w-6 h-6 fill-cyan-500 text-cyan-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-stone-900">Усны хэрэглээ</h4>
                <span className="text-[11px] font-bold text-cyan-800 bg-cyan-100/70 px-2 py-0.5 rounded-md">
                  {Math.round((totalWaterConsumed / targetWaterMl) * 100)}%
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Өнөөдөр <strong className="text-cyan-900 font-bold">{totalWaterConsumed} мл</strong> уусан / Зорилтот {targetWaterMl} мл
              </p>
            </div>
          </div>
          <button
            onClick={onOpenWaterModal}
            className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            + Ус бүртгэх
          </button>
        </div>

        {/* AI Camera Promo Card */}
        <div
          onClick={onOpenPhotoAi}
          className="bg-[#EFF5F0] hover:bg-[#E4EDE5] p-5 rounded-3xl border border-[#CADBCF] shadow-xs flex items-center justify-between cursor-pointer group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#5A7D63] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#2D4533] block flex items-center gap-1">
                Зураг таних (AI)
                <Sparkles className="w-3 h-3 text-[#5A7D63]" />
              </span>
              <p className="text-[11px] text-[#47604E]">Хоолны зураг аваад шууд тооцоолох</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#4E6E56] group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Meals Breakdown by 4 Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <span>Өдрийн хоолны хуваарь</span>
            <span className="text-xs text-stone-400 font-normal">
              ({diaryEntries.length} бүртгэл)
            </span>
          </h3>
          <button
            onClick={() => onNavigateTab('food-diary')}
            className="text-xs font-bold text-[#4E6E56] hover:underline flex items-center gap-1"
          >
            <span>Дэлгэрэнгүй тэмдэглэл</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Cards: Breakfast, Lunch, Dinner, Snack */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groupedMeals.map((meal) => (
            <div
              key={meal.category}
              className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC] flex items-center justify-center text-[#4E6E56]">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{meal.label}</h4>
                      <span className="text-[11px] text-stone-400">{meal.items.length} хоол бүртгэгдсэн</span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-stone-800">
                    {meal.subtotalCalories} ккал
                  </span>
                </div>

                {/* Items preview list */}
                {meal.items.length === 0 ? (
                  <div className="py-4 text-center text-stone-400 text-xs italic bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                    Хоол бүртгээгүй байна
                  </div>
                ) : (
                  <div className="space-y-2 mt-2">
                    {meal.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200/60 text-xs group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {item.photoDataUrl ? (
                            <img
                              src={item.photoDataUrl}
                              alt={item.foodName}
                              className="w-8 h-8 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-stone-200 flex items-center justify-center text-stone-500 shrink-0">
                              <Utensils className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-semibold text-stone-800 block truncate">
                              {item.foodName}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {item.servingDescription}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-stone-700">{item.calories} ккал</span>
                          <button
                            onClick={() => onDeleteEntry(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity cursor-pointer"
                            title="Устгах"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Food Button for this specific category */}
              <button
                onClick={() => onOpenAddFood(meal.category)}
                className="mt-4 w-full py-2 rounded-xl border border-dashed border-[#5A7D63]/50 hover:bg-[#5A7D63]/5 text-[#395340] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ {meal.label}-нд нэмэх</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Helpful Empty State when no foods are logged today */}
      {diaryEntries.length === 0 && (
        <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EFF5F0] text-[#395340] mx-auto flex items-center justify-center">
            <Utensils className="w-7 h-7 text-[#4E6E56]" />
          </div>
          <div>
            <h4 className="text-base font-bold text-stone-900">
              Та энэ өдөр хараахан хоол бүртгээгүй байна
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
              Өглөөний цай, цуйван, бууз эсвэл дурын хоолоо хайж сонгох эсвэл гар утасны камераараа зураг дарж хиймэл оюунаар шууд тооцуулаарай!
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenAddFood('breakfast')}
              className="px-4 py-2.5 rounded-xl bg-[#5A7D63] hover:bg-[#4E6E56] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Хоол нэмэх</span>
            </button>
            <button
              onClick={onOpenPhotoAi}
              className="px-4 py-2.5 rounded-xl bg-[#EFF5F0] hover:bg-[#E2EDE4] text-[#395340] border border-[#CADBCF] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Зураг таних (AI)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

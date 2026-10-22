import React, { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Camera,
  Trash2,
  Edit3,
  Utensils,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Scale,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import {
  DiaryEntry,
  MealCategory,
  MEAL_CATEGORY_LABELS,
  NutritionalValues,
} from '../types/nutrition';

interface FoodDiaryViewProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  diaryEntries: DiaryEntry[];
  dailyTotals: NutritionalValues;
  onOpenAddFood: (category?: MealCategory) => void;
  onOpenPhotoAi: () => void;
  onDeleteEntry: (id: string) => Promise<void>;
  onUpdateEntry: (entry: DiaryEntry) => Promise<void>;
}

export const FoodDiaryView: React.FC<FoodDiaryViewProps> = ({
  selectedDate,
  onDateChange,
  diaryEntries,
  dailyTotals,
  onOpenAddFood,
  onOpenPhotoAi,
  onDeleteEntry,
  onUpdateEntry,
}) => {
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editGrams, setEditGrams] = useState<number>(100);
  const [editCalories, setEditCalories] = useState<number>(0);
  const [editProtein, setEditProtein] = useState<number>(0);
  const [editCarbs, setEditCarbs] = useState<number>(0);
  const [editFat, setEditFat] = useState<number>(0);
  const [editCategory, setEditCategory] = useState<MealCategory>('lunch');

  const handleStartEdit = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setEditName(entry.foodName);
    setEditGrams(entry.portionGrams);
    setEditCalories(entry.calories);
    setEditProtein(entry.protein);
    setEditCarbs(entry.carbs);
    setEditFat(entry.fat);
    setEditCategory(entry.mealCategory);
  };

  const handleGramsChange = (newGrams: number) => {
    if (newGrams <= 0 || !editingEntry || editingEntry.portionGrams <= 0) {
      setEditGrams(newGrams);
      return;
    }
    // Proportional recalculation
    const ratio = newGrams / editingEntry.portionGrams;
    setEditGrams(newGrams);
    setEditCalories(Math.round(editingEntry.calories * ratio));
    setEditProtein(Math.round(editingEntry.protein * ratio * 10) / 10);
    setEditCarbs(Math.round(editingEntry.carbs * ratio * 10) / 10);
    setEditFat(Math.round(editingEntry.fat * ratio * 10) / 10);
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;

    const updated: DiaryEntry = {
      ...editingEntry,
      foodName: editName.trim() || editingEntry.foodName,
      portionGrams: editGrams,
      servingDescription: `${editGrams}г порц`,
      calories: Math.round(editCalories),
      protein: Math.round(editProtein * 10) / 10,
      carbs: Math.round(editCarbs * 10) / 10,
      fat: Math.round(editFat * 10) / 10,
      mealCategory: editCategory,
    };

    await onUpdateEntry(updated);
    setEditingEntry(null);
  };

  const categories: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Date Switcher Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E7E2D8] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EFF5F0] text-[#395340] flex items-center justify-center">
            <Utensils className="w-5 h-5 text-[#4E6E56]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              Өдрийн хоолны тэмдэглэл
            </h2>
            <p className="text-xs text-stone-500">
              4 цагийн хооллолт, порц, шим тэжээлийн дэлгэрэнгүй жагсаалт
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              onDateChange(d.toISOString().split('T')[0]);
            }}
            className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
            title="Өмнөх өдөр"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && onDateChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-700 bg-stone-50 cursor-pointer"
          />
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              onDateChange(d.toISOString().split('T')[0]);
            }}
            className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
            title="Дараах өдөр"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daily Nutrients Floating Subtotal Card */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-5 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold block">
            {selectedDate} өдрийн нийт
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-black text-amber-400">{dailyTotals.calories}</span>
            <span className="text-sm font-bold text-stone-300">ккал авсан</span>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 text-xs">
          <div>
            <span className="text-stone-400 block text-[11px]">Уураг</span>
            <span className="font-bold text-emerald-400 text-sm sm:text-base">
              {dailyTotals.protein}г
            </span>
          </div>
          <div className="w-px h-6 bg-stone-700"></div>
          <div>
            <span className="text-stone-400 block text-[11px]">Нүүрс ус</span>
            <span className="font-bold text-amber-300 text-sm sm:text-base">
              {dailyTotals.carbs}г
            </span>
          </div>
          <div className="w-px h-6 bg-stone-700"></div>
          <div>
            <span className="text-stone-400 block text-[11px]">Өөх тос</span>
            <span className="font-bold text-rose-400 text-sm sm:text-base">
              {dailyTotals.fat}г
            </span>
          </div>
        </div>
      </div>

      {/* Meal Categories Sections */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const items = diaryEntries.filter((e) => e.mealCategory === cat);
          const subtotalCal = items.reduce((sum, item) => sum + item.calories, 0);
          const subtotalProtein =
            Math.round(items.reduce((sum, item) => sum + item.protein, 0) * 10) / 10;
          const subtotalCarbs =
            Math.round(items.reduce((sum, item) => sum + item.carbs, 0) * 10) / 10;
          const subtotalFat =
            Math.round(items.reduce((sum, item) => sum + item.fat, 0) * 10) / 10;

          return (
            <div
              key={cat}
              className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden"
            >
              {/* Category Header */}
              <div className="px-6 py-4 bg-[#FAF8F5] border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-[#5A7D63]"></span>
                  <h3 className="text-base font-bold text-stone-900">
                    {MEAL_CATEGORY_LABELS[cat]}
                  </h3>
                  <span className="text-xs text-stone-400 font-medium">
                    ({items.length} бүртгэл)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-semibold text-stone-600 bg-white px-3 py-1 rounded-xl border border-stone-200">
                    <span>{subtotalCal} ккал</span>
                    <span className="text-stone-300 mx-1.5">|</span>
                    <span className="text-emerald-700">У {subtotalProtein}г</span>
                    <span className="text-stone-300 mx-1">·</span>
                    <span className="text-amber-700">Н {subtotalCarbs}г</span>
                    <span className="text-stone-300 mx-1">·</span>
                    <span className="text-rose-700">Ө {subtotalFat}г</span>
                  </div>

                  <button
                    onClick={() => onOpenAddFood(cat)}
                    className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#5A7D63] hover:bg-[#4E6E56] text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Хоол нэмэх</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 sm:p-6 space-y-3">
                {items.length === 0 ? (
                  <div className="py-6 text-center text-stone-400 text-xs italic">
                    Энэ цагт хоол бүртгээгүй байна.
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/80 hover:border-[#5A7D63]/50 transition-all gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.photoDataUrl ? (
                          <img
                            src={item.photoDataUrl}
                            alt={item.foodName}
                            className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-stone-200"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-stone-200 text-stone-500 flex items-center justify-center shrink-0">
                            <Utensils className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-stone-900 truncate">
                              {item.foodName}
                            </h4>
                            {item.isAiEstimated && (
                              <span
                                title="AI тооцоолсон утга"
                                className="text-[10px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 px-1.5 py-0.2 rounded-md flex items-center gap-0.5"
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                AI
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Scale className="w-3 h-3 text-stone-400" />
                              {item.portionGrams} грамм ({item.servingDescription})
                            </span>
                          </div>
                          {item.notes && (
                            <p className="text-[11px] text-stone-400 italic mt-0.5">
                              "{item.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Nutrition breakdown & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/60">
                        <div className="text-right">
                          <div className="text-sm font-black text-orange-700 flex items-center justify-end gap-1">
                            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                            <span>{item.calories} ккал</span>
                          </div>
                          <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                            <span className="text-emerald-700 font-semibold">У: {item.protein}г</span>
                            <span>·</span>
                            <span className="text-amber-700 font-semibold">Н: {item.carbs}г</span>
                            <span>·</span>
                            <span className="text-rose-700 font-semibold">Ө: {item.fat}г</span>
                          </div>
                        </div>

                        {/* Edit and Delete Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(item)}
                            title="Засах"
                            className="p-2 text-stone-500 hover:text-[#395340] hover:bg-[#EAEFEA] rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteEntry(item.id)}
                            title="Устгах"
                            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-[#FAF7F2] w-full max-w-lg rounded-3xl shadow-2xl border border-[#E7E2D8] overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-base font-bold text-stone-900">Хоолны мэдээлэл засах</h3>
              <button
                onClick={() => setEditingEntry(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Хоолны нэр</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Порцын жин (грамм)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editGrams}
                    onChange={(e) => handleGramsChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-orange-700 mb-1">
                    Илчлэг (ккал)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editCalories}
                    onChange={(e) => setEditCalories(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold text-orange-700 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-800 mb-1">
                    Уураг (г)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editProtein}
                    onChange={(e) => setEditProtein(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-emerald-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                    Нүүрс ус (г)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editCarbs}
                    onChange={(e) => setEditCarbs(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-amber-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-rose-800 mb-1">
                    Өөх тос (г)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editFat}
                    onChange={(e) => setEditFat(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-rose-200 text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Хооллох үе</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as MealCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                >
                  {Object.entries(MEAL_CATEGORY_LABELS).map(([k, lbl]) => (
                    <option key={k} value={k}>
                      {lbl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                onClick={() => setEditingEntry(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Болих
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-[#5A7D63] hover:bg-[#4E6E56] text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Өөрчлөлтийг хадгалах</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

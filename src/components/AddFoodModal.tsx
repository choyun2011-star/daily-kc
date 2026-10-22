import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Plus,
  Scale,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  CheckCircle2,
  Camera,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import {
  DiaryEntry,
  FoodItem,
  MealCategory,
  MEAL_CATEGORY_LABELS,
} from '../types/nutrition';
import { calculatePortionNutrients } from '../utils/nutritionCalculator';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEntry: (entry: DiaryEntry) => Promise<void>;
  foodDatabase: FoodItem[];
  defaultDate: string;
  defaultMealCategory?: MealCategory;
  onOpenPhotoAi: () => void;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  isOpen,
  onClose,
  onSaveEntry,
  foodDatabase,
  defaultDate,
  defaultMealCategory = 'lunch',
  onOpenPhotoAi,
}) => {
  const [activeTab, setActiveTab] = useState<'database' | 'manual'>('database');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Бүгд');

  // Selected food from DB
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portionGrams, setPortionGrams] = useState<number>(100);
  const [portionLabel, setPortionLabel] = useState<string>('100 грамм');
  const [mealCategory, setMealCategory] = useState<MealCategory>(defaultMealCategory);
  const [entryDate, setEntryDate] = useState<string>(defaultDate);

  // Manual entry fields
  const [manualName, setManualName] = useState('');
  const [manualGrams, setManualGrams] = useState<number>(150);
  const [manualCalories, setManualCalories] = useState<number>(200);
  const [manualProtein, setManualProtein] = useState<number>(8);
  const [manualCarbs, setManualCarbs] = useState<number>(25);
  const [manualFat, setManualFat] = useState<number>(6);
  const [manualNotes, setManualNotes] = useState('');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    foodDatabase.forEach((f) => set.add(f.category));
    return ['Бүгд', ...Array.from(set)];
  }, [foodDatabase]);

  // Filter food items
  const filteredFoods = useMemo(() => {
    return foodDatabase.filter((f) => {
      const matchSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategoryFilter === 'Бүгд' || f.category === selectedCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [foodDatabase, searchQuery, selectedCategoryFilter]);

  const calculatedNutrition = useMemo(() => {
    if (!selectedFood) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return {
      calories: Math.round((selectedFood.caloriesPer100g * portionGrams) / 100),
      protein: calculatePortionNutrients(selectedFood.proteinPer100g, portionGrams),
      carbs: calculatePortionNutrients(selectedFood.carbsPer100g, portionGrams),
      fat: calculatePortionNutrients(selectedFood.fatPer100g, portionGrams),
    };
  }, [selectedFood, portionGrams]);

  if (!isOpen) return null;

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    const defaultOption = food.servingOptions[0] || { label: '100 грамм', grams: 100 };
    setPortionGrams(defaultOption.grams);
    setPortionLabel(defaultOption.label);
  };

  const handleSaveDbEntry = async () => {
    if (!selectedFood) return;

    const entry: DiaryEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: entryDate,
      mealCategory,
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      portionGrams,
      servingDescription: portionLabel || `${portionGrams}г`,
      calories: calculatedNutrition.calories,
      protein: calculatedNutrition.protein,
      carbs: calculatedNutrition.carbs,
      fat: calculatedNutrition.fat,
      photoDataUrl: selectedFood.imageUrl,
      isAiEstimated: !selectedFood.isVerified,
      createdAt: new Date().toISOString(),
    };

    await onSaveEntry(entry);
    onClose();
  };

  const handleSaveManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) {
      alert('Хоолны нэрийг оруулна уу.');
      return;
    }

    const entry: DiaryEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: entryDate,
      mealCategory,
      foodName: manualName.trim(),
      portionGrams: Number(manualGrams) || 100,
      servingDescription: `${manualGrams}г порц`,
      calories: Math.round(Number(manualCalories) || 0),
      protein: Math.round(Number(manualProtein) * 10) / 10 || 0,
      carbs: Math.round(Number(manualCarbs) * 10) / 10 || 0,
      fat: Math.round(Number(manualFat) * 10) / 10 || 0,
      notes: manualNotes.trim() || undefined,
      isAiEstimated: false,
      createdAt: new Date().toISOString(),
    };

    await onSaveEntry(entry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-[#FAF7F2] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E7E2D8] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#EAE5DC] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">Өдрийн тэмдэглэлд хоол нэмэх</h3>
            <p className="text-xs text-stone-500">
              Хүнсний сангаас сонгох, гараар шивэх эсвэл AI зураг ашиглана уу
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-[#F2ECE4] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Mode Tabs */}
        <div className="px-6 pt-3 bg-white border-b border-stone-200 flex items-center justify-between gap-2">
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('database');
                setSelectedFood(null);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
                activeTab === 'database'
                  ? 'border-[#5A7D63] text-[#395340] bg-[#FAF7F2]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Хүнсний сангаас хайх
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
                activeTab === 'manual'
                  ? 'border-[#5A7D63] text-[#395340] bg-[#FAF7F2]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Гараар оруулах
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPhotoAi();
            }}
            className="mb-1.5 px-3 py-1.5 rounded-xl bg-[#EFF5F0] hover:bg-[#E2EDE4] text-[#3B5441] border border-[#C5D7C9] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-[#4E6E56]" />
            <span>Зураг таних (AI)</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Target Meal & Date Settings */}
          <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-2xl border border-stone-200">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Хооллох үе
              </label>
              <select
                value={mealCategory}
                onChange={(e) => setMealCategory(e.target.value as MealCategory)}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A7D63]/40"
              >
                {Object.entries(MEAL_CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Огноо
              </label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A7D63]/40"
              >
              </input>
            </div>
          </div>

          {/* TAB 1: Food Database Search */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              {!selectedFood ? (
                <>
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Хоол, орц, ногоо, жимс хайх (ж.нь: Цуйван, Бууз, Сүү)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#5A7D63]/40 shadow-xs"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          selectedCategoryFilter === cat
                            ? 'bg-[#5A7D63] text-white'
                            : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Food List */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {filteredFoods.length === 0 ? (
                      <div className="py-8 text-center text-stone-500 text-xs">
                        Хайлтад тохирох хүнс олдсонгүй. Та 'Гараар оруулах' табаар шууд бичиж болно.
                      </div>
                    ) : (
                      filteredFoods.map((food) => (
                        <div
                          key={food.id}
                          onClick={() => handleSelectFood(food)}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white border border-stone-200 hover:border-[#5A7D63] hover:shadow-xs transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={food.imageUrl}
                              alt={food.name}
                              className="w-12 h-12 rounded-xl object-cover bg-stone-100"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-stone-800 group-hover:text-[#395340]">
                                  {food.name}
                                </h4>
                                {food.isVerified ? (
                                  <span
                                    title="Баталгаажсан лавлагаа"
                                    className="p-0.5 rounded-full text-emerald-600 bg-emerald-50"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                  </span>
                                ) : (
                                  <span
                                    title="Тооцоолсон дундаж"
                                    className="p-0.5 rounded-full text-amber-600 bg-amber-50"
                                  >
                                    <HelpCircle className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-stone-500">
                                100г тутамд: <span className="font-semibold text-stone-700">{food.caloriesPer100g} ккал</span> | Уураг {food.proteinPer100g}г | Өөх {food.fatPer100g}г | Нүүрс {food.carbsPer100g}г
                              </p>
                            </div>
                          </div>
                          <button className="px-3 py-1.5 rounded-xl bg-stone-100 group-hover:bg-[#5A7D63] group-hover:text-white text-xs font-semibold text-stone-700 transition-colors">
                            Сонгох
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                /* Selected Food Portion Configurator */
                <div className="space-y-4 bg-white p-5 rounded-2xl border border-[#5A7D63]/30">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedFood.imageUrl}
                        alt={selectedFood.name}
                        className="w-14 h-14 rounded-2xl object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-stone-900">{selectedFood.name}</h4>
                          {selectedFood.isVerified ? (
                            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              Баталгаажсан лавлагаа
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <HelpCircle className="w-3 h-3" />
                              Тооцоолсон дундаж
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">{selectedFood.referenceSource}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFood(null)}
                      className="text-xs text-[#4E6E56] font-semibold hover:underline"
                    >
                      Өөр хүнс сонгох
                    </button>
                  </div>

                  {/* Serving Portion Options */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Порцын хэмжээ сонгох:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selectedFood.servingOptions.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setPortionGrams(opt.grams);
                            setPortionLabel(opt.label);
                          }}
                          className={`p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                            portionGrams === opt.grams && portionLabel === opt.label
                              ? 'bg-[#EFF5F0] border-[#5A7D63] text-[#2F4535] font-bold shadow-xs'
                              : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <div className="font-semibold">{opt.label}</div>
                          <div className="text-[10px] text-stone-500">{opt.grams} грамм</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom grams adjustment */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-stone-500" />
                      <span>Эсвэл жинг гараар өөрчлөх (грамм):</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="3000"
                      value={portionGrams}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPortionGrams(val);
                        setPortionLabel(`${val} грамм`);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A7D63]/40"
                    />
                  </div>

                  {/* Dynamic Calculated Nutrition Summary */}
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-stone-700">
                        {portionGrams}г порцын шим тэжээл:
                      </span>
                      <div className="flex items-center gap-1.5 text-orange-700 font-extrabold text-base">
                        <Flame className="w-4 h-4 fill-orange-500 text-orange-600" />
                        <span>{calculatedNutrition.calories} ккал</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-emerald-50 p-2 rounded-xl">
                        <span className="text-[11px] text-emerald-800 font-medium block">Уураг</span>
                        <strong className="text-emerald-950 text-sm">{calculatedNutrition.protein}г</strong>
                      </div>
                      <div className="bg-amber-50 p-2 rounded-xl">
                        <span className="text-[11px] text-amber-800 font-medium block">Нүүрс ус</span>
                        <strong className="text-amber-950 text-sm">{calculatedNutrition.carbs}г</strong>
                      </div>
                      <div className="bg-rose-50 p-2 rounded-xl">
                        <span className="text-[11px] text-rose-800 font-medium block">Өөх тос</span>
                        <strong className="text-rose-950 text-sm">{calculatedNutrition.fat}г</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveDbEntry}
                    className="w-full py-3 rounded-xl bg-[#5A7D63] hover:bg-[#4E6E56] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Тэмдэглэлд нэмэх</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Manual Custom Food Form */}
          {activeTab === 'manual' && (
            <form onSubmit={handleSaveManualEntry} className="space-y-4 bg-white p-5 rounded-2xl border border-stone-200">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Хоол эсвэл бүтээгдэхүүний нэр *
                </label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Жишээ нь: Гэрийн хуурга, Шарсан өндөгтэй талх..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A7D63]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Порцын жин (грамм) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={manualGrams}
                    onChange={(e) => setManualGrams(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A7D63]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-orange-700 mb-1">
                    Илчлэг (ккал) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={manualCalories}
                    onChange={(e) => setManualCalories(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  />
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-emerald-800 mb-1">
                    Уураг (г)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={manualProtein}
                    onChange={(e) => setManualProtein(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-emerald-200 text-xs sm:text-sm font-semibold bg-emerald-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                    Нүүрс ус (г)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={manualCarbs}
                    onChange={(e) => setManualCarbs(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-amber-200 text-xs sm:text-sm font-semibold bg-amber-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-rose-800 mb-1">
                    Өөх тос (г)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={manualFat}
                    onChange={(e) => setManualFat(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-rose-200 text-xs sm:text-sm font-semibold bg-rose-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Тэмдэглэл (заавал биш)
                </label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="Орц, хийсэн арга..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#5A7D63] hover:bg-[#4E6E56] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Тэмдэглэлд хадгалах</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ShieldCheck,
  HelpCircle,
  Plus,
  Scale,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Info,
  Check,
  X,
} from 'lucide-react';
import {
  DiaryEntry,
  FoodItem,
  MealCategory,
  MEAL_CATEGORY_LABELS,
} from '../types/nutrition';
import { calculatePortionNutrients } from '../utils/nutritionCalculator';

interface FoodDatabaseViewProps {
  foodDatabase: FoodItem[];
  onAddCustomFood: (food: FoodItem) => Promise<void>;
  onLogFoodToDiary: (entry: DiaryEntry) => Promise<void>;
  selectedDate: string;
}

export const FoodDatabaseView: React.FC<FoodDatabaseViewProps> = ({
  foodDatabase,
  onAddCustomFood,
  onLogFoodToDiary,
  selectedDate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Бүгд');
  const [sortBy, setSortBy] = useState<'name' | 'calories_asc' | 'calories_desc' | 'protein'>(
    'name'
  );

  // Selected food for detailed portion inspection / adding
  const [inspectingFood, setInspectingFood] = useState<FoodItem | null>(null);
  const [inspectPortionGrams, setInspectPortionGrams] = useState<number>(100);
  const [inspectPortionLabel, setInspectPortionLabel] = useState<string>('100 грамм');
  const [inspectMealCategory, setInspectMealCategory] = useState<MealCategory>('lunch');
  const [inspectDate, setInspectDate] = useState<string>(selectedDate);
  const [addSuccessNotice, setAddSuccessNotice] = useState<string | null>(null);

  // New Custom Food Creation Modal
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Гэрийн хоол');
  const [customCalories100g, setCustomCalories100g] = useState<number>(200);
  const [customProtein100g, setCustomProtein100g] = useState<number>(10);
  const [customCarbs100g, setCustomCarbs100g] = useState<number>(20);
  const [customFat100g, setCustomFat100g] = useState<number>(8);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    foodDatabase.forEach((f) => set.add(f.category));
    return ['Бүгд', ...Array.from(set)];
  }, [foodDatabase]);

  // Filtering and sorting
  const displayedFoods = useMemo(() => {
    return foodDatabase
      .filter((food) => {
        const matchesSearch =
          food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          food.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (food.description && food.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory =
          selectedCategory === 'Бүгд' || food.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name, 'mn');
        if (sortBy === 'calories_asc') return a.caloriesPer100g - b.caloriesPer100g;
        if (sortBy === 'calories_desc') return b.caloriesPer100g - a.caloriesPer100g;
        if (sortBy === 'protein') return b.proteinPer100g - a.proteinPer100g;
        return 0;
      });
  }, [foodDatabase, searchQuery, selectedCategory, sortBy]);

  const handleInspectFood = (food: FoodItem) => {
    setInspectingFood(food);
    const defaultServing = food.servingOptions[0] || { label: '100 грамм', grams: 100 };
    setInspectPortionGrams(defaultServing.grams);
    setInspectPortionLabel(defaultServing.label);
    setInspectDate(selectedDate);
    setAddSuccessNotice(null);
  };

  const calculatedNutrients = useMemo(() => {
    if (!inspectingFood) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return {
      calories: Math.round((inspectingFood.caloriesPer100g * inspectPortionGrams) / 100),
      protein: calculatePortionNutrients(inspectingFood.proteinPer100g, inspectPortionGrams),
      carbs: calculatePortionNutrients(inspectingFood.carbsPer100g, inspectPortionGrams),
      fat: calculatePortionNutrients(inspectingFood.fatPer100g, inspectPortionGrams),
    };
  }, [inspectingFood, inspectPortionGrams]);

  const handleLogInspectedFood = async () => {
    if (!inspectingFood) return;

    const entry: DiaryEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: inspectDate,
      mealCategory: inspectMealCategory,
      foodId: inspectingFood.id,
      foodName: inspectingFood.name,
      portionGrams: inspectPortionGrams,
      servingDescription: inspectPortionLabel || `${inspectPortionGrams}г`,
      calories: calculatedNutrients.calories,
      protein: calculatedNutrients.protein,
      carbs: calculatedNutrients.carbs,
      fat: calculatedNutrients.fat,
      photoDataUrl: inspectingFood.imageUrl,
      isAiEstimated: !inspectingFood.isVerified,
      createdAt: new Date().toISOString(),
    };

    await onLogFoodToDiary(entry);
    setAddSuccessNotice(`'${inspectingFood.name}' тэмдэглэлд амжилттай нэмэгдлээ!`);
    setTimeout(() => {
      setInspectingFood(null);
      setAddSuccessNotice(null);
    }, 1200);
  };

  const handleCreateCustomFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      alert('Хүнсний нэрийг оруулна уу.');
      return;
    }

    const newFood: FoodItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: customName.trim(),
      category: customCategory || 'Хэрэглэгчийн үүсгэсэн',
      caloriesPer100g: Math.round(Number(customCalories100g) || 0),
      proteinPer100g: Math.round(Number(customProtein100g) * 10) / 10 || 0,
      carbsPer100g: Math.round(Number(customCarbs100g) * 10) / 10 || 0,
      fatPer100g: Math.round(Number(customFat100g) * 10) / 10 || 0,
      servingOptions: [
        { label: '1 порц (~150г)', grams: 150 },
        { label: '100 грамм', grams: 100 },
      ],
      imageUrl:
        customImageUrl.trim() ||
        'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80',
      isVerified: false,
      referenceSource: 'Хэрэглэгчийн оруулсан өгөгдөл',
      isCustom: true,
    };

    await onAddCustomFood(newFood);
    setIsCreatingCustom(false);
    setCustomName('');
    setCustomCalories100g(200);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-3xl border border-[#E7E2D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Хүнсний сан</h2>
          <p className="text-xs text-stone-500">
            Монгол үндэсний болон нийтлэг хүнсний шим тэжээлийн лавлагаа сан
          </p>
        </div>

        <button
          onClick={() => setIsCreatingCustom(true)}
          className="px-4 py-2.5 rounded-xl bg-[#5A7D63] hover:bg-[#4E6E56] text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Шинэ хүнс үүсгэх</span>
        </button>
      </div>

      {/* Verification Legend & Transparency Note */}
      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200 text-xs text-stone-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-stone-800">НЭМҮТ / USDA баталгаажсан:</span>
            <span className="text-stone-500">Стандарт судалгааны тоо баримт</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span className="font-semibold text-stone-800">Тооцоолсон дундаж:</span>
            <span className="text-stone-500">Гэрийн арга, тосноос хамаарч хэлбэлзэнэ</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Монгол хоол, ногоо, жимс, мах хайх (Бууз, Цуйван, Тараг)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#5A7D63]/40 shadow-xs"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-stone-500 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 rounded-2xl border border-stone-300 bg-white text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#5A7D63]/40 shadow-xs"
            >
              <option value="name">Нэрээр (А-Я)</option>
              <option value="calories_desc">Илчлэг ихээс бага руу</option>
              <option value="calories_asc">Илчлэг багаас их рүү</option>
              <option value="protein">Уураг хамгийн өндөр</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#5A7D63] text-white'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Food Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedFoods.map((food) => (
          <div
            key={food.id}
            onClick={() => handleInspectFood(food)}
            className="bg-white rounded-3xl border border-stone-200/90 hover:border-[#5A7D63] shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
          >
            <div>
              {/* Image & Badge */}
              <div className="relative h-44 overflow-hidden bg-stone-100">
                <img
                  src={food.imageUrl}
                  alt={food.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold bg-white/90 backdrop-blur-xs text-stone-800 px-2 py-0.5 rounded-full shadow-2xs">
                    {food.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  {food.isVerified ? (
                    <span className="text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                      <ShieldCheck className="w-3 h-3" />
                      Баталгаажсан
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-amber-500/90 text-white backdrop-blur-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                      <HelpCircle className="w-3 h-3" />
                      Баримжаа
                    </span>
                  )}
                </div>
              </div>

              {/* Title & 100g Metrics */}
              <div className="p-4 space-y-2">
                <h4 className="text-base font-bold text-stone-900 group-hover:text-[#395340] transition-colors">
                  {food.name}
                </h4>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-stone-500">100 грамм тутамд:</span>
                  <span className="font-extrabold text-orange-700 text-sm">
                    {food.caloriesPer100g} ккал
                  </span>
                </div>

                {/* Macro breakdown pills */}
                <div className="grid grid-cols-3 gap-1.5 pt-2 text-center text-xs">
                  <div className="bg-emerald-50/70 p-1.5 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 font-medium block">Уураг</span>
                    <strong className="text-emerald-950 font-bold text-xs">
                      {food.proteinPer100g}г
                    </strong>
                  </div>
                  <div className="bg-amber-50/70 p-1.5 rounded-xl border border-amber-100">
                    <span className="text-[10px] text-amber-800 font-medium block">Нүүрс</span>
                    <strong className="text-amber-950 font-bold text-xs">
                      {food.carbsPer100g}г
                    </strong>
                  </div>
                  <div className="bg-rose-50/70 p-1.5 rounded-xl border border-rose-100">
                    <span className="text-[10px] text-rose-800 font-medium block">Өөх тос</span>
                    <strong className="text-rose-950 font-bold text-xs">
                      {food.fatPer100g}г
                    </strong>
                  </div>
                </div>

                {food.description && (
                  <p className="text-[11px] text-stone-500 line-clamp-2 pt-1">
                    {food.description}
                  </p>
                )}
              </div>
            </div>

            <div className="px-4 pb-4">
              <button className="w-full py-2 rounded-xl bg-stone-100 group-hover:bg-[#5A7D63] group-hover:text-white text-stone-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Порц тооцоолж тэмдэглэх</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Food Portion Inspector & Log Modal */}
      {inspectingFood && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-[#FAF7F2] w-full max-w-lg rounded-3xl shadow-2xl border border-[#E7E2D8] overflow-hidden p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={inspectingFood.imageUrl}
                  alt={inspectingFood.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-stone-200"
                />
                <div>
                  <h3 className="text-base font-bold text-stone-900">{inspectingFood.name}</h3>
                  <p className="text-xs text-stone-500">{inspectingFood.referenceSource}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingFood(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Serving portion options */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Порцын хэмжээ сонгох:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {inspectingFood.servingOptions.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setInspectPortionGrams(opt.grams);
                      setInspectPortionLabel(opt.label);
                    }}
                    className={`p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                      inspectPortionGrams === opt.grams && inspectPortionLabel === opt.label
                        ? 'bg-[#EFF5F0] border-[#5A7D63] text-[#2F4535] font-bold shadow-xs'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-stone-400">{opt.grams} грамм</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom grams */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-stone-500" />
                <span>Хэрэглэх жинг гараар тохируулах (грамм):</span>
              </label>
              <input
                type="number"
                min="1"
                max="3000"
                value={inspectPortionGrams}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setInspectPortionGrams(val);
                  setInspectPortionLabel(`${val} грамм`);
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-semibold bg-white"
              />
            </div>

            {/* Target Meal & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Хооллох үе:
                </label>
                <select
                  value={inspectMealCategory}
                  onChange={(e) => setInspectMealCategory(e.target.value as MealCategory)}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white"
                >
                  {Object.entries(MEAL_CATEGORY_LABELS).map(([k, lbl]) => (
                    <option key={k} value={k}>
                      {lbl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Огноо:</label>
                <input
                  type="date"
                  value={inspectDate}
                  onChange={(e) => setInspectDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white"
                />
              </div>
            </div>

            {/* Calculated Nutrition Result */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-700">
                  {inspectPortionGrams}г порцын тооцоолсон илчлэг:
                </span>
                <span className="text-lg font-black text-orange-700">
                  {calculatedNutrients.calories} ккал
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-emerald-50 p-2 rounded-xl">
                  <span className="text-[10px] text-emerald-800 font-semibold block">Уураг</span>
                  <strong>{calculatedNutrients.protein}г</strong>
                </div>
                <div className="bg-amber-50 p-2 rounded-xl">
                  <span className="text-[10px] text-amber-800 font-semibold block">Нүүрс ус</span>
                  <strong>{calculatedNutrients.carbs}г</strong>
                </div>
                <div className="bg-rose-50 p-2 rounded-xl">
                  <span className="text-[10px] text-rose-800 font-semibold block">Өөх тос</span>
                  <strong>{calculatedNutrients.fat}г</strong>
                </div>
              </div>
            </div>

            {addSuccessNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{addSuccessNotice}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                onClick={() => setInspectingFood(null)}
                className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Хаах
              </button>
              <button
                onClick={handleLogInspectedFood}
                className="px-5 py-2.5 rounded-xl bg-[#5A7D63] hover:bg-[#4E6E56] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Тэмдэглэлд нэмэх</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Custom Food Creation Modal */}
      {isCreatingCustom && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <form
            onSubmit={handleCreateCustomFood}
            className="relative bg-[#FAF7F2] w-full max-w-lg rounded-3xl shadow-2xl border border-[#E7E2D8] overflow-hidden p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-base font-bold text-stone-900">Шинэ хүнс санд нэмэх</h3>
              <button
                type="button"
                onClick={() => setIsCreatingCustom(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Хүнсний нэр *
              </label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Жишээ нь: Хайлмаг, Ээзгий, Гэрийн пирожки..."
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Ангилал</label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-orange-700 mb-1">
                  100г дахь илчлэг (ккал) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={customCalories100g}
                  onChange={(e) => setCustomCalories100g(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-orange-700 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-emerald-800 mb-1">
                  Уураг (100г)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customProtein100g}
                  onChange={(e) => setCustomProtein100g(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-emerald-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-amber-800 mb-1">
                  Нүүрс (100г)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customCarbs100g}
                  onChange={(e) => setCustomCarbs100g(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-amber-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-rose-800 mb-1">
                  Өөх (100г)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customFat100g}
                  onChange={(e) => setCustomFat100g(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-rose-200 text-xs bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Зургийн холбоос URL (заавал биш)
              </label>
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsCreatingCustom(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Болих
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#5A7D63] hover:bg-[#4E6E56] text-white text-xs font-bold shadow-xs"
              >
                Хадгалах
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

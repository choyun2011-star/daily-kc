import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Clock,
  Users,
  Flame,
  Plus,
  Search,
  Check,
  X,
  ChefHat,
  Info,
  Scale,
} from 'lucide-react';
import { DiaryEntry, MealCategory, MEAL_CATEGORY_LABELS, Recipe } from '../types/nutrition';
import { RECIPES_DATA } from '../data/recipes';

interface MealIdeasViewProps {
  onLogRecipeToDiary: (entry: DiaryEntry) => Promise<void>;
  selectedDate: string;
}

export const MealIdeasView: React.FC<MealIdeasViewProps> = ({
  onLogRecipeToDiary,
  selectedDate,
}) => {
  const [recipes] = useState<Recipe[]>(RECIPES_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | MealCategory>('all');
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  // Modal logging state
  const [logMealCategory, setLogMealCategory] = useState<MealCategory>('lunch');
  const [logDate, setLogDate] = useState<string>(selectedDate);
  const [logSuccessNotice, setLogSuccessNotice] = useState<string | null>(null);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.ingredients.some((ing) => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = categoryFilter === 'all' || r.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [recipes, searchQuery, categoryFilter]);

  const handleOpenRecipeModal = (recipe: Recipe) => {
    setActiveRecipe(recipe);
    setLogMealCategory(recipe.category);
    setLogDate(selectedDate);
    setLogSuccessNotice(null);
  };

  const handleLogActiveRecipe = async () => {
    if (!activeRecipe) return;

    const entry: DiaryEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: logDate,
      mealCategory: logMealCategory,
      foodName: activeRecipe.name,
      portionGrams: 300,
      servingDescription: '1 порц',
      calories: activeRecipe.caloriesPerServing,
      protein: activeRecipe.proteinPerServing,
      carbs: activeRecipe.carbsPerServing,
      fat: activeRecipe.fatPerServing,
      photoDataUrl: activeRecipe.imageUrl,
      notes: `Хоолны санаанаас нэмэгдсэн: ${activeRecipe.name}`,
      isAiEstimated: true,
      createdAt: new Date().toISOString(),
    };

    await onLogRecipeToDiary(entry);
    setLogSuccessNotice(`'${activeRecipe.name}' хоолны тэмдэглэлд амжилттай бүртгэгдлээ!`);
    setTimeout(() => {
      setActiveRecipe(null);
      setLogSuccessNotice(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-[#E7E2D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EFF5F0] text-[#395340] flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-[#4E6E56]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Эрүүл хоолны санаанууд</h2>
            <p className="text-xs text-stone-500">
              Монгол хүний онцлогт тохирсон тэнцвэртэй хоолны жор ба орц
            </p>
          </div>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
        <p>
          Хоолны илчлэг ба шим тэжээлийн утгууд нь сонгосон махны өөхлөг байдал, тосны хэмжээ, брэндийн орцоос хамааран бодит амьдрал дээр зөрж болзошгүй баримжаа юм.
        </p>
      </div>

      {/* Search & Categories */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Жор, орцоор хайх (Цуйван, банш, овьёос, ногоо)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#5A7D63]/40 shadow-xs"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-[#5A7D63] text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Бүх жор
          </button>
          <button
            onClick={() => setCategoryFilter('breakfast')}
            className={`px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
              categoryFilter === 'breakfast'
                ? 'bg-[#5A7D63] text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Өглөөний хоол
          </button>
          <button
            onClick={() => setCategoryFilter('lunch')}
            className={`px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
              categoryFilter === 'lunch'
                ? 'bg-[#5A7D63] text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Өдрийн хоол
          </button>
          <button
            onClick={() => setCategoryFilter('dinner')}
            className={`px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
              categoryFilter === 'dinner'
                ? 'bg-[#5A7D63] text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Оройн хоол
          </button>
          <button
            onClick={() => setCategoryFilter('snack')}
            className={`px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
              categoryFilter === 'snack'
                ? 'bg-[#5A7D63] text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Эрүүл зууш
          </button>
        </div>
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => handleOpenRecipeModal(recipe)}
            className="bg-white rounded-3xl border border-stone-200 hover:border-[#5A7D63] shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
          >
            <div>
              {/* Photo */}
              <div className="relative h-48 overflow-hidden bg-stone-100">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold bg-[#FAF7F2]/90 backdrop-blur-xs text-[#2D4533] px-2.5 py-1 rounded-full">
                    {recipe.mongolianFeature || 'Монгол жор'}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold drop-shadow-md">
                  <span className="flex items-center gap-1 bg-stone-900/60 backdrop-blur-xs px-2.5 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    {recipe.prepTimeMinutes} мин
                  </span>
                  <span className="flex items-center gap-1 bg-stone-900/60 backdrop-blur-xs px-2.5 py-1 rounded-full">
                    <Users className="w-3.5 h-3.5" />
                    {recipe.servings} хүн
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <h4 className="text-base font-bold text-stone-900 group-hover:text-[#395340] transition-colors">
                  {recipe.name}
                </h4>
                <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                  {recipe.description}
                </p>

                {/* Nutrition Pills */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <span className="font-extrabold text-orange-700 text-sm">
                    {recipe.caloriesPerServing} ккал
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500">
                    <span className="text-emerald-700 font-semibold">У: {recipe.proteinPerServing}г</span>
                    <span>·</span>
                    <span className="text-amber-700 font-semibold">Н: {recipe.carbsPerServing}г</span>
                    <span>·</span>
                    <span className="text-rose-700 font-semibold">Ө: {recipe.fatPerServing}г</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5">
              <button className="w-full py-2.5 rounded-xl bg-stone-100 group-hover:bg-[#5A7D63] group-hover:text-white text-stone-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                <span>Жор харах & Тэмдэглэлд нэмэх</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Detail & Add to Diary Modal */}
      {activeRecipe && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-[#FAF7F2] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E7E2D8] overflow-hidden flex flex-col max-h-[92vh]">
            <div className="relative h-56 shrink-0 bg-stone-900">
              <img
                src={activeRecipe.imageUrl}
                alt={activeRecipe.name}
                className="w-full h-full object-cover opacity-90"
              />
              <button
                onClick={() => setActiveRecipe(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6 text-white drop-shadow-md">
                <span className="text-xs font-bold bg-[#5A7D63] px-2.5 py-0.5 rounded-full inline-block mb-1">
                  {MEAL_CATEGORY_LABELS[activeRecipe.category]}
                </span>
                <h3 className="text-xl font-black">{activeRecipe.name}</h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Macro Banner */}
              <div className="grid grid-cols-4 gap-2 bg-white p-3 rounded-2xl border border-stone-200 text-center text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 block">Илчлэг</span>
                  <strong className="text-sm font-black text-orange-700">
                    {activeRecipe.caloriesPerServing} ккал
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Уураг</span>
                  <strong className="text-sm font-bold text-emerald-800">
                    {activeRecipe.proteinPerServing}г
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Нүүрс ус</span>
                  <strong className="text-sm font-bold text-amber-800">
                    {activeRecipe.carbsPerServing}г
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Өөх тос</span>
                  <strong className="text-sm font-bold text-rose-800">
                    {activeRecipe.fatPerServing}г
                  </strong>
                </div>
              </div>

              {/* Ingredients List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Орц найрлага (1 порц тутамд):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeRecipe.ingredients.map((ing, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 text-xs"
                    >
                      <span className="font-semibold text-stone-800">{ing.name}</span>
                      <span className="text-stone-500 font-medium">{ing.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Хийх заавар:
                </h4>
                <div className="space-y-2">
                  {activeRecipe.instructions.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-stone-200 text-xs text-stone-700 leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#5A7D63] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add to Diary Action Form */}
              <div className="bg-white p-4 rounded-2xl border border-[#5A7D63]/30 space-y-3">
                <h4 className="text-xs font-bold text-stone-900">
                  Энэ хоолыг өдрийн тэмдэглэлдээ нэмэх:
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Хооллох цаг
                    </label>
                    <select
                      value={logMealCategory}
                      onChange={(e) => setLogMealCategory(e.target.value as MealCategory)}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-stone-50"
                    >
                      {Object.entries(MEAL_CATEGORY_LABELS).map(([k, lbl]) => (
                        <option key={k} value={k}>
                          {lbl}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Огноо
                    </label>
                    <input
                      type="date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs bg-stone-50"
                    />
                  </div>
                </div>

                {logSuccessNotice && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{logSuccessNotice}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleLogActiveRecipe}
                  className="w-full py-2.5 rounded-xl bg-[#5A7D63] hover:bg-[#4E6E56] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Өдрийн тэмдэглэлд нэмэх</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

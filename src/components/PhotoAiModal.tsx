import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Info,
  Scale,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
} from 'lucide-react';
import {
  AiRecognitionResult,
  DiaryEntry,
  MealCategory,
  MEAL_CATEGORY_LABELS,
} from '../types/nutrition';

interface PhotoAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEntry: (entry: DiaryEntry) => Promise<void>;
  defaultDate: string;
}

export const PhotoAiModal: React.FC<PhotoAiModalProps> = ({
  isOpen,
  onClose,
  onSaveEntry,
  defaultDate,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [foodHint, setFoodHint] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AiRecognitionResult | null>(null);

  // Form states (editable by user)
  const [foodName, setFoodName] = useState<string>('');
  const [portionGrams, setPortionGrams] = useState<number>(200);
  const [calories, setCalories] = useState<number>(250);
  const [protein, setProtein] = useState<number>(10);
  const [carbs, setCarbs] = useState<number>(30);
  const [fat, setFat] = useState<number>(8);
  const [mealCategory, setMealCategory] = useState<MealCategory>('lunch');
  const [entryDate, setEntryDate] = useState<string>(defaultDate);
  const [servingDescription, setServingDescription] = useState<string>('');
  const [uncertaintyNotice, setUncertaintyNotice] = useState<string>(
    'Гэрэл зургаар бодит жин, орц, тос болон хоол хийсэн аргыг 100% нарийн тогтоох боломжгүй тул эдгээр нь баримжаа тооцоо юм.'
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');

    // Read file as base64 data URL
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImage(result);
      setAiError(null);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleResetImage = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setAiError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleAnalyzePhoto = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAiError(null);

    try {
      const response = await fetch('/api/ai/recognize-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: selectedImage,
          mimeType: mimeType,
          foodHint: foodHint.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            'Хоолны зургийг хиймэл оюунаар шинжлэхэд алдаа гарлаа. Та доорх талбаруудыг гараар бөглөн тэмдэглэлдээ хадгална уу.'
        );
      }

      const result: AiRecognitionResult = data.data;
      setAnalysisResult(result);
      setFoodName(result.foodName || '');
      setPortionGrams(result.estimatedGrams || 250);
      setCalories(result.calories || 300);
      setProtein(result.protein || 12);
      setCarbs(result.carbs || 35);
      setFat(result.fat || 10);
      setServingDescription(result.servingDescription || `${result.estimatedGrams || 250}г порц`);
      if (result.uncertaintyNotice) {
        setUncertaintyNotice(result.uncertaintyNotice);
      }
    } catch (err: any) {
      console.warn('AI analysis fallback triggered:', err);
      setAiError(
        err.message ||
          'AI серверийн хариу ирсэнгүй. Гэхдээ та зургийг хадгалан хоолны мэдээллээ гараар оруулан бүртгэх боломжтой.'
      );
      // Fallback sensible defaults for manual entry
      if (!foodName) setFoodName(foodHint.trim() || 'Гэрийн хоол');
      setServingDescription(`${portionGrams}г порц`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!foodName.trim()) {
      alert('Хоолны нэрийг оруулна уу.');
      return;
    }

    const newEntry: DiaryEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: entryDate,
      mealCategory,
      foodName: foodName.trim(),
      portionGrams: Number(portionGrams) || 100,
      servingDescription: servingDescription || `${portionGrams}г порц`,
      calories: Math.round(Number(calories) || 0),
      protein: Math.round(Number(protein) * 10) / 10 || 0,
      carbs: Math.round(Number(carbs) * 10) / 10 || 0,
      fat: Math.round(Number(fat) * 10) / 10 || 0,
      photoDataUrl: selectedImage || undefined,
      isAiEstimated: Boolean(analysisResult),
      createdAt: new Date().toISOString(),
    };

    await onSaveEntry(newEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-[#FAF7F2] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E7E2D8] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#EAE5DC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5A7D63]/15 text-[#395340] flex items-center justify-center">
              <Camera className="w-5 h-5 text-[#4E6E56]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <span>Хоолны зураг таних</span>
                <span className="text-[11px] font-semibold bg-[#5A7D63]/15 text-[#395340] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Gemini AI
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                Зураг оруулж илчлэг, порцын баримжаа тооцоог гаргуулна
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-[#F2ECE4] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Step 1: Image Selector / Preview */}
          {!selectedImage ? (
            <div className="border-2 border-dashed border-[#CFD8D1] rounded-2xl p-6 sm:p-8 text-center bg-white/70 hover:bg-white transition-colors">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-[#EFF5F0] text-[#4E6E56] flex items-center justify-center mb-3">
                <Camera className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-stone-800 mb-1">Хоолны зураг сонгох</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-5">
                Гар утасныхаа камераар шинэ зураг авах эсвэл зургийн сангаасаа сонгон оруулна уу
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* Take Photo Button */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-[#5A7D63] hover:bg-[#4E6E56] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <Camera className="w-4 h-4" />
                  <span>Камераар авах</span>
                </button>

                {/* Upload File Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>Зургийн сангаас сонгох</span>
                </button>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview Card */}
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 group">
                <img
                  src={selectedImage}
                  alt="Хоолны урьдчилсан харагдац"
                  className="w-full max-h-72 object-cover"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetImage}
                    className="p-2 rounded-xl bg-stone-900/70 hover:bg-stone-900 text-white backdrop-blur-xs text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Зураг солих</span>
                  </button>
                </div>
              </div>

              {/* Optional Food Hint Input */}
              {!analysisResult && !isAnalyzing && (
                <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3">
                  <label className="block text-xs font-bold text-stone-700">
                    Хоолны нэр / Нэмэлт тайлбар (заавал биш)
                  </label>
                  <input
                    type="text"
                    value={foodHint}
                    onChange={(e) => setFoodHint(e.target.value)}
                    placeholder="Жишээ нь: Шарсан цуйван, 4 ширхэг бууз..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#5A7D63]/40 focus:bg-white"
                  />
                  <p className="text-[11px] text-stone-500">
                    Хэрэв хоолны нэрийг урьдчилан бичвэл AI илүү нарийн орц, илчлэгийг тооцоолох болно.
                  </p>

                  <button
                    type="button"
                    onClick={handleAnalyzePhoto}
                    className="w-full py-3 rounded-xl bg-[#5A7D63] hover:bg-[#4E6E56] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI-аар хоолыг шинжлүүлж илчлэг тооцох</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Loading Indicator */}
          {isAnalyzing && (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
              <div className="w-10 h-10 border-3 border-[#5A7D63]/30 border-t-[#5A7D63] rounded-full animate-spin mx-auto"></div>
              <h4 className="text-sm font-bold text-stone-800">Хоолны зургийг шинжилж байна...</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Монгол хоолны онцлог болон орц найрлагыг хиймэл оюун ухаанаар тооцоолж байна. Түр хүлээнэ үү.
              </p>
            </div>
          )}

          {/* AI Error Warning */}
          {aiError && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Мэдэгдэл:</p>
                <p>{aiError}</p>
                <p className="mt-1 text-stone-600">
                  Та доорх талбарт хоолныхоо нэр, грамм, илчлэгийг гараар оруулан тэмдэглэлдээ шууд хадгалах боломжтой.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Confirmation / Editing Form */}
          {(analysisResult || aiError || selectedImage) && !isAnalyzing && (
            <form onSubmit={handleSubmit} className="space-y-5 bg-white p-5 rounded-2xl border border-stone-200">
              {/* Uncertainty Notice */}
              <div className="p-3.5 rounded-xl bg-[#F4F6F4] border border-[#D5E1D7] flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#4E6E56] shrink-0 mt-0.5" />
                <p className="text-[11px] text-stone-700 leading-relaxed">
                  <strong className="text-[#2C4132] font-semibold">Баримжаа тооцоо: </strong>
                  {uncertaintyNotice}
                </p>
              </div>

              {/* Alternative Suggestions */}
              {analysisResult?.alternativeSuggestions &&
                analysisResult.alternativeSuggestions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-600">
                    <span className="font-semibold text-stone-700">Төстэй хувилбарууд:</span>
                    {analysisResult.alternativeSuggestions.map((alt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFoodName(alt)}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-[#E7ECE8] text-stone-700 text-xs font-medium transition-colors"
                      >
                        {alt}
                      </button>
                    ))}
                  </div>
                )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Food Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Хоолны нэр *
                  </label>
                  <input
                    type="text"
                    required
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="Хоолны нэр"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A7D63]/40"
                  />
                </div>

                {/* Meal Category */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Хооллох үе *
                  </label>
                  <select
                    value={mealCategory}
                    onChange={(e) => setMealCategory(e.target.value as MealCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5A7D63]/40"
                  >
                    {Object.entries(MEAL_CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Огноо *
                  </label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5A7D63]/40"
                  />
                </div>

                {/* Portion Grams */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-stone-500" />
                    <span>Порцын жин (грамм)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="3000"
                    value={portionGrams}
                    onChange={(e) => setPortionGrams(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A7D63]/40"
                  />
                </div>

                {/* Calories */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5 text-orange-700">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span>Илчлэг (ккал) *</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    required
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  />
                </div>
              </div>

              {/* Macronutrients */}
              <div className="pt-2 border-t border-stone-100">
                <span className="block text-xs font-bold text-stone-600 mb-2">
                  Шим тэжээлийн задаргаа (Засах боломжтой):
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                    <label className="block text-[11px] font-semibold text-emerald-800 flex items-center gap-1 mb-1">
                      <Dumbbell className="w-3 h-3 text-emerald-600" />
                      Уураг (г)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={protein}
                      onChange={(e) => setProtein(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg border border-emerald-200 text-xs sm:text-sm font-semibold bg-white text-emerald-900"
                    />
                  </div>

                  <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-100">
                    <label className="block text-[11px] font-semibold text-amber-800 flex items-center gap-1 mb-1">
                      <Wheat className="w-3 h-3 text-amber-600" />
                      Нүүрс ус (г)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={carbs}
                      onChange={(e) => setCarbs(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg border border-amber-200 text-xs sm:text-sm font-semibold bg-white text-amber-900"
                    />
                  </div>

                  <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-100">
                    <label className="block text-[11px] font-semibold text-rose-800 flex items-center gap-1 mb-1">
                      <Droplets className="w-3 h-3 text-rose-600" />
                      Өөх тос (г)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={fat}
                      onChange={(e) => setFat(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg border border-rose-200 text-xs sm:text-sm font-semibold bg-white text-rose-900"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#5A7D63] hover:bg-[#4E6E56] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Тэмдэглэлд хадгалах</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  User,
  Scale,
  Ruler,
  Calendar,
  Activity,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Droplet,
  ShieldAlert,
  CheckCircle2,
  Trash2,
  Info,
  HeartPulse,
} from 'lucide-react';
import {
  ActivityLevel,
  ACTIVITY_LEVEL_LABELS,
  UserProfile,
} from '../types/nutrition';
import {
  calculatePersonalNutrition,
  CalculationResult,
} from '../utils/nutritionCalculator';

interface ProfileCalculatorViewProps {
  currentProfile: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => Promise<void>;
  onDeleteProfile: () => Promise<void>;
}

export const ProfileCalculatorView: React.FC<ProfileCalculatorViewProps> = ({
  currentProfile,
  onSaveProfile,
  onDeleteProfile,
}) => {
  // Form fields
  const [age, setAge] = useState<number | ''>(currentProfile?.age || 28);
  const [gender, setGender] = useState<'male' | 'female'>(currentProfile?.gender || 'female');
  const [heightCm, setHeightCm] = useState<number | ''>(currentProfile?.heightCm || 168);
  const [weightKg, setWeightKg] = useState<number | ''>(currentProfile?.weightKg || 62);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    currentProfile?.activityLevel || 'moderate'
  );

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [calcResult, setCalcResult] = useState<CalculationResult | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (currentProfile) {
      setAge(currentProfile.age);
      setGender(currentProfile.gender);
      setHeightCm(currentProfile.heightCm);
      setWeightKg(currentProfile.weightKg);
      setActivityLevel(currentProfile.activityLevel);

      // Trigger calculation
      const res = calculatePersonalNutrition({
        age: currentProfile.age,
        gender: currentProfile.gender,
        heightCm: currentProfile.heightCm,
        weightKg: currentProfile.weightKg,
        activityLevel: currentProfile.activityLevel,
      });
      setCalcResult(res);
    }
  }, [currentProfile]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessNotice(false);

    const errors: string[] = [];
    const numAge = Number(age);
    const numHeight = Number(heightCm);
    const numWeight = Number(weightKg);

    if (!numAge || numAge < 10 || numAge > 110) {
      errors.push('Насыг 10 - 110 хооронд бодитоор оруулна уу.');
    }
    if (!numHeight || numHeight < 100 || numHeight > 250) {
      errors.push('Өндрийг 100 - 250 см хооронд оруулна уу.');
    }
    if (!numWeight || numWeight < 30 || numWeight > 250) {
      errors.push('Жинг 30 - 250 кг хооронд оруулна уу.');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    const result = calculatePersonalNutrition({
      age: numAge,
      gender,
      heightCm: numHeight,
      weightKg: numWeight,
      activityLevel,
    });

    setCalcResult(result);
  };

  const handleSaveToProfile = async () => {
    if (!calcResult || typeof age !== 'number' || typeof heightCm !== 'number' || typeof weightKg !== 'number') return;

    const profile: UserProfile = {
      id: 'user_profile',
      age,
      gender,
      heightCm,
      weightKg,
      activityLevel,
      targetCalories: calcResult.tdee,
      targetProtein: calcResult.proteinGrams,
      targetCarbs: calcResult.carbsGrams,
      targetFat: calcResult.fatGrams,
      targetWaterMl: calcResult.waterMl,
      isUnder18: calcResult.isUnder18,
      updatedAt: new Date().toISOString(),
    };

    await onSaveProfile(profile);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  const handleDelete = async () => {
    await onDeleteProfile();
    setCalcResult(null);
    setAge('');
    setHeightCm('');
    setWeightKg('');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-[#E7E2D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EFF5F0] text-[#395340] flex items-center justify-center">
            <User className="w-5 h-5 text-[#4E6E56]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Миний мэдээлэл ба тооцоолуур</h2>
            <p className="text-xs text-stone-500">
              Хувийн биеийн үзүүлэлт болон өдрийн илчлэг, шим тэжээлийн зөвлөмж
            </p>
          </div>
        </div>

        {currentProfile && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 self-start sm:self-auto hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Мэдээллээ устгах</span>
          </button>
        )}
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleCalculate} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider text-stone-500">
          Үндсэн мэдээлэл
        </h3>

        {/* Validation Errors Box */}
        {validationErrors.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-rose-800">
              <ShieldAlert className="w-4 h-4" />
              <span>Оруулсан утгыг шалгана уу:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Нас */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>Нас *</span>
            </label>
            <input
              type="number"
              min="10"
              max="110"
              required
              value={age}
              onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="25"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A7D63]/40 bg-stone-50/50"
            />
          </div>

          {/* Хүйс */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-stone-400" />
              <span>Хүйс *</span>
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A7D63]/40 bg-stone-50/50"
            >
              <option value="female">Эмэгтэй</option>
              <option value="male">Эрэгтэй</option>
            </select>
          </div>

          {/* Өндөр */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-stone-400" />
              <span>Өндөр (см) *</span>
            </label>
            <input
              type="number"
              min="100"
              max="250"
              required
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="170"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A7D63]/40 bg-stone-50/50"
            />
          </div>

          {/* Жин */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-stone-400" />
              <span>Жин (кг) *</span>
            </label>
            <input
              type="number"
              min="30"
              max="250"
              required
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="65"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#5A7D63]/40 bg-stone-50/50"
            />
          </div>
        </div>

        {/* Хөдөлгөөний идэвх */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-stone-400" />
            <span>Хөдөлгөөний идэвх *</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {(Object.entries(ACTIVITY_LEVEL_LABELS) as [ActivityLevel, { title: string; description: string }][]).map(
              ([key, val]) => (
                <div
                  key={key}
                  onClick={() => setActivityLevel(key)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    activityLevel === key
                      ? 'bg-[#EFF5F0] border-[#5A7D63] shadow-xs'
                      : 'bg-white border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-stone-800">{val.title}</span>
                    <input
                      type="radio"
                      name="activityLevel"
                      checked={activityLevel === key}
                      onChange={() => setActivityLevel(key)}
                      className="text-[#5A7D63] focus:ring-[#5A7D63]"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 leading-snug">{val.description}</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Required Prominent Button labeled exactly: “Мэдээллээ тооцоолох” */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#5A7D63] hover:bg-[#4E6E56] text-white text-sm sm:text-base font-extrabold tracking-wide shadow-md shadow-[#5A7D63]/25 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
          >
            <HeartPulse className="w-5 h-5" />
            <span>Мэдээллээ тооцоолох</span>
          </button>
        </div>
      </form>

      {/* Calculation Results Card */}
      {calcResult && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Таны өдрийн шим тэжээлийн тооцоо ба зөвлөмж
              </h3>
              <p className="text-xs text-stone-500">
                Таны биеийн өгөгдөлд үндэслэсэн хувийн тооцоолол
              </p>
            </div>
            {calcResult.isUnder18 ? (
              <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                Өсвөр насны өсөлт дэмжих горим
              </span>
            ) : (
              <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
                Насанд хүрэгчдийн стандарт
              </span>
            )}
          </div>

          {/* Under 18 safety message */}
          {calcResult.growthNotice && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-amber-950 mb-1">
                  Өсвөр насны бие махбодын өсөлтийн анхааруулга:
                </strong>
                {calcResult.growthNotice}
              </div>
            </div>
          )}

          {/* Macro guidance cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Calories */}
            <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-200/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-orange-800">Энергийн хэрэгцээ</span>
                <Flame className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-black text-orange-950">
                {calcResult.calorieRangeText}
              </div>
              <span className="text-[10px] text-stone-500 mt-1 block">
                {calcResult.bmr ? `Суурь зарцуулалт (BMR): ${calcResult.bmr} ккал` : 'Өсөлтийн баримжаа'}
              </span>
            </div>

            {/* Protein */}
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-800">Уургийн зөвлөмж</span>
                <Dumbbell className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-950">
                {calcResult.proteinGrams} грамм
              </div>
              <span className="text-[10px] text-stone-500 mt-1 block">
                Булчин, эд эсийн нөхөн төлжилтөд
              </span>
            </div>

            {/* Carbs */}
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-800">Нүүрс ус</span>
                <Wheat className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-950">
                {calcResult.carbsGrams} грамм
              </div>
              <span className="text-[10px] text-stone-500 mt-1 block">
                Тархи, эрч хүчний гол эх үүсвэр
              </span>
            </div>

            {/* Fat & Hydration */}
            <div className="bg-cyan-50/60 p-4 rounded-2xl border border-cyan-200/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-800">Усны хэрэглээ</span>
                <Droplet className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="text-2xl font-black text-cyan-950">
                {calcResult.waterMl} мл
              </div>
              <span className="text-[10px] text-stone-500 mt-1 block">
                Өөх тос: ~{calcResult.fatGrams}г
              </span>
            </div>
          </div>

          {/* Activity Impact Explanation */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 leading-relaxed">
            <strong className="block font-bold text-stone-900 mb-1">
              Хөдөлгөөний идэвхийн нөлөө:
            </strong>
            {calcResult.activityImpactExplanation}
          </div>

          {/* Medical Disclaimer */}
          <div className="p-3 bg-stone-100 rounded-xl text-[11px] text-stone-500 leading-normal flex items-start gap-2">
            <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <p>{calcResult.disclaimer}</p>
          </div>

          {/* Action to Save to Dashboard Profile */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-100">
            <p className="text-xs text-stone-500">
              Энэхүү тооцоог үндсэн самбартаа хадгалж өдөр бүрийнхээ зорилго болгон ашиглах уу?
            </p>
            <button
              onClick={handleSaveToProfile}
              className="px-6 py-2.5 rounded-xl bg-[#5A7D63] hover:bg-[#4E6E56] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Зорилгыг хадгалах</span>
            </button>
          </div>

          {saveSuccessNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Мэдээлэл болон зорилтот илчлэг амжилттай хадгалагдлаа!</span>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-stone-900">
              Хувийн мэдээллээ устгах уу?
            </h4>
            <p className="text-xs text-stone-500">
              Таны хадгалсан нас, өндөр, жин болон зорилтот үзүүлэлтүүд бүрэн арилах болно.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Болих
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                Тийм, устгах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

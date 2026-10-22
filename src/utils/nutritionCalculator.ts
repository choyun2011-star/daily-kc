import { ActivityLevel, DiaryEntry, NutritionalValues, UserProfile } from '../types/nutrition';

/**
 * Standard nutrient portion calculation formula:
 * Nutrient amount = (Nutrient per 100g * portionGrams) / 100
 */
export function calculatePortionNutrients(
  nutrientPer100g: number,
  portionGrams: number
): number {
  if (!nutrientPer100g || !portionGrams || portionGrams <= 0) return 0;
  return Math.round(((nutrientPer100g * portionGrams) / 100) * 10) / 10;
}

export function calculateEntryNutrients(
  valuesPer100g: NutritionalValues,
  portionGrams: number
): NutritionalValues {
  return {
    calories: Math.round((valuesPer100g.calories * portionGrams) / 100),
    protein: calculatePortionNutrients(valuesPer100g.protein, portionGrams),
    carbs: calculatePortionNutrients(valuesPer100g.carbs, portionGrams),
    fat: calculatePortionNutrients(valuesPer100g.fat, portionGrams),
    fiber: valuesPer100g.fiber
      ? calculatePortionNutrients(valuesPer100g.fiber, portionGrams)
      : undefined,
  };
}

export function sumDailyNutrients(entries: DiaryEntry[]): NutritionalValues {
  return entries.reduce(
    (acc, entry) => ({
      calories: Math.round(acc.calories + (entry.calories || 0)),
      protein: Math.round((acc.protein + (entry.protein || 0)) * 10) / 10,
      carbs: Math.round((acc.carbs + (entry.carbs || 0)) * 10) / 10,
      fat: Math.round((acc.fat + (entry.fat || 0)) * 10) / 10,
      fiber: Math.round(((acc.fiber || 0) + (entry.fiber || 0)) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export interface CalculationResult {
  isUnder18: boolean;
  bmr: number | null;
  tdee: number;
  calorieRangeText: string;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterMl: number;
  growthNotice?: string;
  activityImpactExplanation: string;
  disclaimer: string;
}

/**
 * Calculates personalized nutrition guidance with age-safety requirements
 */
export function calculatePersonalNutrition(params: {
  age: number;
  gender: 'male' | 'female';
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
}): CalculationResult {
  const { age, gender, heightCm, weightKg, activityLevel } = params;
  const isUnder18 = age < 18;
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;

  const activityExplanations: Record<ActivityLevel, string> = {
    sedentary:
      'Суугаа хэв маягтай үед бие махбод зөвхөн амин чухал эрхтнүүдийн үйл ажиллагаанд бага энерги зарцуулдаг тул илчлэгийн илүүдэл өөх болж хуримтлагдах эрсдэлтэй.',
    light:
      'Хөнгөн хөдөлгөөн нь цусны эргэлт болон бодисын солилцоог сэргээж, суурь зарцуулалтаас ойролцоогоор 300-400 ккал нэмэлт энерги шаарддаг.',
    moderate:
      'Дунд зэргийн дасгал нь булчингийн масс хадгалах, зүрх судас бэхжүүлэхэд тустай бөгөөд эрч хүчний зарцуулалтыг мэдэгдэхүйц нэмэгдүүлдэг.',
    active:
      'Идэвхтэй дасгал хөдөлгөөн нь өдөрт 500-800+ ккал нэмэлт зарцуулдаг тул булчин нөхөн төлжихөд уураг болон эрүүл нүүрс ус илүү шаардлагатай.',
    very_active:
      'Өндөр ачаалалтай дасгал хөдөлгөөн нь биеийн энергийн шаардлагыг бараг 2 дахин өсгөдөг тул хоолны давтамж, шим тэжээлийн чанарт онцгой анхаарна.',
  };

  const commonDisclaimer =
    'Анхааруулга: Эдгээр бүх тооцоолол нь зөвхөн баримжаа өгөх зөвлөмж бөгөөд эмнэлгийн оношилгоо, мэргэжлийн хоол зүйч, эмчийн зөвлөгөөг орлохгүй.';

  if (isUnder18) {
    // Under 18 safety considerations:
    // Focus on growth, balanced nutrition, no harsh adult formulas or calorie deficit.
    let baseCalories = gender === 'male' ? 2200 : 2000;
    if (activityLevel === 'moderate' || activityLevel === 'active') baseCalories += 250;
    if (activityLevel === 'very_active') baseCalories += 450;

    const protein = Math.round(weightKg * 1.2); // ~1.2g/kg for healthy growth
    const fatCalories = baseCalories * 0.28;
    const fat = Math.round(fatCalories / 9);
    const carbCalories = baseCalories - protein * 4 - fatCalories;
    const carbs = Math.round(carbCalories / 4);
    const water = Math.round(weightKg * 35);

    return {
      isUnder18: true,
      bmr: null,
      tdee: baseCalories,
      calorieRangeText: `${baseCalories - 150} - ${baseCalories + 200} ккал/өдөр`,
      proteinGrams: protein,
      carbsGrams: carbs,
      fatGrams: fat,
      waterMl: Math.max(1800, water),
      growthNotice:
        'Өсвөр насны болон 18-аас доош насны хүүхэд залуусын хувьд бие бялдрын өсөлт, ясны бэхжилт, тархины хөгжил нэн тэргүүнд тавигддаг. Хатуу хоолны дэглэм барих, илчлэгээ хэт хязгаарлах нь өсөлт зогсох, ядаргаанд хүргэх эрсдэлтэй. Тэнцвэртэй хооллолт, хангалттай уураг, сүү цагаан идээ, шинэ ногоо, жимс түлхүү хэрэглэхийг зөвлөж байна. Хэрэв жин, эрүүл мэндийн талаар асуулт байвал хүүхдийн эмчид хандаарай.',
      activityImpactExplanation: activityExplanations[activityLevel],
      disclaimer: commonDisclaimer,
    };
  }

  // Adult Mifflin-St Jeor formula
  const bmr =
    gender === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const tdee = Math.round(bmr * multiplier);

  // Balanced macronutrient targets:
  // Protein ~ 1.8g/kg or 22%
  const proteinGrams = Math.round(Math.max(weightKg * 1.6, (tdee * 0.22) / 4));
  // Fat ~ 28% of total calories
  const fatGrams = Math.round((tdee * 0.28) / 9);
  // Carbs ~ remaining (around 50%)
  const carbsGrams = Math.round((tdee - proteinGrams * 4 - fatGrams * 9) / 4);
  // Hydration ~ 35ml per kg
  const waterMl = Math.round((weightKg * 35) / 50) * 50;

  return {
    isUnder18: false,
    bmr: Math.round(bmr),
    tdee,
    calorieRangeText: `${tdee} ккал/өдөр`,
    proteinGrams,
    carbsGrams,
    fatGrams,
    waterMl,
    activityImpactExplanation: activityExplanations[activityLevel],
    disclaimer: commonDisclaimer,
  };
}

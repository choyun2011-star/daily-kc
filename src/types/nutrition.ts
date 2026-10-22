export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_CATEGORY_LABELS: Record<MealCategory, string> = {
  breakfast: 'Өглөөний цай',
  lunch: 'Өдрийн хоол',
  dinner: 'Оройн хоол',
  snack: 'Завсрын зууш',
};

export interface NutritionalValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface ServingOption {
  label: string;
  grams: number;
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number;
  servingOptions: ServingOption[];
  imageUrl: string;
  isVerified: boolean;
  referenceSource: string;
  description?: string;
  isCustom?: boolean;
}

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealCategory: MealCategory;
  foodId?: string;
  foodName: string;
  portionGrams: number;
  servingDescription: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  photoDataUrl?: string;
  isAiEstimated?: boolean;
  notes?: string;
  createdAt: string;
}

export interface WaterLog {
  id: string;
  date: string; // YYYY-MM-DD
  amountMl: number;
  createdAt: string;
}

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, { title: string; description: string }> = {
  sedentary: {
    title: 'Хөдөлгөөн багатай',
    description: 'Суугаа ажил эрхэлдэг, дасгал хөдөлгөөн бараг хийдэггүй',
  },
  light: {
    title: 'Хөнгөн идэвхтэй',
    description: 'Долоо хоногт 1-3 өдөр хөнгөн дасгал эсвэл алхалт хийдэг',
  },
  moderate: {
    title: 'Дунд зэргийн идэвхтэй',
    description: 'Долоо хоногт 3-5 өдөр дунд зэргийн ачаалалтай дасгал хийдэг',
  },
  active: {
    title: 'Идэвхтэй',
    description: 'Долоо хоногт 6-7 өдөр эрчимтэй дасгал хийдэг эсвэл хөдөлгөөнтэй ажилтай',
  },
  very_active: {
    title: 'Маш идэвхтэй',
    description: 'Мэргэжлийн тамирчин эсвэл хүнд хүчир биеийн хөдөлмөр эрхэлдэг',
  },
};

export interface UserProfile {
  id: 'user_profile';
  age: number;
  gender: 'male' | 'female';
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetWaterMl: number;
  isUnder18: boolean;
  notes?: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  grams: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: MealCategory;
  prepTimeMinutes: number;
  servings: number;
  caloriesPerServing: number;
  proteinPerServing: number;
  carbsPerServing: number;
  fatPerServing: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  imageUrl: string;
  description: string;
  mongolianFeature?: string;
}

export interface AiRecognitionResult {
  foodName: string;
  confidence: 'high' | 'medium' | 'low';
  estimatedGrams: number;
  servingDescription: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  uncertaintyNotice: string;
  alternativeSuggestions?: string[];
}

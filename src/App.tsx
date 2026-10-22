import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './views/DashboardView';
import { FoodDiaryView } from './views/FoodDiaryView';
import { FoodDatabaseView } from './views/FoodDatabaseView';
import { MealIdeasView } from './views/MealIdeasView';
import { NutritionEducationView } from './views/NutritionEducationView';
import { ProfileCalculatorView } from './views/ProfileCalculatorView';
import { SettingsView } from './views/SettingsView';
import { AddFoodModal } from './components/AddFoodModal';
import { PhotoAiModal } from './components/PhotoAiModal';
import { WaterTrackerModal } from './components/WaterTrackerModal';
import {
  DiaryEntry,
  FoodItem,
  MealCategory,
  UserProfile,
  WaterLog,
} from './types/nutrition';
import { INITIAL_FOOD_DATABASE } from './data/foodDatabase';
import {
  getDiaryEntriesByDate,
  saveDiaryEntry,
  deleteDiaryEntry,
  getWaterLogsByDate,
  saveWaterLog,
  deleteWaterLog,
  getUserProfile,
  saveUserProfile,
  deleteUserProfile,
  getCustomFoods,
  saveCustomFood,
} from './utils/db';
import { sumDailyNutrients } from './utils/nutritionCalculator';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // App data state
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [todayDiaryEntries, setTodayDiaryEntries] = useState<DiaryEntry[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isAddFoodOpen, setIsAddFoodOpen] = useState<boolean>(false);
  const [addFoodDefaultCategory, setAddFoodDefaultCategory] = useState<MealCategory>('lunch');
  const [isPhotoAiOpen, setIsPhotoAiOpen] = useState<boolean>(false);
  const [isWaterModalOpen, setIsWaterModalOpen] = useState<boolean>(false);

  // Combined food database (initial verified + custom foods)
  const fullFoodDatabase = useMemo(() => {
    return [...customFoods, ...INITIAL_FOOD_DATABASE];
  }, [customFoods]);

  // Load user profile & custom foods on startup
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [profile, cFoods] = await Promise.all([
          getUserProfile(),
          getCustomFoods(),
        ]);
        if (profile) setUserProfile(profile);
        if (cFoods) setCustomFoods(cFoods);
      } catch (err) {
        console.error('Error bootstrapping profile and foods:', err);
      }
    };
    bootstrap();
  }, []);

  // Load diary entries and water logs when selectedDate changes
  const loadDateData = useCallback(async (dateStr: string) => {
    setIsLoading(true);
    try {
      const [entries, waters] = await Promise.all([
        getDiaryEntriesByDate(dateStr),
        getWaterLogsByDate(dateStr),
      ]);
      setDiaryEntries(entries);
      setWaterLogs(waters);

      // Also ensure today's entries are updated for header widget
      if (dateStr === todayStr) {
        setTodayDiaryEntries(entries);
      } else {
        const todayEntries = await getDiaryEntriesByDate(todayStr);
        setTodayDiaryEntries(todayEntries);
      }
    } catch (err) {
      console.error('Failed to load data for date:', dateStr, err);
    } finally {
      setIsLoading(false);
    }
  }, [todayStr]);

  useEffect(() => {
    loadDateData(selectedDate);
  }, [selectedDate, loadDateData]);

  // Daily totals calculations
  const dailyTotals = useMemo(() => {
    return sumDailyNutrients(diaryEntries);
  }, [diaryEntries]);

  const todayTotals = useMemo(() => {
    return sumDailyNutrients(todayDiaryEntries);
  }, [todayDiaryEntries]);

  // --- Handlers ---

  const handleSaveDiaryEntry = async (entry: DiaryEntry) => {
    await saveDiaryEntry(entry);
    // Reload entries for the date
    await loadDateData(selectedDate);
  };

  const handleUpdateDiaryEntry = async (entry: DiaryEntry) => {
    await saveDiaryEntry(entry);
    await loadDateData(selectedDate);
  };

  const handleDeleteDiaryEntry = async (id: string) => {
    await deleteDiaryEntry(id);
    await loadDateData(selectedDate);
  };

  const handleAddWater = async (amountMl: number) => {
    const newLog: WaterLog = {
      id: `water_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: selectedDate,
      amountMl,
      createdAt: new Date().toISOString(),
    };
    await saveWaterLog(newLog);
    await loadDateData(selectedDate);
  };

  const handleDeleteWater = async (id: string) => {
    await deleteWaterLog(id);
    await loadDateData(selectedDate);
  };

  const handleUpdateTargetWater = async (ml: number) => {
    if (userProfile) {
      const updated: UserProfile = {
        ...userProfile,
        targetWaterMl: ml,
        updatedAt: new Date().toISOString(),
      };
      await saveUserProfile(updated);
      setUserProfile(updated);
    }
  };

  const handleSaveProfile = async (profile: UserProfile) => {
    await saveUserProfile(profile);
    setUserProfile(profile);
  };

  const handleDeleteProfile = async () => {
    await deleteUserProfile();
    setUserProfile(null);
  };

  const handleAddCustomFood = async (food: FoodItem) => {
    await saveCustomFood(food);
    const updatedCustoms = await getCustomFoods();
    setCustomFoods(updatedCustoms);
  };

  const handleOpenAddFood = (category: MealCategory = 'lunch') => {
    setAddFoodDefaultCategory(category);
    setIsAddFoodOpen(true);
  };

  const handleDataReset = async () => {
    setUserProfile(null);
    setCustomFoods([]);
    await loadDateData(selectedDate);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-800 flex flex-col antialiased">
      {/* Top Navigation & Branding Bar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenAddFood={() => handleOpenAddFood('lunch')}
        onOpenPhotoAi={() => setIsPhotoAiOpen(true)}
        onOpenWaterModal={() => setIsWaterModalOpen(true)}
        todayCalories={todayTotals.calories}
        targetCalories={userProfile?.targetCalories || 2000}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8 pb-20 lg:pb-12">
        {currentTab === 'dashboard' && (
          <DashboardView
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            diaryEntries={diaryEntries}
            waterLogs={waterLogs}
            userProfile={userProfile}
            dailyTotals={dailyTotals}
            onOpenAddFood={handleOpenAddFood}
            onOpenPhotoAi={() => setIsPhotoAiOpen(true)}
            onOpenWaterModal={() => setIsWaterModalOpen(true)}
            onDeleteEntry={handleDeleteDiaryEntry}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'food-diary' && (
          <FoodDiaryView
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            diaryEntries={diaryEntries}
            dailyTotals={dailyTotals}
            onOpenAddFood={handleOpenAddFood}
            onOpenPhotoAi={() => setIsPhotoAiOpen(true)}
            onDeleteEntry={handleDeleteDiaryEntry}
            onUpdateEntry={handleUpdateDiaryEntry}
          />
        )}

        {currentTab === 'food-database' && (
          <FoodDatabaseView
            foodDatabase={fullFoodDatabase}
            onAddCustomFood={handleAddCustomFood}
            onLogFoodToDiary={handleSaveDiaryEntry}
            selectedDate={selectedDate}
          />
        )}

        {currentTab === 'meal-ideas' && (
          <MealIdeasView
            onLogRecipeToDiary={handleSaveDiaryEntry}
            selectedDate={selectedDate}
          />
        )}

        {currentTab === 'education' && <NutritionEducationView />}

        {currentTab === 'profile' && (
          <ProfileCalculatorView
            currentProfile={userProfile}
            onSaveProfile={handleSaveProfile}
            onDeleteProfile={handleDeleteProfile}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView onDataReset={handleDataReset} />
        )}
      </main>

      {/* Global Modals */}
      <AddFoodModal
        isOpen={isAddFoodOpen}
        onClose={() => setIsAddFoodOpen(false)}
        onSaveEntry={handleSaveDiaryEntry}
        foodDatabase={fullFoodDatabase}
        defaultDate={selectedDate}
        defaultMealCategory={addFoodDefaultCategory}
        onOpenPhotoAi={() => setIsPhotoAiOpen(true)}
      />

      <PhotoAiModal
        isOpen={isPhotoAiOpen}
        onClose={() => setIsPhotoAiOpen(false)}
        onSaveEntry={handleSaveDiaryEntry}
        defaultDate={selectedDate}
      />

      <WaterTrackerModal
        isOpen={isWaterModalOpen}
        onClose={() => setIsWaterModalOpen(false)}
        dateStr={selectedDate}
        waterLogs={waterLogs}
        onAddWater={handleAddWater}
        onDeleteWater={handleDeleteWater}
        targetWaterMl={userProfile?.targetWaterMl || 2200}
        onUpdateTargetWater={handleUpdateTargetWater}
      />
    </div>
  );
}

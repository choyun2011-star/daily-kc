import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Heart,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { NUTRITION_TOPICS, NutritionTopic } from '../data/nutritionArticles';

export const NutritionEducationView: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<NutritionTopic>(NUTRITION_TOPICS[0]);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-[#E7E2D8] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EFF5F0] text-[#395340] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#4E6E56]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Шим тэжээлийн цогц мэдлэг</h2>
            <p className="text-xs text-stone-500">
              Эрүүл амьдрал, шим тэжээлийн тэнцвэрийг энгийнээр тайлбарласан гарын авлага
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar topic list & Content reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topic navigation pills (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 px-2 block mb-2">
            Сэдвийн жагсаалт:
          </span>
          <div className="space-y-2">
            {NUTRITION_TOPICS.map((topic) => {
              const isSelected = selectedTopic.id === topic.id;
              return (
                <div
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-white border-[#5A7D63] shadow-sm'
                      : 'bg-white/70 hover:bg-white border-stone-200/80 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={topic.imageUrl}
                      alt={topic.title}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#4E6E56] bg-[#EFF5F0] px-1.5 py-0.2 rounded-md">
                          {topic.badge}
                        </span>
                      </div>
                      <h4
                        className={`text-xs sm:text-sm font-bold truncate mt-0.5 ${
                          isSelected ? 'text-[#2D4533]' : 'text-stone-800'
                        }`}
                      >
                        {topic.title}
                      </h4>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected
                        ? 'text-[#5A7D63] translate-x-0.5'
                        : 'text-stone-300 group-hover:text-stone-500'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Topic Content Reader (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
          {/* Hero Banner */}
          <div className="relative h-56 sm:h-64 overflow-hidden bg-stone-900">
            <img
              src={selectedTopic.imageUrl}
              alt={selectedTopic.title}
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent"></div>
            <div className="absolute bottom-5 left-6 right-6 text-white">
              <span className="text-xs font-bold bg-[#5A7D63] text-white px-3 py-1 rounded-full mb-2 inline-block">
                {selectedTopic.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                {selectedTopic.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-200 mt-1 line-clamp-2 max-w-xl">
                {selectedTopic.summary}
              </p>
            </div>
          </div>

          {/* Reader Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Key Facts Highlights */}
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-stone-200 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500" />
                Гол баримтууд:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedTopic.keyFacts.map((fact, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                    <CheckCircle2 className="w-4 h-4 text-[#4E6E56] shrink-0 mt-0.5" />
                    <span>{fact}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-6">
              {selectedTopic.contentSections.map((sec, i) => (
                <div key={i} className="space-y-3">
                  <h4 className="text-base font-bold text-stone-900">{sec.heading}</h4>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {sec.text}
                  </p>

                  {sec.tips && sec.tips.length > 0 && (
                    <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-2">
                      <span className="text-xs font-bold text-emerald-900 block">
                        Практик хэрэглээний зөвлөгөө:
                      </span>
                      {sec.tips.map((tip, tIdx) => (
                        <p key={tIdx} className="text-xs text-emerald-800 leading-normal flex items-start gap-2">
                          <span className="text-[#5A7D63] font-bold">✔</span>
                          <span>{tip}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mongolian Context Box */}
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-amber-950 text-xs sm:text-sm leading-relaxed space-y-1.5">
              <strong className="block font-bold text-amber-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Монгол ахуй, цаг уурын онцлог ба шим тэжээл:
              </strong>
              <p className="text-stone-700 text-xs">{selectedTopic.mongolianContext}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

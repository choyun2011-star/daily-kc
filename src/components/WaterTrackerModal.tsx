import React, { useState } from 'react';
import {
  X,
  Droplet,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { WaterLog } from '../types/nutrition';

interface WaterTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  waterLogs: WaterLog[];
  onAddWater: (amountMl: number) => Promise<void>;
  onDeleteWater: (id: string) => Promise<void>;
  targetWaterMl: number;
  onUpdateTargetWater: (ml: number) => Promise<void>;
}

export const WaterTrackerModal: React.FC<WaterTrackerModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  waterLogs,
  onAddWater,
  onDeleteWater,
  targetWaterMl,
  onUpdateTargetWater,
}) => {
  const [customMl, setCustomMl] = useState<number>(250);
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [newTargetMl, setNewTargetMl] = useState<number>(targetWaterMl);

  if (!isOpen) return null;

  const totalConsumedMl = waterLogs.reduce((acc, curr) => acc + curr.amountMl, 0);
  const percentage = Math.min(100, Math.round((totalConsumedMl / (targetWaterMl || 2000)) * 100));

  const quickAmounts = [
    { label: 'Аяга ус', ml: 200, icon: '☕' },
    { label: 'Стакан ус', ml: 250, icon: '🥛' },
    { label: 'Жижиг лонх', ml: 500, icon: '🍶' },
    { label: 'Том лонх', ml: 750, icon: '🚰' },
  ];

  const handleCustomAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customMl > 0) {
      await onAddWater(customMl);
    }
  };

  const handleSaveTarget = async () => {
    if (newTargetMl >= 500 && newTargetMl <= 5000) {
      await onUpdateTargetWater(newTargetMl);
      setIsEditingTarget(false);
    } else {
      alert('Зорилтот усны хэмжээг 500 - 5000 мл хооронд оруулна уу.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-[#FAF7F2] w-full max-w-lg rounded-3xl shadow-2xl border border-[#E7E2D8] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#EAE5DC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Droplet className="w-5 h-5 fill-cyan-500 text-cyan-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Усны хэрэглээ хянах</h3>
              <p className="text-xs text-stone-500">{dateStr} өдрийн бүртгэл</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-[#F2ECE4] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Hydration Progress Card */}
          <div className="bg-gradient-to-br from-cyan-50 via-white to-sky-50 p-5 rounded-2xl border border-cyan-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-semibold text-cyan-800 block">Өдрийн нийт уусан:</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-cyan-950">{totalConsumedMl}</span>
                  <span className="text-xs font-semibold text-cyan-700">/ {targetWaterMl} мл</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-cyan-700">{percentage}%</span>
                <span className="text-[10px] text-stone-500 block">биелэлт</span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-cyan-100/70 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-cyan-500 to-sky-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Target customization */}
            <div className="mt-3 pt-3 border-t border-cyan-100 flex items-center justify-between text-xs text-stone-600">
              {!isEditingTarget ? (
                <>
                  <span>
                    Өдрийн зорилго: <strong className="text-stone-800">{targetWaterMl} мл</strong>
                  </span>
                  <button
                    onClick={() => {
                      setNewTargetMl(targetWaterMl);
                      setIsEditingTarget(true);
                    }}
                    className="text-cyan-700 hover:underline font-semibold text-xs"
                  >
                    Зорилго өөрчлөх
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="number"
                    step="50"
                    min="500"
                    max="5000"
                    value={newTargetMl}
                    onChange={(e) => setNewTargetMl(Number(e.target.value))}
                    className="px-2.5 py-1 text-xs border border-cyan-300 rounded-lg w-28 bg-white"
                  />
                  <button
                    onClick={handleSaveTarget}
                    className="px-3 py-1 bg-cyan-700 text-white rounded-lg text-xs font-semibold hover:bg-cyan-800"
                  >
                    Хадгалах
                  </button>
                  <button
                    onClick={() => setIsEditingTarget(false)}
                    className="text-xs text-stone-500 hover:text-stone-800"
                  >
                    Болих
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick-add buttons */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              Түргэн нэмэх:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickAmounts.map((q) => (
                <button
                  key={q.ml}
                  onClick={() => onAddWater(q.ml)}
                  className="p-3 rounded-2xl bg-white border border-stone-200 hover:border-cyan-400 hover:bg-cyan-50/50 transition-all text-center group cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="text-xl block mb-1">{q.icon}</span>
                  <span className="block text-xs font-bold text-stone-800 group-hover:text-cyan-900">
                    +{q.ml} мл
                  </span>
                  <span className="block text-[10px] text-stone-500">{q.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount form */}
          <form onSubmit={handleCustomAdd} className="bg-white p-4 rounded-2xl border border-stone-200">
            <label className="block text-xs font-bold text-stone-700 mb-2">
              Өөр дурын хэмжээгээр бүртгэх:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="10"
                min="10"
                max="2500"
                value={customMl}
                onChange={(e) => setCustomMl(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                placeholder="Мл оруулах..."
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Нэмэх</span>
              </button>
            </div>
          </form>

          {/* Today's log history with Undo/Delete */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-stone-700">Өнөөдрийн бүртгэлийн түүх:</h4>
              <span className="text-[11px] text-stone-500">{waterLogs.length} удаа</span>
            </div>

            {waterLogs.length === 0 ? (
              <div className="p-5 text-center bg-white rounded-2xl border border-stone-200 text-xs text-stone-500">
                Та өнөөдөр хараахан усны бүртгэл хийгээгүй байна. Дээрх товчлуурууд дээр дарж бүртгээрэй.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {waterLogs.map((log) => {
                  const time = new Date(log.createdAt).toLocaleTimeString('mn-MN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-stone-200 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-cyan-600 fill-cyan-400" />
                        <span className="font-bold text-stone-800">+{log.amountMl} мл</span>
                        <span className="text-[11px] text-stone-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {time}
                        </span>
                      </div>
                      <button
                        onClick={() => onDeleteWater(log.id)}
                        title="Устгах / Буцаах"
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Gentle Hydration Advisory */}
          <div className="p-3 bg-stone-100 rounded-xl text-[11px] text-stone-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            <p>
              Усны хэрэгцээ нь хувь хүний биеийн жин, өдрийн идэвх, орчны температурт тохирсон ерөнхий баримжаа юм. Нэг дор хэт их ус хүчээр уухаас зайлсхийж, өдрийн турш тогтмол багаар шимж уухыг зөвлөдөг.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

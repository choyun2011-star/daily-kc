import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  Trash2,
  ShieldCheck,
  Database,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
} from 'lucide-react';
import { exportAllData, importAllData, clearAllUserData } from '../utils/db';

interface SettingsViewProps {
  onDataReset: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onDataReset }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const json = await exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `daily-kcal-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setSuccessMessage('Мэдээллийн нөөц хуулбар амжилттай татагдлаа.');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      console.error(err);
      alert('Экспорт хийхэд алдаа гарлаа.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importAllData(text);
      setImportStatus('Нөөц хуулбар амжилттай сэргээгдлээ!');
      await onDataReset();
      setTimeout(() => setImportStatus(null), 3500);
    } catch (err: any) {
      console.error(err);
      alert('Файл уншиж сэргээхэд алдаа гарлаа. Зөв JSON нөөц файл эсэхийг шалгана уу.');
    }
  };

  const handleClearAll = async () => {
    await clearAllUserData();
    await onDataReset();
    setShowClearConfirm(false);
    setSuccessMessage('Бүх өгөгдөл амжилттай цэвэрлэгдлээ.');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-[#E7E2D8] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EFF5F0] text-[#395340] flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#4E6E56]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Тохиргоо ба өгөгдлийн нууцлал</h2>
            <p className="text-xs text-stone-500">
              Мэдээллээ удирдах, нөөц хуулбар татах болон аюулгүй байдал
            </p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-3">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-[#5A7D63]" />
          <span>Хэрэглэгчийн нууцлал ба хадгалалт</span>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          Daily Kcal аппликэйшн нь таны оруулсан бүх хоолны тэмдэглэл, усны хэрэглээ, зургийн өгөгдлийг таны өөрийн хөтчийн (browser) найдвартай <strong>IndexedDB</strong> санд хадгалдаг. Таны хувийн эрүүл мэндийн мэдээлэл хөндлөнгийн сүлжээнд зарлагдахгүй бөгөөд зөвхөн таны төхөөрөмж дээр хадгалагдана.
        </p>
      </div>

      {/* Backup and Restore */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <Database className="w-5 h-5 text-[#5A7D63]" />
          <span>Өгөгдлийг нөөцлөх ба сэргээх (JSON)</span>
        </div>
        <p className="text-xs text-stone-500">
          Та өөрийн бүх тэмдэглэл болон хувийн тохиргоог нөөцлөн татаж авах эсвэл өөр төхөөрөмж дээр шилжүүлэн сэргээх боломжтой.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-stone-600" />
            <span>{isExporting ? 'Нөөцөлж байна...' : 'Нөөц хуулбар татах (JSON)'}</span>
          </button>

          {/* Import file input */}
          <label className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs">
            <Upload className="w-4 h-4 text-stone-600" />
            <span>Нөөц хуулбараас сэргээх</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>

        {importStatus && (
          <p className="text-xs text-emerald-700 font-semibold pt-1">{importStatus}</p>
        )}
      </div>

      {/* Dangerous Actions / Clear Data */}
      <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-200/80 space-y-3">
        <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>Өгөгдөл цэвэрлэх</span>
        </div>
        <p className="text-xs text-stone-600">
          Хэрэв та өөрийн хөтөч дээрх бүх хоолны тэмдэглэл, усны түүх болон хувийн мэдээллээ бүрмөсөн устгахыг хүсвэл доорх товчийг дарна уу. Энэ үйлдлийг буцаах боломжгүй.
        </p>

        <div className="pt-2">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>Бүх өгөгдлийг устгах</span>
          </button>
        </div>
      </div>

      {/* App Information */}
      <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-stone-200 text-xs text-stone-600 space-y-2">
        <div className="flex items-center justify-between">
          <strong className="text-stone-800 font-bold">Daily Kcal — Монгол хувилбар</strong>
          <span className="text-stone-400">Хувилбар 1.0</span>
        </div>
        <p className="text-stone-500 leading-relaxed">
          Монгол хэрэглэгчдэд зориулсан шим тэжээлийн цогц бүртгэл ба тооцоолуур систем. Монгол үндэсний хоолны онцлог болон олон улсын шим тэжээлийн стандартад нийцүүлэн хөгжүүлэв.
        </p>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white p-6 rounded-3xl max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-stone-900">
              Бүх өгөгдлийг бүрмөсөн устгахдаа итгэлтэй байна уу?
            </h4>
            <p className="text-xs text-stone-500">
              Таны бүртгэсэн хоол, ус, зураг болон хувийн мэдээлэл бүрэн арилна.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Болих
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                Тийм, бүгдийг устга
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

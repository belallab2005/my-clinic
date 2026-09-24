import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  Users,
  FileText
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

export const DataManagementView: React.FC = () => {
  const { 
    patients, 
    cases, 
    medicalHistories, 
    appointments, 
    allUsers, 
    resetToDefaults, 
    language,
    currentUser,
    switchUser
  } = useClinic();

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Calculate local storage size
  const rawStorage = localStorage.getItem('zondenta_dental_clinic_v1') || '';
  const storageSizeKb = Math.round((new Blob([rawStorage]).size) / 1024);

  const handleExportFullBackup = () => {
    try {
      const dataStr = localStorage.getItem('zondenta_dental_clinic_v1');
      if (!dataStr) {
        setMessage({ text: 'No local data found to backup.', type: 'error' });
        return;
      }
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spu_dental_clinics_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      setMessage({ 
        text: language === 'ar' ? 'تم تنزيل النسخة الاحتياطية لعيادات SPU بنجاح!' : 'SPU Clinics backup downloaded successfully!', 
        type: 'success' 
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({ text: 'Failed to export backup', type: 'error' });
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.patients && parsed.cases) {
          localStorage.setItem('zondenta_dental_clinic_v1', content);
          window.location.reload();
        } else {
          setMessage({ 
            text: language === 'ar' ? 'الملف غير صالح كنسخة احتياطية لعيادات SPU-DENTAL-CLINICS.' : 'Invalid backup JSON file schema for SPU-DENTAL-CLINICS.', 
            type: 'error' 
          });
        }
      } catch (err) {
        setMessage({ text: 'Error reading JSON file.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = () => {
    if (window.confirm(language === 'ar' ? 'هل تريد استعادة البيانات التجريبية الافتراضية؟' : 'Reset all data back to factory demo state?')) {
      resetToDefaults();
      setMessage({ 
        text: language === 'ar' ? 'تمت استعادة البيانات الافتراضية بنجاح!' : 'Factory demo data restored!', 
        type: 'success' 
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          <span>{language === 'ar' ? 'البيانات المحلية والتشغيل الذاتي (100% Local)' : 'Local Storage & Independent Hosting'}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {language === 'ar' 
            ? 'نظام مستقل بالكامل: كافة السجلات، التنبيهات، والأشعة مخزنة محلياً بمتصفحك دون الحاجة لسيرفرات سحابية خارجية' 
            : 'Zero cloud dependencies: Complete local browser persistence with JSON backup and instant role switching'}
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs font-semibold mb-6 flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Local Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{language === 'ar' ? 'حجم قاعدة البيانات المحلية' : 'Local Storage Usage'}</span>
            <HardDrive className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">{storageSizeKb} KB</div>
          <div className="text-[11px] text-emerald-600 mt-1">
            {language === 'ar' ? 'تخزين دائم ومحمي' : 'Fast browser offline storage'}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{language === 'ar' ? 'إجمالي السجلات' : 'Stored Entities'}</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">
            {patients.length + cases.length + medicalHistories.length + appointments.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {patients.length} {language === 'ar' ? 'مرضى' : 'patients'} · {cases.length} {language === 'ar' ? 'حالات' : 'cases'}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{language === 'ar' ? 'الأدوار النشطة محلياً' : 'Local Active Accounts'}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">3 Accounts</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Super Admin, Admin, Normal User
          </div>
        </div>
      </div>

      {/* Role Switcher Cards (Demonstrates instant role behavior) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8">
        <h2 className="text-sm font-bold text-slate-900 mb-1">
          {language === 'ar' ? 'الحسابات الثلاثة المجهزة لاختبار الصلاحيات' : 'The 3 Local Pre-configured Accounts'}
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          {language === 'ar' ? 'اضغط على أي حساب للتبديل إليه فوراً ومعاينة واجهته وصلاحياته' : 'Click any card to immediately switch role and verify permission gating'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allUsers.map((user) => {
            const isActive = user.id === currentUser.id;

            return (
              <div 
                key={user.id}
                onClick={() => switchUser(user.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isActive 
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-200 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg ${user.avatarBg} text-white flex items-center justify-center font-bold text-sm`}>
                    {user.name.charAt(0)}
                  </div>
                  {isActive && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">
                      {language === 'ar' ? 'النشط حالياً' : 'Active'}
                    </span>
                  )}
                </div>

                <div className="font-bold text-sm text-slate-900">
                  {language === 'ar' ? user.nameAr || user.name : user.name}
                </div>
                <div className="text-xs font-semibold text-blue-600 mt-0.5 capitalize">
                  {user.role === 'super_admin' ? 'Super Admin (Owner)' : user.role === 'supervisor' ? 'Admin (Supervisor)' : 'Normal User (Student)'}
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  {user.email}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backup & Restore Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">
          {language === 'ar' ? 'النسخ الاحتياطي واستعادة البيانات (JSON)' : 'Local JSON Backup & Restore'}
        </h2>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleExportFullBackup}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'ar' ? 'تحميل نسخة احتياطية كاملة (JSON)' : 'Download Full JSON Backup'}</span>
          </button>

          <label className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-2xs">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>{language === 'ar' ? 'استيراد نسخة احتياطية (ملف JSON)' : 'Import JSON Backup'}</span>
            <input 
              type="file" 
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={handleFactoryReset}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ml-auto rtl:ml-0 rtl:mr-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{language === 'ar' ? 'إعادة ضبط للبيانات التجريبية' : 'Reset to Demo Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

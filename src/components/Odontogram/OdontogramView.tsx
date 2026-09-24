import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Share2, 
  Lock, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ImageIcon, 
  X, 
  AlertCircle,
  ExternalLink,
  Award,
  Sparkles
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { ADULT_TEETH, TOOTH_CONDITIONS_CONFIG } from '../../utils/fdiTeeth';
import { CaseTreatment, ToothCondition, ProcedureType } from '../../types';

interface OdontogramViewProps {
  onOpenNewCase: () => void;
  onOpenGradeModal?: (caseItem: CaseTreatment) => void;
}

export const OdontogramView: React.FC<OdontogramViewProps> = ({
  onOpenNewCase,
  onOpenGradeModal
}) => {
  const { cases, patients, currentUser, language, updateCase, medicalHistories } = useClinic();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || 'all');
  const [selectedToothFdi, setSelectedToothFdi] = useState<number>(16);
  const [activeTab, setActiveTab] = useState<'chart' | 'cases'>('chart');
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Filter cases by selected patient or all
  const displayedCases = cases.filter(c => {
    if (selectedPatientId !== 'all' && c.patientId !== selectedPatientId) return false;
    return true;
  });

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const selectedMedHistory = selectedPatient ? medicalHistories.find(m => m.patientId === selectedPatient.id) : null;

  // Get status condition for a tooth
  const getToothCondition = (fdi: number): ToothCondition => {
    const caseForTooth = displayedCases.find(c => c.toothNumber === fdi);
    if (caseForTooth) return caseForTooth.condition;
    return 'healthy';
  };

  const getToothCases = (fdi: number) => {
    return displayedCases.filter(c => c.toothNumber === fdi);
  };

  const handleSocialShare = (caseItem: CaseTreatment) => {
    if (!caseItem.socialShareAllowed) {
      setShareToast(language === 'ar' 
        ? 'تم حظر النشر تلقائياً: المريض لم يوافق على إقرار النشر ومشاركة الصور.' 
        : 'Sharing locked: Patient opted out of academic/social publication.');
      setTimeout(() => setShareToast(null), 3500);
      return;
    }

    // Prepare share text
    const text = `Case ${caseItem.caseNumber} | Tooth #${caseItem.toothNumber} | Procedure: ${caseItem.procedure} | University Dental Clinic Academic Record.`;
    navigator.clipboard.writeText(text);
    setShareToast(language === 'ar' 
      ? 'تم نسخ ملخص الحالة والصور لنشرها أكاديمياً (مصرح رسمياً)!' 
      : 'Case summary copied! Cleared for academic publication.');
    setTimeout(() => setShareToast(null), 3500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-8">
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <AlertCircle className="w-4 h-4 text-blue-400" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>{language === 'ar' ? 'مخطط الأسنان والحالات السريرية' : 'Odontogram & Clinical Cases'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ar' 
              ? 'الترقيم الدولي FDI (11 - 48)، تشخيص الأسنان، وصور الأشعة قبل وبعد العلاج' 
              : 'Interactive 2-digit FDI dental chart, clinical diagnosis, and radiographic records'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Patient Selector */}
          <div className="flex items-center gap-2 text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <span className="text-slate-400 font-medium">{language === 'ar' ? 'المريض:' : 'Patient:'}</span>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="font-bold text-slate-800 bg-transparent focus:outline-none"
            >
              <option value="all">{language === 'ar' ? 'جميع المرضى' : 'All Patients'}</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {language === 'ar' ? p.fullNameAr || p.fullName : p.fullName} ({p.patientCode})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenNewCase}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'تسجيل حالة جديدة' : 'New Case'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Odontogram Canvas + Tooth Details */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Odontogram Interactive Arch (2 Cols) */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {language === 'ar' ? 'مخطط الأسنان الدائم (FDI 2-Digit Notation)' : 'Adult Permanent Dentition (FDI)'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'ar' ? 'انقر على أي سن لعرض الحالات والتشخيص والأشعة' : 'Select any tooth to inspect history and radiographic files'}
              </p>
            </div>

            {/* Condition Color Legends */}
            <div className="flex flex-wrap gap-2 text-[10px]">
              {Object.entries(TOOTH_CONDITIONS_CONFIG).slice(0, 5).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: val.color }} />
                  <span className="text-slate-600 font-medium">{language === 'ar' ? val.labelAr : val.labelEn}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upper Arch (Maxillary 18 -> 28) */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-widest mb-3">
              {language === 'ar' ? 'الفك العلوي (Maxillary)' : 'Upper Maxillary Arch'}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {ADULT_TEETH.filter(t => t.arch === 'maxillary').map(tooth => {
                const isSelected = selectedToothFdi === tooth.fdi;
                const condition = getToothCondition(tooth.fdi);
                const condConfig = TOOTH_CONDITIONS_CONFIG[condition];
                const hasCases = getToothCases(tooth.fdi).length > 0;

                return (
                  <button
                    key={tooth.fdi}
                    type="button"
                    onClick={() => setSelectedToothFdi(tooth.fdi)}
                    className={`w-11 h-20 rounded-2xl flex flex-col items-center justify-between p-1.5 transition-all border ${
                      isSelected 
                        ? 'ring-2 ring-blue-600 shadow-md scale-105 bg-blue-50/60 border-blue-600' 
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-[11px] font-mono font-bold text-slate-900">{tooth.fdi}</span>

                    {/* Tooth anatomic outline representation */}
                    <div 
                      className="w-6 h-9 rounded-t-lg border-2 flex items-center justify-center transition-all"
                      style={{ 
                        borderColor: condConfig.border, 
                        backgroundColor: condition === 'healthy' ? '#F8FAFC' : condConfig.color,
                        opacity: condition === 'healthy' ? 0.8 : 0.9
                      }}
                    >
                      {hasCases && condition !== 'healthy' && (
                        <div className="w-2 h-2 rounded-full bg-white shadow-xs" />
                      )}
                    </div>

                    <span className="text-[9px] text-slate-400 font-medium">{tooth.type.slice(0, 3)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Central Midline Hairline */}
          <div className="relative flex items-center justify-center my-2">
            <div className="w-full border-t border-dashed border-slate-200" />
            <span className="absolute bg-white px-3 text-[10px] font-mono font-bold text-slate-400 tracking-wider">
              MIDLINE / الإطباق
            </span>
          </div>

          {/* Lower Arch (Mandibular 48 -> 38) */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-widest mb-3">
              {language === 'ar' ? 'الفك السفلي (Mandibular)' : 'Lower Mandibular Arch'}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {ADULT_TEETH.filter(t => t.arch === 'mandibular').map(tooth => {
                const isSelected = selectedToothFdi === tooth.fdi;
                const condition = getToothCondition(tooth.fdi);
                const condConfig = TOOTH_CONDITIONS_CONFIG[condition];
                const hasCases = getToothCases(tooth.fdi).length > 0;

                return (
                  <button
                    key={tooth.fdi}
                    type="button"
                    onClick={() => setSelectedToothFdi(tooth.fdi)}
                    className={`w-11 h-20 rounded-2xl flex flex-col items-center justify-between p-1.5 transition-all border ${
                      isSelected 
                        ? 'ring-2 ring-blue-600 shadow-md scale-105 bg-blue-50/60 border-blue-600' 
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-[9px] text-slate-400 font-medium">{tooth.type.slice(0, 3)}</span>

                    <div 
                      className="w-6 h-9 rounded-b-lg border-2 flex items-center justify-center transition-all"
                      style={{ 
                        borderColor: condConfig.border, 
                        backgroundColor: condition === 'healthy' ? '#F8FAFC' : condConfig.color,
                        opacity: condition === 'healthy' ? 0.8 : 0.9
                      }}
                    >
                      {hasCases && condition !== 'healthy' && (
                        <div className="w-2 h-2 rounded-full bg-white shadow-xs" />
                      )}
                    </div>

                    <span className="text-[11px] font-mono font-bold text-slate-900">{tooth.fdi}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Tooth Info & Case Inspector (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  FDI #{selectedToothFdi}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1">
                  {ADULT_TEETH.find(t => t.fdi === selectedToothFdi)?.nameEn}
                </h3>
                <div className="text-xs text-slate-500">
                  {ADULT_TEETH.find(t => t.fdi === selectedToothFdi)?.nameAr}
                </div>
              </div>
            </div>

            {/* Cases on this tooth */}
            <div className="mt-4 space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {language === 'ar' ? 'الحالات المسجلة لهذا السن:' : 'Recorded Cases on this tooth:'}
              </div>

              {getToothCases(selectedToothFdi).length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  {language === 'ar' ? 'لا توجد إجراءات مسجلة على هذا السن حالياً.' : 'No active procedures logged for this tooth.'}
                </div>
              ) : (
                getToothCases(selectedToothFdi).map(c => {
                  const pat = patients.find(p => p.id === c.patientId);

                  return (
                    <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-600">{c.caseNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      <div className="font-bold text-slate-900">{c.procedure}</div>
                      <div className="text-[11px] text-slate-600">{c.notes}</div>

                      {/* X-Ray Photos if any */}
                      {c.xrays.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                            {language === 'ar' ? 'صور الأشعة الرقمية:' : 'Radiographs:'}
                          </span>
                          <div className="flex gap-2">
                            {c.xrays.map(xr => (
                              <div key={xr.id} className="w-16 h-16 rounded-lg bg-black overflow-hidden border border-slate-300 relative group cursor-pointer">
                                <img src={xr.url} alt={xr.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[9px] text-white p-1 text-center font-bold">
                                  {xr.title}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Evaluation Score Badge if graded */}
                      {c.evaluation && (
                        <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
                          <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{language === 'ar' ? 'تقييم المشرف:' : 'Score:'} {c.evaluation.totalScore}/25 ({c.evaluation.percentage}%)</span>
                          </div>
                          <span className="text-[10px] text-emerald-700 font-semibold">{c.evaluation.supervisorName}</span>
                        </div>
                      )}

                      {/* Social Media Share / Lock Action (PDF Section 4.7) */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {pat?.fullName}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleSocialShare(c)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            c.socialShareAllowed 
                              ? 'bg-purple-100 hover:bg-purple-200 text-purple-700' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                          title={c.socialShareAllowed ? 'Share case' : 'Locked: Patient opted out of social media publishing'}
                        >
                          {c.socialShareAllowed ? (
                            <>
                              <Share2 className="w-3 h-3 text-purple-600" />
                              <span>{language === 'ar' ? 'مشاركة الحالة' : 'Share Case'}</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>{language === 'ar' ? 'النشر محظور' : 'Share Locked'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={onOpenNewCase}
            className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'تسجيل إجراء علاجي لهذا السن' : `Log Procedure for #${selectedToothFdi}`}</span>
          </button>
        </div>
      </div>

      {/* All Clinical Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            {language === 'ar' ? 'سجل كافة الحالات السريرية' : 'All Clinical Cases Registry'}
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {displayedCases.length} {language === 'ar' ? 'حالة' : 'records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3 font-mono">{language === 'ar' ? 'رقم الحالة' : 'Case #'}</th>
                <th className="p-3">{language === 'ar' ? 'المريض' : 'Patient'}</th>
                <th className="p-3">{language === 'ar' ? 'السن FDI' : 'Tooth'}</th>
                <th className="p-3">{language === 'ar' ? 'الإجراء السريري' : 'Procedure'}</th>
                <th className="p-3">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="p-3">{language === 'ar' ? 'التقييم' : 'Grading'}</th>
                <th className="p-3">{language === 'ar' ? 'موافقة النشر' : 'Publish Consent'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {displayedCases.map((c) => {
                const patient = patients.find(p => p.id === c.patientId);

                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-600">{c.caseNumber}</td>
                    <td className="p-3 font-semibold text-slate-900">
                      {language === 'ar' ? patient?.fullNameAr || patient?.fullName : patient?.fullName}
                    </td>
                    <td className="p-3 font-mono font-bold">#{c.toothNumber}</td>
                    <td className="p-3">{c.procedure}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {c.evaluation ? (
                        <span className="font-bold text-emerald-600 font-mono">
                          {c.evaluation.totalScore}/25 ({c.evaluation.percentage}%)
                        </span>
                      ) : (
                        <span className="text-slate-400">{language === 'ar' ? 'بانتظار التقييم' : 'Pending grading'}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleSocialShare(c)}
                        className={`px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 ${
                          c.socialShareAllowed ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {c.socialShareAllowed ? <Share2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        <span>{c.socialShareAllowed ? (language === 'ar' ? 'مسموح' : 'Allowed') : (language === 'ar' ? 'محظور' : 'Locked')}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

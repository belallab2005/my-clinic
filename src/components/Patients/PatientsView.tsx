import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Stethoscope, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MapPin, 
  FileText,
  Filter
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { Patient } from '../../types';

interface PatientsViewProps {
  onOpenCheckup: (patientId: string) => void;
  onOpenNewPatient: () => void;
  onOpenNewAppointmentForPatient?: (patientId: string) => void;
  searchQuery?: string;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  onOpenCheckup,
  onOpenNewPatient,
  searchQuery = ''
}) => {
  const { patients, medicalHistories, cases, language, currentUser } = useClinic();
  const [internalFilter, setInternalFilter] = useState<'all' | 'alert' | 'pending_checkup'>('all');

  const filteredPatients = patients.filter(patient => {
    // Search query
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      patient.fullName.toLowerCase().includes(q) ||
      patient.fullNameAr?.toLowerCase().includes(q) ||
      patient.patientCode.toLowerCase().includes(q) ||
      patient.nationalId.includes(q) ||
      patient.phone.includes(q);

    if (!matchesSearch) return false;

    const medHistory = medicalHistories.find(m => m.patientId === patient.id);

    if (internalFilter === 'alert') {
      return (medHistory?.clinicalAlerts.length ?? 0) > 0;
    }
    if (internalFilter === 'pending_checkup') {
      return !medHistory || medHistory.status === 'pending_approval' || medHistory.status === 'draft';
    }

    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>{language === 'ar' ? 'سجل مرضى العيادات التعليمية' : 'Dental Patients Directory'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ar' 
              ? 'إدارة الملفات الطبية، الفحص الإلزامي، ومتابعة الحالات السريرية' 
              : 'Patient digital files, mandatory medical checkup gates, and treatment tracking'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented filter */}
          <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl text-xs font-medium shadow-2xs">
            <button
              onClick={() => setInternalFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${internalFilter === 'all' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {language === 'ar' ? 'الكل' : 'All Patients'}
            </button>
            <button
              onClick={() => setInternalFilter('alert')}
              className={`px-3 py-1.5 rounded-lg transition-all ${internalFilter === 'alert' ? 'bg-red-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {language === 'ar' ? 'تنبيهات سريرية حرجة' : 'Critical Alerts'}
            </button>
            <button
              onClick={() => setInternalFilter('pending_checkup')}
              className={`px-3 py-1.5 rounded-lg transition-all ${internalFilter === 'pending_checkup' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {language === 'ar' ? 'بانتظار الاعتماد' : 'Needs Approval'}
            </button>
          </div>

          <button
            onClick={onOpenNewPatient}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'تسجيل مريض جديد' : 'New Patient'}</span>
          </button>
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPatients.map((patient) => {
          const medHistory = medicalHistories.find(m => m.patientId === patient.id);
          const patientCases = cases.filter(c => c.patientId === patient.id);
          const hasAlerts = (medHistory?.clinicalAlerts.length ?? 0) > 0;

          return (
            <div 
              key={patient.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-base shadow-xs">
                      {patient.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{language === 'ar' ? patient.fullNameAr || patient.fullName : patient.fullName}</span>
                        <span className="text-[11px] font-mono text-slate-400 font-normal">{patient.patientCode}</span>
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{patient.gender === 'male' ? (language === 'ar' ? 'ذكر' : 'Male') : (language === 'ar' ? 'أنثى' : 'Female')}</span>
                        <span>·</span>
                        <span>{patient.age} {language === 'ar' ? 'سنة' : 'y/o'}</span>
                        <span>·</span>
                        <span className="font-mono">{patient.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Medical History Approval Badge */}
                  <div>
                    {medHistory ? (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        medHistory.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : medHistory.status === 'pending_approval'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        {medHistory.status === 'approved' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{language === 'ar' ? 'فحص معتمد' : 'Checkup Approved'}</span>
                          </>
                        ) : medHistory.status === 'pending_approval' ? (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>{language === 'ar' ? 'بانتظار المشرف' : 'Pending Approval'}</span>
                          </>
                        ) : (
                          <span>{language === 'ar' ? 'مسودة' : 'Draft'}</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        {language === 'ar' ? 'بدون فحص طبي' : 'No Checkup'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Clinical Alerts Strip if any */}
                {hasAlerts && (
                  <div className="mb-3 p-2.5 bg-red-50/70 border border-red-200 rounded-xl space-y-1">
                    <div className="text-[11px] font-bold text-red-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      <span>{language === 'ar' ? 'تنبيهات سريرية نشطة:' : 'Active Clinical Risk Alerts:'}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {medHistory?.clinicalAlerts.map((alert, idx) => (
                        <span key={idx} className="text-[10px] bg-white text-red-700 px-2 py-0.5 rounded border border-red-200 font-semibold">
                          {language === 'ar' ? alert.titleAr : alert.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patient Summary Info */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-slate-100 text-slate-600">
                  <div>
                    <span className="text-slate-400 text-[11px] block">{language === 'ar' ? 'الحالات المسجلة:' : 'Clinical Cases:'}</span>
                    <strong className="text-slate-800 font-mono">{patientCases.length} {language === 'ar' ? 'حالة' : 'treatments'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">{language === 'ar' ? 'إذن النشر والتصوير:' : 'Social Media Consent:'}</span>
                    <span className={`font-semibold ${medHistory?.publishConsentAgreed ? 'text-purple-600' : 'text-slate-400'}`}>
                      {medHistory?.publishConsentAgreed 
                        ? (language === 'ar' ? 'موافق على النشر' : 'Consented') 
                        : (language === 'ar' ? 'محظور النشر (خاص)' : 'Private / Opted Out')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                <span className="text-[11px] text-slate-400">
                  {language === 'ar' ? 'تاريخ التسجيل: ' : 'Registered: '} {patient.registeredAt}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenCheckup(patient.id)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'الفحص الطبي' : 'Medical Checkup'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Printer, 
  ShieldAlert,
  HelpCircle,
  Clock,
  Sparkles,
  Lock,
  Share2
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { MedicalHistoryForm, Patient, ToothCondition, ProcedureType } from '../../types';
import { ADULT_TEETH, TOOTH_CONDITIONS_CONFIG } from '../../utils/fdiTeeth';

interface MedicalCheckupModalProps {
  patientId: string;
  onClose: () => void;
  onPlanCreated?: () => void;
}

export const MedicalCheckupModal: React.FC<MedicalCheckupModalProps> = ({
  patientId,
  onClose,
  onPlanCreated
}) => {
  const { 
    patients, 
    medicalHistories, 
    saveMedicalHistory, 
    approveMedicalHistory, 
    currentUser, 
    language,
    createCase 
  } = useClinic();

  const patient = patients.find(p => p.id === patientId);
  const existingHistory = medicalHistories.find(m => m.patientId === patientId);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State initialized from existing history or defaults
  const [formData, setFormData] = useState<Omit<MedicalHistoryForm, 'id' | 'createdAt' | 'updatedAt' | 'clinicalAlerts'>>({
    patientId,
    studentId: existingHistory?.studentId || currentUser.id,
    supervisorId: existingHistory?.supervisorId,
    status: existingHistory?.status || 'draft',
    supervisorFeedback: existingHistory?.supervisorFeedback,
    bloodPressureSystolic: existingHistory?.bloodPressureSystolic ?? 120,
    bloodPressureDiastolic: existingHistory?.bloodPressureDiastolic ?? 80,
    sicknesses: existingHistory?.sicknesses || {
      heartDisease: false,
      hypertension: false,
      diabetes: false,
      hba1cLevel: '',
      respiratoryDisease: false,
      liverKidneyDisease: false,
      bleedingDisorder: false,
      strokeEpilepsy: false,
      cancerTumor: false,
      recentSurgeryHospitalization: false,
      otherNotes: ''
    },
    currentMedications: existingHistory?.currentMedications || {
      bloodThinners: false,
      bisphosphonates: false,
      bloodPressureMeds: false,
      diabetesMeds: false,
      otherList: ''
    },
    allergies: existingHistory?.allergies || {
      localAnesthesia: false,
      penicillin: false,
      latex: false,
      nsaidsAspirin: false,
      otherDetails: ''
    },
    femaleQuestions: existingHistory?.femaleQuestions || {
      isPregnant: false,
      pregnancyMonth: 1,
      isLactating: false
    },
    chiefComplaint: existingHistory?.chiefComplaint || 'Pain and sensitivity on upper right molar.',
    chiefComplaintAr: existingHistory?.chiefComplaintAr || 'ألم وحساسية في الضرس العلوي الأيمن.',
    visitReason: existingHistory?.visitReason || 'Dental checkup & treatment',
    lastDentalVisitDate: existingHistory?.lastDentalVisitDate || '2025-06-01',
    gumBleeding: existingHistory?.gumBleeding ?? true,
    dentalPhobia: existingHistory?.dentalPhobia || 'none',
    previousAnesthesiaIssues: existingHistory?.previousAnesthesiaIssues ?? false,
    occlusion: existingHistory?.occlusion || 'normal',
    torusPalatinus: existingHistory?.torusPalatinus || 'none',
    torusMandibularis: existingHistory?.torusMandibularis || 'none',
    palatum: existingHistory?.palatum || 'normal',
    anomalousTeethNotes: existingHistory?.anomalousTeethNotes || '',
    gingivalCondition: existingHistory?.gingivalCondition || 'healthy',
    treatmentConsentAgreed: existingHistory?.treatmentConsentAgreed ?? true,
    treatmentConsentDate: existingHistory?.treatmentConsentDate || new Date().toISOString().split('T')[0],
    patientSignatureText: existingHistory?.patientSignatureText || patient?.fullName || '',
    publishConsentAgreed: existingHistory?.publishConsentAgreed ?? false, // Default false for privacy!
    publishConsentDate: existingHistory?.publishConsentDate
  });

  // Interactive tooth selection in Step 2
  const [selectedFdiTooth, setSelectedFdiTooth] = useState<number>(16);
  const [selectedCondition, setSelectedCondition] = useState<ToothCondition>('caries');
  const [selectedProcedure, setSelectedProcedure] = useState<ProcedureType>('Tooth Filling');
  const [treatmentNotes, setTreatmentNotes] = useState<string>('Class II composite filling required.');
  const [treatmentSavedToast, setTreatmentSavedToast] = useState(false);

  // Supervisor Approval state
  const [supervisorFeedbackInput, setSupervisorFeedbackInput] = useState('');

  if (!patient) return null;

  // Real-time risk detection
  const hasBleedingRisk = formData.currentMedications.bloodThinners || formData.sicknesses.bleedingDisorder;
  const hasBisphosphonates = formData.currentMedications.bisphosphonates;
  const hasLocalAnesthesiaAllergy = formData.allergies.localAnesthesia;
  const hasLatexAllergy = formData.allergies.latex;
  const hasPenicillinAllergy = formData.allergies.penicillin;

  const handleSaveDraft = () => {
    saveMedicalHistory({ ...formData, status: 'draft' }, existingHistory?.id);
    onClose();
  };

  const handleSubmitForSupervisor = () => {
    saveMedicalHistory({ ...formData, status: 'pending_approval' }, existingHistory?.id);
    onClose();
  };

  const handleAddTreatmentCase = () => {
    // Determine subject by procedure
    let subjectId = 'sub-cons';
    if (selectedProcedure === 'Tooth Extraction') subjectId = 'sub-surg';
    else if (selectedProcedure === 'Tooth Scaling') subjectId = 'sub-perio';
    else if (selectedProcedure === 'Root Canal Treatment') subjectId = 'sub-endo';

    createCase({
      patientId: patient.id,
      studentId: currentUser.id,
      supervisorId: currentUser.role === 'supervisor' ? currentUser.id : undefined,
      subjectId,
      toothNumber: selectedFdiTooth,
      condition: selectedCondition,
      procedure: selectedProcedure,
      status: 'planned',
      notes: treatmentNotes,
      xrays: []
    });

    setTreatmentSavedToast(true);
    setTimeout(() => setTreatmentSavedToast(false), 2500);
    if (onPlanCreated) onPlanCreated();
  };

  const handleApprove = (approved: boolean) => {
    if (!existingHistory) {
      const saved = saveMedicalHistory(formData);
      approveMedicalHistory(saved.id, approved, supervisorFeedbackInput || (approved ? 'Approved by supervisor' : 'Needs changes'));
    } else {
      approveMedicalHistory(existingHistory.id, approved, supervisorFeedbackInput || (approved ? 'Approved by supervisor' : 'Needs changes'));
    }
    onClose();
  };

  const isSupervisorOrAdmin = currentUser.role === 'supervisor' || currentUser.role === 'super_admin';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header (Matches Video 00:04) */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {language === 'ar' ? 'الفحص الطبي وخطة العلاج' : 'Medical Checkup'}
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                {patient.patientCode}
              </span>
              {/* Status Badge */}
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                formData.status === 'approved' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : formData.status === 'pending_approval' 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-slate-100 text-slate-700'
              }`}>
                {formData.status === 'approved' 
                  ? (language === 'ar' ? 'معتمد رسمياً' : 'Approved') 
                  : formData.status === 'pending_approval' 
                    ? (language === 'ar' ? 'بانتظار المشرف' : 'Pending Review') 
                    : (language === 'ar' ? 'مسودة' : 'Draft')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ar' ? 'المريض:' : 'Patient:'} <strong className="text-slate-700">{patient.fullName}</strong> ({patient.gender}, {patient.age} {language === 'ar' ? 'سنة' : 'y/o'})
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Navigation (Matches video 00:04) */}
        <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between shrink-0 overflow-x-auto">
          {[
            { step: 1, labelEn: 'Medical data', labelAr: 'البيانات الطبية' },
            { step: 2, labelEn: 'Treatment Plan', labelAr: 'مخطط الأسنان والعلاج' },
            { step: 3, labelEn: 'Oral Check', labelAr: 'الفحص السريري للفم' },
            { step: 4, labelEn: 'Plan Agreement', labelAr: 'الإقرار والموافقات' }
          ].map((s) => {
            const isDone = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <button
                key={s.step}
                onClick={() => setCurrentStep(s.step as 1 | 2 | 3 | 4)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isCurrent 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : isDone 
                      ? 'text-blue-700 bg-blue-50' 
                      : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  isCurrent ? 'bg-white text-blue-600' : isDone ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isDone ? <Check className="w-3 h-3" /> : s.step}
                </div>
                <span>{language === 'ar' ? s.labelAr : s.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Critical Clinical Alerts Banner (PDF requirement: Visual red/yellow banner when high risks exist) */}
        {(hasBleedingRisk || hasBisphosphonates || hasLocalAnesthesiaAllergy || hasLatexAllergy || hasPenicillinAllergy) && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 flex items-center justify-between text-xs text-red-800 shrink-0">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <div>
                <strong className="font-bold">{language === 'ar' ? 'تنبيه سريري آلي حرج:' : 'Clinical Safety Alert:'} </strong>
                {hasBleedingRisk && <span className="font-medium mr-1.5 underline">{language === 'ar' ? 'خطر نزيف دم (مسيلات)' : 'Bleeding Risk (Anticoagulants)'}</span>}
                {hasBisphosphonates && <span className="font-medium mr-1.5 underline">{language === 'ar' ? 'خطر نخر عظمي (بيسفوسفونات)' : 'MRONJ Osteonecrosis Risk'}</span>}
                {hasLocalAnesthesiaAllergy && <span className="font-medium mr-1.5 underline">{language === 'ar' ? 'حساسية بنج موضعي' : 'Local Anesthetic Allergy'}</span>}
                {hasLatexAllergy && <span className="font-medium mr-1.5 underline">{language === 'ar' ? 'حساسية لاتكس' : 'Latex Allergy'}</span>}
                {hasPenicillinAllergy && <span className="font-medium mr-1.5 underline">{language === 'ar' ? 'حساسية بنسلين' : 'Penicillin Allergy'}</span>}
              </div>
            </div>
            <span className="text-[11px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-mono font-bold">SAFETY GATE</span>
          </div>
        )}

        {/* Scrollable Step Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: MEDICAL DATA (Video 00:04 - 00:08) */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Blood Pressure Input */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center justify-between">
                  <span>{language === 'ar' ? 'ضغط الدم المقاس في العيادة' : 'Blood Pressure (Chairside Triage)'}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    formData.bloodPressureSystolic >= 140 || formData.bloodPressureDiastolic >= 90
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {formData.bloodPressureSystolic >= 140 || formData.bloodPressureDiastolic >= 90
                      ? (language === 'ar' ? 'مرتفع' : 'Elevated / Stage 1-2')
                      : (language === 'ar' ? 'طبيعي' : 'Normal')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">{language === 'ar' ? 'الانقباضي (Systolic)' : 'Systolic'}</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        value={formData.bloodPressureSystolic}
                        onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-900"
                      />
                      <span className="text-xs text-slate-400 font-mono">mmHg</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">{language === 'ar' ? 'الانبساطي (Diastolic)' : 'Diastolic'}</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        value={formData.bloodPressureDiastolic}
                        onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-900"
                      />
                      <span className="text-xs text-slate-400 font-mono">mmHg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Particular Sicknesses (Matches video 00:04 checkboxes) */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">
                  {language === 'ar' ? 'الأمراض المزمنة والعامة (Particular Sicknesses)' : 'Particular Sicknesses'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'heartDisease', labelEn: 'Heart Disease / Valve / Stent', labelAr: 'أمراض القلب، صمامات، دعامات' },
                    { key: 'hypertension', labelEn: 'Hypertension', labelAr: 'ارتفاع ضغط الدم المزمن' },
                    { key: 'diabetes', labelEn: 'Diabetes Mellitus', labelAr: 'مرض السكري' },
                    { key: 'bleedingDisorder', labelEn: 'Haemophilia / Bleeding Tendency', labelAr: 'سيولة الدم والنزيف المستمر' },
                    { key: 'liverKidneyDisease', labelEn: 'Hepatitis / Liver / Kidney', labelAr: 'التهاب الكبد الوبائي أو الكلى' },
                    { key: 'respiratoryDisease', labelEn: 'Asthma / COPD / Respiratory', labelAr: 'الربو وأمراض الجهاز التنفسي' },
                    { key: 'strokeEpilepsy', labelEn: 'Epilepsy / Stroke History', labelAr: 'الصرع أو السكتة الدماغية' },
                    { key: 'cancerTumor', labelEn: 'Cancer / Chemotherapy / Radiation', labelAr: 'أورام سرطانية أو علاج إشعاعي' },
                    { key: 'recentSurgeryHospitalization', labelEn: 'Surgery / Hospitalization (<2 yrs)', labelAr: 'عمليات جراحية أو تنويم خلال سنتين' }
                  ].map((item) => (
                    <label 
                      key={item.key}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        formData.sicknesses[item.key as keyof typeof formData.sicknesses]
                          ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={Boolean(formData.sicknesses[item.key as keyof typeof formData.sicknesses])}
                        onChange={(e) => setFormData({
                          ...formData,
                          sicknesses: {
                            ...formData.sicknesses,
                            [item.key]: e.target.checked
                          }
                        })}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-medium text-slate-800">
                        {language === 'ar' ? item.labelAr : item.labelEn}
                      </span>
                    </label>
                  ))}
                </div>

                {formData.sicknesses.diabetes && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 max-w-sm">
                    <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                      {language === 'ar' ? 'آخر قراءة سكر تراكمي (HbA1c)' : 'Last HbA1c Level (%)'}
                    </label>
                    <input 
                      type="text"
                      value={formData.sicknesses.hba1cLevel || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        sicknesses: { ...formData.sicknesses, hba1cLevel: e.target.value }
                      })}
                      placeholder="e.g. 6.8% or 8.2%"
                      className="w-full bg-white border border-amber-300 rounded px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Current Medications (PDF Section 4.3 requirement) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    {language === 'ar' ? 'الأدوية الحالية (خاصة مسيلات الدم وهشاشة العظام)' : 'Current Medications'}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {language === 'ar' ? 'تنبيه آلي عند اختيار المسيلات أو البيسفوسفونات' : 'Auto-clinical alert enabled'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.currentMedications.bloodThinners ? 'bg-red-50 border-red-300 ring-1 ring-red-400' : 'bg-white border-slate-200'
                  }`}>
                    <input 
                      type="checkbox"
                      checked={formData.currentMedications.bloodThinners}
                      onChange={(e) => setFormData({
                        ...formData,
                        currentMedications: { ...formData.currentMedications, bloodThinners: e.target.checked }
                      })}
                      className="mt-0.5 text-red-600 rounded"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {language === 'ar' ? 'مسيلات الدم (Aspirin / Warfarin / Plavix)' : 'Blood Thinners (Aspirin, Warfarin, DOACs)'}
                      </div>
                      <div className="text-[11px] text-red-600 mt-0.5">
                        {language === 'ar' ? 'خطر نزف دم أثناء القلع أو الجراحة اللثوية' : 'Bleeding hazard during surgery or extractions'}
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.currentMedications.bisphosphonates ? 'bg-red-50 border-red-300 ring-1 ring-red-400' : 'bg-white border-slate-200'
                  }`}>
                    <input 
                      type="checkbox"
                      checked={formData.currentMedications.bisphosphonates}
                      onChange={(e) => setFormData({
                        ...formData,
                        currentMedications: { ...formData.currentMedications, bisphosphonates: e.target.checked }
                      })}
                      className="mt-0.5 text-red-600 rounded"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {language === 'ar' ? 'أدوية هشاشة العظام (Bisphosphonates / Prolia)' : 'Bisphosphonates / Osteoporosis Meds'}
                      </div>
                      <div className="text-[11px] text-red-600 mt-0.5">
                        {language === 'ar' ? 'خطر نخر عظمي فكي MRONJ' : 'Risk of Osteonecrosis of the Jaw'}
                      </div>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    {language === 'ar' ? 'تفاصيل أسماء الجرعات والأدوية الأخرى' : 'Medication details & dosages'}
                  </label>
                  <input 
                    type="text"
                    value={formData.currentMedications.otherList}
                    onChange={(e) => setFormData({
                      ...formData,
                      currentMedications: { ...formData.currentMedications, otherList: e.target.value }
                    })}
                    placeholder="e.g. Aspirin 81mg daily, Metformin 500mg, etc."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Allergies (PDF Section 4.4 requirement) */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">
                  {language === 'ar' ? 'الحساسية الدوائية والمواد (Allergies)' : 'Allergies & Sensitivities'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'localAnesthesia', labelEn: 'Local Anesthesia (Lidocaine)', labelAr: 'مخدر الأسنان الموضعي' },
                    { key: 'penicillin', labelEn: 'Penicillin / Amoxicillin', labelAr: 'البنسلين ومضاداته' },
                    { key: 'latex', labelEn: 'Latex Gloves / Dam', labelAr: 'مادة اللاتكس / المطاط' },
                    { key: 'nsaidsAspirin', labelEn: 'NSAIDs / Ibuprofen', labelAr: 'مسكنات البروفين والأسبرين' }
                  ].map((item) => (
                    <label 
                      key={item.key}
                      className={`flex items-start gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                        formData.allergies[item.key as keyof typeof formData.allergies]
                          ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-300'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={Boolean(formData.allergies[item.key as keyof typeof formData.allergies])}
                        onChange={(e) => setFormData({
                          ...formData,
                          allergies: { ...formData.allergies, [item.key]: e.target.checked }
                        })}
                        className="mt-0.5 text-amber-600 rounded"
                      />
                      <span className="text-xs font-medium text-slate-800">
                        {language === 'ar' ? item.labelAr : item.labelEn}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TREATMENT PLAN & ODONTOGRAM (Matches Video 00:09 - 00:26) */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    {language === 'ar' ? 'مخطط الأسنان التفاعلي (FDI Dental Chart)' : 'Interactive Odontogram (FDI)'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'ar' ? 'انقر على السن لتحديد الإجراء وتسجيل الخطة' : 'Click any tooth to assign condition and treatment'}
                  </p>
                </div>
                <div className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
                  {language === 'ar' ? `السن المحدد: #${selectedFdiTooth}` : `Selected: Tooth #${selectedFdiTooth}`}
                </div>
              </div>

              {/* Upper Arch (Maxillary 18 to 28) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider mb-2">
                  {language === 'ar' ? 'الفك العلوي (Maxillary Arch)' : 'Upper Arch (Maxillary)'}
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                  {ADULT_TEETH.filter(t => t.arch === 'maxillary').map(tooth => {
                    const isSelected = selectedFdiTooth === tooth.fdi;
                    return (
                      <button
                        key={tooth.fdi}
                        type="button"
                        onClick={() => setSelectedFdiTooth(tooth.fdi)}
                        className={`w-10 h-14 rounded-xl flex flex-col items-center justify-between p-1 transition-all border ${
                          isSelected 
                            ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-105' 
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                        title={`${tooth.fdi} - ${tooth.nameEn}`}
                      >
                        <span className="text-[10px] font-mono font-bold">{tooth.fdi}</span>
                        {/* Tooth shape preview icon */}
                        <div className={`w-5 h-6 rounded-t-md border-t-2 ${isSelected ? 'border-white bg-white/20' : 'border-slate-400 bg-slate-100'}`} />
                        <span className="text-[8px] opacity-75">{tooth.type.slice(0, 3)}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Lower Arch (Mandibular 48 to 38) */}
                <div className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider mt-4 mb-2">
                  {language === 'ar' ? 'الفك السفلي (Mandibular Arch)' : 'Lower Arch (Mandibular)'}
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                  {ADULT_TEETH.filter(t => t.arch === 'mandibular').map(tooth => {
                    const isSelected = selectedFdiTooth === tooth.fdi;
                    return (
                      <button
                        key={tooth.fdi}
                        type="button"
                        onClick={() => setSelectedFdiTooth(tooth.fdi)}
                        className={`w-10 h-14 rounded-xl flex flex-col items-center justify-between p-1 transition-all border ${
                          isSelected 
                            ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-105' 
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                        title={`${tooth.fdi} - ${tooth.nameEn}`}
                      >
                        <span className="text-[8px] opacity-75">{tooth.type.slice(0, 3)}</span>
                        <div className={`w-5 h-6 rounded-b-md border-b-2 ${isSelected ? 'border-white bg-white/20' : 'border-slate-400 bg-slate-100'}`} />
                        <span className="text-[10px] font-mono font-bold">{tooth.fdi}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tooth Detail Form (Matches video 00:11 - 00:18) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="font-bold text-sm text-slate-900">
                    {language === 'ar' ? `تفاصيل وإجراء السن #${selectedFdiTooth}` : `Tooth #${selectedFdiTooth} Details`}
                  </div>
                  <span className="text-xs text-slate-500">
                    {ADULT_TEETH.find(t => t.fdi === selectedFdiTooth)?.nameEn}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Condition selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'ar' ? 'حالة السن (Condition):' : 'Tooth Condition:'}
                    </label>
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value as ToothCondition)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
                    >
                      {Object.entries(TOOTH_CONDITIONS_CONFIG).map(([key, val]) => (
                        <option key={key} value={key}>
                          {language === 'ar' ? val.labelAr : val.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Procedure selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {language === 'ar' ? 'نوع الإجراء العلاجي المطلوب:' : 'Required Procedure:'}
                    </label>
                    <select
                      value={selectedProcedure}
                      onChange={(e) => setSelectedProcedure(e.target.value as ProcedureType)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
                    >
                      <option value="Tooth Filling">Tooth Filling (Restorative)</option>
                      <option value="Tooth Scaling">Tooth Scaling (Periodontics)</option>
                      <option value="Root Canal Treatment">Root Canal Treatment (Endodontics)</option>
                      <option value="Tooth Extraction">Tooth Extraction (Surgery)</option>
                      <option value="Dental Crown">Dental Crown (Prosthodontics)</option>
                      <option value="Tooth Whitening">Tooth Whitening (Cosmetic)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {language === 'ar' ? 'ملاحظات سريرية وتشخيص السن:' : 'Clinical Diagnosis & Procedure Notes:'}
                  </label>
                  <textarea
                    rows={2}
                    value={treatmentNotes}
                    onChange={(e) => setTreatmentNotes(e.target.value)}
                    placeholder="e.g. Deep occlusal dentin caries, vitality positive, rubber dam required..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {treatmentSavedToast ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {language === 'ar' ? 'تم حفظ الحالة بالخطة العلاجية بنجاح!' : 'Case successfully added to plan!'}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">
                      {language === 'ar' ? 'تسجيل الحالة لحساب متطلبات الطالب السريرية' : 'Will contribute to student quota upon completion'}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleAddTreatmentCase}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all"
                  >
                    {language === 'ar' ? '+ إضافة للخطة العلاجية' : '+ Add to Treatment Plan'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ORAL CHECK (Matches Video 00:30 - 00:34) */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {language === 'ar' ? 'الفحص التشريحي والسريري للفم (Oral & Anatomical Check)' : 'Oral & Anatomical Check'}
              </h3>

              {/* Occlusion */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  {language === 'ar' ? 'الإطباق (Occlusion):' : 'Occlusion:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { val: 'normal', label: 'Normal' },
                    { val: 'cross_bite', label: 'Cross bite' },
                    { val: 'deep_bite', label: 'Deep bite' },
                    { val: 'open_bite', label: 'Open bite' }
                  ].map((o) => (
                    <button
                      key={o.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, occlusion: o.val as any })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        formData.occlusion === o.val 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Torus Palatinus */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  {language === 'ar' ? 'النتوء الحنكي (Torus Palatinus):' : 'Torus Palatinus:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['none', 'small', 'medium', 'large'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, torusPalatinus: t as any })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize border transition-all ${
                        formData.torusPalatinus === t 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Torus Mandibularis */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  {language === 'ar' ? 'النتوء الفكي السفلي (Torus Mandibularis):' : 'Torus Mandibularis:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { val: 'none', label: 'None' },
                    { val: 'left', label: 'Left side' },
                    { val: 'right', label: 'Right side' },
                    { val: 'both', label: 'Both sides' }
                  ].map((m) => (
                    <button
                      key={m.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, torusMandibularis: m.val as any })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        formData.torusMandibularis === m.val 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Palatum & Anomalous teeth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    {language === 'ar' ? 'شكل قبة الحنك (Palatum):' : 'Palatum Shape:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['normal', 'high', 'flat'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({ ...formData, palatum: p as any })}
                        className={`py-2 px-2 text-center rounded-lg text-xs font-semibold capitalize border transition-all ${
                          formData.palatum === p 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    {language === 'ar' ? 'تشوهات سنية ملحوظة (Anomalous Teeth):' : 'Anomalous Teeth:'}
                  </label>
                  <input 
                    type="text"
                    value={formData.anomalousTeethNotes}
                    onChange={(e) => setFormData({ ...formData, anomalousTeethNotes: e.target.value })}
                    placeholder="e.g. Peg lateral #12, microdontia, enamel hypoplasia..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PLAN AGREEMENT & SEPARATE CONSENT GATE (Video 00:41 + PDF Section 4.7) */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 leading-relaxed">
                <strong className="font-bold block mb-1">
                  {language === 'ar' ? 'وثيقة الإقرار والموافقة المستنيرة - عيادات طب الأسنان SPU' : 'Legal Clinical Agreement & Consent - SPU-DENTAL-CLINICS'}
                </strong>
                {language === 'ar' 
                  ? 'بموجب أنظمة عيادات طب الأسنان في الجامعة السورية الخاصة SPU، يجب فصل الموافقة على العلاج عن موافقة النشر الإعلامي والأكاديمي تماماً.'
                  : 'Per Syrian Private University (SPU-DENTAL-CLINICS) regulations, informed consent for treatment is strictly separated from any academic / social media publication consent.'}
              </div>

              {/* 1. Treatment Informed Consent */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">
                      1. {language === 'ar' ? 'الموافقة المستنيرة على الخطة العلاجية والتخدير' : 'Informed Treatment Consent'}
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => window.print()} 
                    className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'طباعة الوثيقة' : 'Print Document'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {language === 'ar' 
                    ? 'أقر أنا المريض بأنني قد أدليت بكافة البيانات الطبية والأدوية بأمانة تامة، وقد تم إيضاح خطة العلاج ومخاطرها المحتملة وأوافق على تلقي العلاج تحت إشراف أطباء وأساتذة الكلية.'
                    : 'I certify that all medical history and medications provided are accurate. The proposed treatment plan, risks, and alternatives have been explained to me, and I consent to receive dental care.'}
                </p>

                <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                  <input 
                    type="checkbox"
                    checked={formData.treatmentConsentAgreed}
                    onChange={(e) => setFormData({ ...formData, treatmentConsentAgreed: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-900">
                    {language === 'ar' ? 'أوافق وأقر بصحة البيانات وخطة العلاج' : 'I agree and consent to the dental treatment plan'}
                  </span>
                </label>

                {/* Digital Signature */}
                <div className="pt-2">
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">
                    {language === 'ar' ? 'توقيع المريض الرقمي (الاسم الكامل):' : 'Patient Digital Signature (Full Name):'}
                  </label>
                  <input 
                    type="text"
                    value={formData.patientSignatureText}
                    onChange={(e) => setFormData({ ...formData, patientSignatureText: e.target.value })}
                    className="w-full max-w-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* 2. CRITICAL SEPARATE CONSENT: Academic & Social Media Publication (PDF Section 4.7 specification) */}
              <div className={`p-4 rounded-xl border space-y-3 transition-all ${
                formData.publishConsentAgreed 
                  ? 'bg-purple-50/60 border-purple-300' 
                  : 'bg-slate-50/80 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className={`w-4 h-4 ${formData.publishConsentAgreed ? 'text-purple-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold text-slate-900">
                      2. {language === 'ar' ? 'موافقة منفصلة: نشر الصور والحالات للأغراض التعليمية / السوشال ميديا' : 'Separate Consent: Clinical Photo & Case Publication'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    formData.publishConsentAgreed ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {formData.publishConsentAgreed ? (language === 'ar' ? 'موافق على النشر' : 'Opted In') : (language === 'ar' ? 'مرفوض النشر (سري)' : 'Strictly Private')}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {language === 'ar' 
                    ? 'وفقاً لميثاق الخصوصية الطبية: في حال عدم تحديد هذا الخيار، سيتم حظر زر النشر ومشاركة الصور تلقائياً لهذه الحالة منعاً باتاً لحماية خصوصية المريض.'
                    : 'Per technical requirements: If this consent is not accepted, social media sharing for this case will remain permanently disabled in the system.'}
                </p>

                <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                  <input 
                    type="checkbox"
                    checked={formData.publishConsentAgreed}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      publishConsentAgreed: e.target.checked,
                      publishConsentDate: e.target.checked ? new Date().toISOString().split('T')[0] : undefined
                    })}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    {language === 'ar' 
                      ? 'أوافق على استخدام الصور السريرية والأشعة غير المعرفة للأغراض الأكاديمية ونشرها' 
                      : 'I grant permission to use anonymized dental photos & X-rays for educational/social publication'}
                  </span>
                </label>
              </div>

              {/* SUPERVISOR APPROVAL GATE PANEL (PDF Section 5 requirement) */}
              {isSupervisorOrAdmin && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-emerald-700" />
                      {language === 'ar' ? 'بوابة اعتماد المشرف السريري (إلزامية)' : 'Clinical Supervisor Approval Gateway'}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded">
                      SUPERVISOR ONLY
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-emerald-800 mb-1">
                      {language === 'ar' ? 'ملاحظات المشرف وتوجيهات السلامة:' : 'Supervisor Clinical Notes & Safety Instructions:'}
                    </label>
                    <input 
                      type="text"
                      value={supervisorFeedbackInput}
                      onChange={(e) => setSupervisorFeedbackInput(e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: تم تدقيق مسيل الدم، احرص على وضع إسفنجة تخثر...' : 'e.g. Medical alerts reviewed. Hemostatic precautions noted.'}
                      className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-2 text-xs text-slate-800"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleApprove(false)}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors"
                    >
                      {language === 'ar' ? 'رفض / طلب تعديل' : 'Request Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(true)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                    >
                      {language === 'ar' ? 'اعتماد الفحص الطبي رسمياً' : 'Approve Medical Checkup'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((currentStep - 1) as any)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{language === 'ar' ? 'السابق' : 'Previous'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all"
              >
                {language === 'ar' ? 'حفظ كمسودة' : 'Save Draft'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((currentStep + 1) as any)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <span>{language === 'ar' ? 'التالي' : 'Next'}</span>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitForSupervisor}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'ar' ? 'إرسال للاعتماد النهائي' : 'Submit for Approval'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

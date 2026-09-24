import React, { useState } from 'react';
import { 
  FileCheck2, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Sparkles, 
  UserCheck, 
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { MedicalHistoryForm, CaseTreatment, EvaluationGrade } from '../../types';

interface SupervisorReviewViewProps {
  onOpenCheckupModal: (patientId: string) => void;
}

export const SupervisorReviewView: React.FC<SupervisorReviewViewProps> = ({
  onOpenCheckupModal
}) => {
  const { 
    medicalHistories, 
    cases, 
    patients, 
    allUsers, 
    approveMedicalHistory, 
    evaluateCase, 
    currentUser, 
    language 
  } = useClinic();

  const [activeTab, setActiveTab] = useState<'approvals' | 'grading'>('approvals');

  // Selected case for grading modal
  const [gradingCase, setGradingCase] = useState<CaseTreatment | null>(null);
  const [rubric, setRubric] = useState<EvaluationGrade['rubric']>({
    diagnosis: 5,
    treatmentPlan: 5,
    execution: 4,
    infectionControl: 5,
    professionalism: 5
  });
  const [gradingComments, setGradingComments] = useState('');

  // Medical forms pending review
  const pendingHistories = medicalHistories.filter(m => m.status === 'pending_approval');
  const allHistories = medicalHistories;

  // Cases pending review or recently completed
  const pendingCases = cases.filter(c => c.status === 'ready_for_review' || c.status === 'in_progress');
  const completedCases = cases.filter(c => c.evaluation !== undefined);

  const handleGradeSubmit = () => {
    if (!gradingCase) return;
    evaluateCase(gradingCase.id, rubric, gradingComments || 'Case evaluated and approved according to clinical guidelines.');
    setGradingCase(null);
    setGradingComments('');
  };

  const totalRubricScore = rubric.diagnosis + rubric.treatmentPlan + rubric.execution + rubric.infectionControl + rubric.professionalism;
  const rubricPercentage = Math.round((totalRubricScore / 25) * 100);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-600" />
            <span>{language === 'ar' ? 'بوابة اعتماد المشرف السريري ورصد الدرجات' : 'Supervisor Clinical Review & Grading Gate'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ar' 
              ? 'اعتماد الفحص الطبي الإلزامي، ومراجعة وتقييم حالات الطلاب السريرية' 
              : 'Mandatory medical history authorization & 5-parameter clinical rubric evaluation'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-2xs text-xs font-semibold">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'approvals' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'اعتماد الفحص الطبي' : 'Medical Approvals'}</span>
            {pendingHistories.length > 0 && (
              <span className="px-1.5 py-0.2 bg-red-500 text-white text-[10px] rounded-full font-bold">
                {pendingHistories.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('grading')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeTab === 'grading' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تقييم ورصد الحالات' : 'Case Evaluations'}</span>
            {cases.filter(c => c.status === 'ready_for_review').length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full font-bold">
                {cases.filter(c => c.status === 'ready_for_review').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: MEDICAL HISTORY APPROVAL GATEWAY (PDF Section 4 & 5) */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
            <UserCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block mb-0.5">
                {language === 'ar' ? 'بوابة الاعتماد الإلزامية (Gatekeeper Principle):' : 'Mandatory Clinical Gatekeeper:'}
              </strong>
              {language === 'ar' 
                ? 'لا يمكن للطالب بدء علاج المريض أو تنفيذ الإجراءات حتى يعتمد المشرف الفحص الطبي ويتأكد من سلامة التنبيهات السريرية.'
                : 'Students are prevented from beginning invasive treatment until the supervisor reviews vital signs, risk alerts, and approves the medical intake.'}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {allHistories.map((m) => {
              const patient = patients.find(p => p.id === m.patientId);
              const student = allUsers.find(u => u.id === m.studentId);
              const hasAlerts = m.clinicalAlerts.length > 0;

              return (
                <div 
                  key={m.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                    m.status === 'pending_approval' ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">{patient?.patientCode}</span>
                        <h3 className="font-bold text-slate-900 text-base">
                          {language === 'ar' ? patient?.fullNameAr || patient?.fullName : patient?.fullName}
                        </h3>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          m.status === 'approved' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : m.status === 'pending_approval'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                        }`}>
                          {m.status === 'approved' ? (language === 'ar' ? 'معتمد' : 'Approved') : (language === 'ar' ? 'بانتظار الاعتماد' : 'Pending Approval')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {language === 'ar' ? 'طالب العيادة:' : 'Attending Student:'} <strong className="text-slate-800">{student?.name}</strong> ({student?.studentId})
                        <span className="mx-2 text-slate-300">·</span>
                        {language === 'ar' ? 'ضغط الدم:' : 'BP:'} <span className="font-mono font-semibold">{m.bloodPressureSystolic}/{m.bloodPressureDiastolic} mmHg</span>
                      </div>
                    </div>

                    {/* Quick Review Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenCheckupModal(m.patientId)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        {language === 'ar' ? 'معاينة النموذج كاملاً' : 'Inspect Full Form'}
                      </button>

                      {m.status === 'pending_approval' && (
                        <>
                          <button
                            onClick={() => approveMedicalHistory(m.id, false, 'Medical form rejected: Missing detailed cardiology clearance.')}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors"
                          >
                            {language === 'ar' ? 'طلب تعديل' : 'Reject / Revise'}
                          </button>
                          <button
                            onClick={() => approveMedicalHistory(m.id, true, 'Medical clearance approved. Proceed under standard precautions.')}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'اعتماد رسمي' : 'Approve Clearance'}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Clinical Alert Flags */}
                  {hasAlerts && (
                    <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl space-y-1.5 my-3">
                      <div className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span>{language === 'ar' ? 'تنبيهات سريرية حرجة تستوجب تدقيق المشرف:' : 'Clinical Safety Warnings Detected:'}</span>
                      </div>
                      <div className="space-y-1">
                        {m.clinicalAlerts.map((alt, idx) => (
                          <div key={idx} className="text-xs text-red-900 bg-white p-2 rounded-lg border border-red-100">
                            <strong>{language === 'ar' ? alt.titleAr : alt.title}:</strong> {language === 'ar' ? alt.impactAr : alt.impact}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Supervisor Note if already given */}
                  {m.supervisorFeedback && (
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-600">
                      <strong className="text-slate-800">{language === 'ar' ? 'ملاحظة المشرف:' : 'Supervisor Feedback:'}</strong> {m.supervisorFeedback}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CLINICAL CASE EVALUATIONS & RUBRICS (PDF Section 6) */}
      {activeTab === 'grading' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3">
              {language === 'ar' ? 'الحالات الجاهزة للتقييم والرصد الأكاديمي' : 'Cases Ready for Supervisor Grading'}
            </h2>

            <div className="space-y-3">
              {cases.map((c) => {
                const patient = patients.find(p => p.id === c.patientId);
                const student = allUsers.find(u => u.id === c.studentId);

                return (
                  <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600 text-xs">{c.caseNumber}</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {c.procedure} — FDI #{c.toothNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 mt-1">
                        {language === 'ar' ? 'المريض:' : 'Patient:'} <strong>{patient?.fullName}</strong>
                        <span className="mx-2 text-slate-300">·</span>
                        {language === 'ar' ? 'الطالب:' : 'Student:'} <strong>{student?.name}</strong>
                      </div>

                      <div className="text-[11px] text-slate-600 mt-1">{c.notes}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      {c.evaluation ? (
                        <div className="text-right rtl:text-left">
                          <div className="text-xs font-bold text-emerald-700 font-mono">
                            {language === 'ar' ? 'الدرجة:' : 'Score:'} {c.evaluation.totalScore}/25 ({c.evaluation.percentage}%)
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {c.evaluation.supervisorName}
                          </div>
                        </div>
                      ) : null}

                      <button
                        onClick={() => {
                          setGradingCase(c);
                          if (c.evaluation) {
                            setRubric(c.evaluation.rubric);
                            setGradingComments(c.evaluation.comments);
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{c.evaluation ? (language === 'ar' ? 'تعديل التقييم' : 'Update Rubric') : (language === 'ar' ? 'تقييم ورصد العلامة' : 'Grade Case')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Grading Rubric Modal (5-parameter clinical criteria) */}
      {gradingCase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {language === 'ar' ? 'استمارة تقييم الحالة السريرية (Rubric 5 Criteria)' : 'Clinical Evaluation Rubric'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {gradingCase.caseNumber} · {gradingCase.procedure} (#{gradingCase.toothNumber})
                </p>
              </div>
              <button 
                onClick={() => setGradingCase(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Rubric Criteria sliders/scores */}
            <div className="p-6 overflow-y-auto space-y-4">
              {[
                { key: 'diagnosis', max: 5, labelEn: '1. Diagnosis & Radiographic Interpretation', labelAr: '1. التشخيص وقراءة صور الأشعة السينية' },
                { key: 'treatmentPlan', max: 5, labelEn: '2. Treatment Plan, Isolation & Anesthesia', labelAr: '2. خطة العلاج، العزل (الحاجز المطاطي) والتخدير' },
                { key: 'execution', max: 5, labelEn: '3. Clinical Execution & Cavity Prep / Surgery', labelAr: '3. التنفيذ السريري وإتقان حواف الحشوة / الجراحة' },
                { key: 'infectionControl', max: 5, labelEn: '4. Sterilization & Infection Control Protocol', labelAr: '4. مكافحة العدوى والتعقيم وسلامة العيادة' },
                { key: 'professionalism', max: 5, labelEn: '5. Professionalism, Time & Patient Care', labelAr: '5. السلوك المهني والالتزام بالوقت وراحة المريض' }
              ].map(crit => (
                <div key={crit.key} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      {language === 'ar' ? crit.labelAr : crit.labelEn}
                    </span>
                    <span className="font-mono font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {rubric[crit.key as keyof typeof rubric]} / 5
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(score => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setRubric({ ...rubric, [crit.key]: score })}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          rubric[crit.key as keyof typeof rubric] === score 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Total Calculated Score Banner */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-900">
                    {language === 'ar' ? 'المجموع النهائي:' : 'Total Rubric Score:'}
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    {rubricPercentage >= 60 ? (language === 'ar' ? 'حالة مجتازة بنجاح' : 'Passed') : (language === 'ar' ? 'راسب - يتطلب إعادة' : 'Failed - Revision required')}
                  </div>
                </div>
                <div className="text-right rtl:text-left">
                  <div className="text-2xl font-black font-mono text-emerald-800">
                    {totalRubricScore} / 25
                  </div>
                  <div className="text-xs font-bold text-emerald-700 font-mono">
                    {rubricPercentage}%
                  </div>
                </div>
              </div>

              {/* Supervisor Comments */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ar' ? 'ملاحظات المشرف وتوجيهات التحسين:' : 'Supervisor Feedback & Notes:'}
                </label>
                <textarea
                  rows={2}
                  value={gradingComments}
                  onChange={(e) => setGradingComments(e.target.value)}
                  placeholder="e.g. Well executed contact point. Attention to gingival margin finishing..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/80">
              <button
                type="button"
                onClick={() => setGradingCase(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleGradeSubmit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'ar' ? 'اعتماد الدرجة وإرسالها للطالب' : 'Confirm Official Grade'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

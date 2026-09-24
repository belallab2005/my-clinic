import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  Filter
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

export const StudentQuotaView: React.FC = () => {
  const { subjects, cases, allUsers, currentUser, language, sections } = useClinic();

  // If student, lock to currentUser.id. If supervisor/admin, allow picking any student.
  const students = allUsers.filter(u => u.role === 'student');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentUser.role === 'student' ? currentUser.id : students[0]?.id || currentUser.id
  );

  const activeStudent = allUsers.find(u => u.id === selectedStudentId);

  // Student's completed cases
  const studentCases = cases.filter(c => c.studentId === selectedStudentId && c.status === 'completed');

  // Overall totals across all subjects
  let totalRequiredAcrossAll = 0;
  let totalCompletedAcrossAll = 0;

  subjects.forEach(sub => {
    sub.requirements.forEach(req => {
      totalRequiredAcrossAll += req.targetCount;
      const done = studentCases.filter(c => c.procedure === req.procedureType).length;
      totalCompletedAcrossAll += Math.min(done, req.targetCount);
    });
  });

  const overallPercentage = totalRequiredAcrossAll > 0 
    ? Math.round((totalCompletedAcrossAll / totalRequiredAcrossAll) * 100) 
    : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span>{language === 'ar' ? 'متطلبات المواد السريرية وتقدم الطلاب' : 'Clinical Requirements & Quota Progress'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ar' 
              ? 'متابعة إنجاز الحالات السريرية المطلوبة لكل مادة لاعتماد درجات الفصل' 
              : 'Real-time student case quota completion per clinical dental department'}
          </p>
        </div>

        {/* Student picker for supervisor / admin */}
        {currentUser.role !== 'student' && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <GraduationCap className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">{language === 'ar' ? 'طالب العيادة:' : 'Student:'}</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {language === 'ar' ? s.nameAr || s.name : s.name} ({s.studentId})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Overall Progress Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-md mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-300" />
              <span>{language === 'ar' ? 'المعدل العام للإنجاز السريري' : 'Overall Clinical Quota Achievement'}</span>
            </div>
            <h2 className="text-2xl font-black mt-1">
              {language === 'ar' ? activeStudent?.nameAr || activeStudent?.name : activeStudent?.name}
            </h2>
            <p className="text-xs text-blue-100 mt-0.5">
              {activeStudent?.studentId} · {language === 'ar' ? 'السنة الرابعة - الشعبة (أ)' : '4th Year - Section A'}
            </p>
          </div>

          <div className="text-right rtl:text-left">
            <div className="text-3xl font-black font-mono tabular-nums">
              {overallPercentage}%
            </div>
            <div className="text-xs text-blue-200 mt-0.5">
              {totalCompletedAcrossAll} / {totalRequiredAcrossAll} {language === 'ar' ? 'حالات معتمدة' : 'cases completed'}
            </div>
          </div>
        </div>

        {/* Global progress bar */}
        <div className="w-full bg-white/20 rounded-full h-3 mt-5 overflow-hidden p-0.5">
          <div 
            className="bg-white rounded-full h-full transition-all duration-500 shadow-sm"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      {/* Subject Cards Grid (PDF Section 6 specifications) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {subjects.map((sub) => {
          return (
            <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {sub.code}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">
                      {language === 'ar' ? sub.nameAr : sub.name}
                    </h3>
                  </div>
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>

                {/* Requirements for this subject */}
                <div className="space-y-4">
                  {sub.requirements.map((req, idx) => {
                    const done = studentCases.filter(c => c.procedure === req.procedureType).length;
                    const reqPct = Math.min(100, Math.round((done / req.targetCount) * 100));
                    const isCompleted = done >= req.targetCount;

                    return (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">
                            {language === 'ar' ? req.procedureTypeAr : req.procedureType}
                          </span>
                          <span className="font-mono font-bold text-blue-600">
                            {done} / {req.targetCount} {language === 'ar' ? 'حالات' : 'cases'}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${reqPct}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className={isCompleted ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-slate-500'}>
                            {isCompleted ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{language === 'ar' ? 'تم استيفاء المتطلب بنجاح' : 'Requirement Satisfied'}</span>
                              </>
                            ) : (
                              <span>
                                {language === 'ar' ? `متبقي ${req.targetCount - done} حالات إضافية` : `${req.targetCount - done} more cases needed`}
                              </span>
                            )}
                          </span>
                          <span className="font-mono text-slate-400 font-semibold">{reqPct}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-400">
                <span>{sub.academicYear}</span>
                <span>{language === 'ar' ? 'تحديث آلي مع كل اعتماد سريري' : 'Auto-synced on supervisor approval'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

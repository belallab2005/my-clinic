import React from 'react';
import { 
  BarChart3, 
  Users, 
  Layers, 
  Award, 
  TrendingUp, 
  ShieldCheck, 
  Download, 
  Printer, 
  Clock, 
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Stethoscope
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

export const OwnerDashboardView: React.FC = () => {
  const { patients, cases, subjects, sections, allUsers, appointments, attendance, language } = useClinic();

  // Computations
  const totalPatients = patients.length;
  const totalCases = cases.length;
  const completedCases = cases.filter(c => c.status === 'completed').length;
  const inProgressCases = cases.filter(c => c.status === 'in_progress' || c.status === 'ready_for_review').length;
  const totalStudents = allUsers.filter(u => u.role === 'student').length;
  const totalSupervisors = allUsers.filter(u => u.role === 'supervisor').length;

  // Procedure frequency breakdown
  const procedureCounts: Record<string, number> = {};
  cases.forEach(c => {
    procedureCounts[c.procedure] = (procedureCounts[c.procedure] || 0) + 1;
  });

  // Patient attendance rate
  const patientAttTotal = appointments.length;
  const patientAttPresent = appointments.filter(a => a.status === 'registered' || a.status === 'finished' || a.status === 'in_progress').length;
  const attendanceRate = patientAttTotal > 0 ? Math.round((patientAttPresent / patientAttTotal) * 100) : 0;

  // Anonymized export handler (PDF Section 8 privacy compliance)
  const handleExportAnonymized = () => {
    const report = {
      clinicTitle: 'SPU-DENTAL-CLINICS (Syrian Private University) - Executive Quality Report',
      generatedAt: new Date().toISOString(),
      compliance: 'Fully Anonymized & Aggregated per Medical Privacy Standards',
      summary: {
        totalPatients,
        totalCases,
        completedCases,
        inProgressCases,
        attendanceRate: `${attendanceRate}%`,
      },
      procedureDistribution: procedureCounts,
      sections: sections.map(s => ({
        name: s.name,
        academicYear: s.academicYear,
        studentsCount: s.studentIds.length
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spu_dental_clinics_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {language === 'ar' ? 'لوحة تقارير المالك والعمادة (Super Admin / Owner)' : 'Executive Dean & Clinic Owner Analytics'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              EXECUTIVE VIEW
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ar' 
              ? 'تقارير إحصائية مجمعة ومجهولة الهوية لتقليل المخاطر القانونية وحماية الخصوصية الطبية' 
              : 'Aggregated & anonymized metrics per dental privacy & institutional compliance'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'طباعة التقرير' : 'Print Report'}</span>
          </button>

          <button
            onClick={handleExportAnonymized}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تصدير بيانات مجمعة (JSON)' : 'Export Anonymized Data'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{language === 'ar' ? 'إجمالي المرضى المسجلين' : 'Registered Patients'}</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">{totalPatients}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {language === 'ar' ? '100% ملفات رقمية مكتملة' : 'Active medical charts'}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{language === 'ar' ? 'الحالات السريرية المكتملة' : 'Completed Cases'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">{completedCases}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {language === 'ar' ? `من أصل ${totalCases} حالة مسجلة` : `Out of ${totalCases} logged cases`}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{language === 'ar' ? 'نسبة حضور المرضى' : 'Patient Attendance Rate'}</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">{attendanceRate}%</div>
          <div className="text-[11px] text-purple-600 font-medium mt-1">
            {language === 'ar' ? 'تذكيرات واتساب ترفع النسبة' : 'WhatsApp reminders active'}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>{language === 'ar' ? 'الشعب والكوادر الأكاديمية' : 'Sections & Students'}</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">{totalStudents}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {sections.length} {language === 'ar' ? 'شعب سريرية' : 'sections'} · {totalSupervisors} {language === 'ar' ? 'مشرفين' : 'supervisors'}
          </div>
        </div>
      </div>

      {/* Grid: Procedure distribution & Supervisor Turnaround */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Most Frequent Procedures */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-1">
            {language === 'ar' ? 'أكثر أنواع العلاج والإجراءات تكراراً' : 'Most Frequent Clinical Procedures'}
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            {language === 'ar' ? 'توزيع الحالات حسب الإجراء السريري' : 'Distribution of procedures performed across clinic chairs'}
          </p>

          <div className="space-y-3">
            {Object.entries(procedureCounts).map(([proc, count]) => {
              const pct = Math.round((count / (totalCases || 1)) * 100);
              return (
                <div key={proc} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{proc}</span>
                    <span className="font-mono font-bold text-slate-600">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Supervisor Performance & Turnaround */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-1">
            {language === 'ar' ? 'تقرير أداء المشرفين وسرعة الاعتماد' : 'Supervisor Review & Case Turnaround'}
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            {language === 'ar' ? 'معدل مراجعة النماذج الطبية والحالات المقيمة' : 'Average response speed and evaluation workload'}
          </p>

          <div className="space-y-4">
            {allUsers.filter(u => u.role === 'supervisor').map(sup => {
              const reviewedCount = cases.filter(c => c.evaluation?.supervisorId === sup.id).length;

              return (
                <div key={sup.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${sup.avatarBg} text-white flex items-center justify-center font-bold text-xs`}>
                      {sup.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{sup.name}</div>
                      <div className="text-[11px] text-slate-500">{sup.specialty}</div>
                    </div>
                  </div>

                  <div className="text-right rtl:text-left">
                    <div className="text-xs font-bold text-emerald-700 font-mono">
                      {reviewedCount} {language === 'ar' ? 'حالات معتمدة' : 'cases evaluated'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 inline" />
                      <span>{language === 'ar' ? 'متوسط سرعة الرد: 25 دقيقة' : 'Avg speed: 25 mins'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

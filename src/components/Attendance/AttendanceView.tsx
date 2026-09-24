import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  UserCheck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  QrCode,
  GraduationCap
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { AttendanceRecord } from '../../types';

export const AttendanceView: React.FC = () => {
  const { attendance, recordAttendance, allUsers, appointments, patients, language, currentUser } = useClinic();
  const [activeType, setActiveType] = useState<'student_clinic' | 'patient_appointment'>('student_clinic');

  // Quick clock in state
  const [quickStudentId, setQuickStudentId] = useState(allUsers.find(u => u.role === 'student')?.id || '');
  const [selectedChair, setSelectedChair] = useState('Chair 01');
  const [clockInSuccess, setClockInSuccess] = useState(false);

  const students = allUsers.filter(u => u.role === 'student');

  const filteredAttendance = attendance.filter(a => a.type === activeType);

  const handleStudentClockIn = () => {
    const student = allUsers.find(u => u.id === quickStudentId);
    if (!student) return;

    recordAttendance({
      type: 'student_clinic',
      targetId: student.id,
      targetName: student.name,
      sectionName: 'Section A - 4th Year',
      date: new Date().toISOString().split('T')[0],
      chairNumber: selectedChair,
      status: 'present',
      recordedBy: currentUser.id,
      notes: 'Punctual clinic arrival recorded.'
    });

    setClockInSuccess(true);
    setTimeout(() => setClockInSuccess(false), 2500);
  };

  const handlePatientAttendanceToggle = (appId: string, status: 'present' | 'absent') => {
    const app = appointments.find(a => a.id === appId);
    const pat = patients.find(p => p.id === app?.patientId);
    if (!app || !pat) return;

    recordAttendance({
      type: 'patient_appointment',
      targetId: pat.id,
      targetName: pat.fullName,
      date: app.date,
      chairNumber: app.chairNumber,
      status,
      recordedBy: currentUser.id,
      notes: `Patient marked as ${status} for appointment ${app.reservationCode}.`
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
            <span>{language === 'ar' ? 'سجل الحضور والانضباط السريري' : 'Clinical Attendance & Discipline Log'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ar' 
              ? 'فصل سجل حضور الطلاب الأكاديمي عن حضور المرضى للمواعيد (وفقاً لمخطط النظام)' 
              : 'Separated tracking for student academic clinic sessions vs patient appointment attendance'}
          </p>
        </div>

        {/* Toggle type */}
        <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-2xs text-xs font-semibold">
          <button
            onClick={() => setActiveType('student_clinic')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeType === 'student_clinic' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{language === 'ar' ? 'حضور الطلاب بالعيادة' : 'Student Clinic Attendance'}</span>
          </button>

          <button
            onClick={() => setActiveType('patient_appointment')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
              activeType === 'patient_appointment' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{language === 'ar' ? 'حضور المرضى للمواعيد' : 'Patient Appointments'}</span>
          </button>
        </div>
      </div>

      {/* Quick Clock-In Action for Student Clinic */}
      {activeType === 'student_clinic' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {language === 'ar' ? 'تسجيل حضور سريع لجلسة العيادة (QR / بصمة / يدوي)' : 'Quick Clinic Session Check-In (QR / Manual)'}
              </h2>
            </div>
            {clockInSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                {language === 'ar' ? 'تم تسجيل الحضور بنجاح!' : 'Attendance logged!'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">{language === 'ar' ? 'اسم الطالب:' : 'Student:'}</label>
              <select
                value={quickStudentId}
                onChange={(e) => setQuickStudentId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {language === 'ar' ? s.nameAr || s.name : s.name} ({s.studentId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">{language === 'ar' ? 'الكرسي السريري:' : 'Assigned Chair:'}</label>
              <select
                value={selectedChair}
                onChange={(e) => setSelectedChair(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
              >
                <option value="Chair 01">Chair 01</option>
                <option value="Chair 02">Chair 02</option>
                <option value="Chair 03">Chair 03</option>
                <option value="Chair 04">Chair 04</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleStudentClockIn}
                className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'ar' ? 'تسجيل الحضور الآن' : 'Record Check-In'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            {activeType === 'student_clinic' 
              ? (language === 'ar' ? 'سجل حضور وانضباط الطلاب' : 'Student Clinic Logs')
              : (language === 'ar' ? 'سجل حضور المرضى للمواعيد' : 'Patient Arrival Status')}
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {filteredAttendance.length} {language === 'ar' ? 'سجلات' : 'records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">{language === 'ar' ? 'الاسم' : 'Name'}</th>
                <th className="p-3">{language === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}</th>
                <th className="p-3">{language === 'ar' ? 'الكرسي' : 'Chair'}</th>
                <th className="p-3">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="p-3">{language === 'ar' ? 'ملاحظات' : 'Notes'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAttendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{rec.targetName}</td>
                  <td className="p-3 font-mono text-slate-600">{rec.date} · {rec.time}</td>
                  <td className="p-3 font-mono font-semibold text-blue-600">{rec.chairNumber || 'N/A'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rec.status === 'present' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{rec.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

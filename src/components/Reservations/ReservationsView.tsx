import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Phone, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Plus, 
  MessageSquare,
  FileSpreadsheet,
  Stethoscope,
  Filter
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { Appointment, Patient, ProcedureType } from '../../types';

interface ReservationsViewProps {
  onOpenCheckup: (patientId: string) => void;
  onOpenNewAppointment: () => void;
  searchQuery?: string;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  onOpenCheckup,
  onOpenNewAppointment,
  searchQuery = ''
}) => {
  const { 
    appointments, 
    patients, 
    allUsers, 
    updateAppointment, 
    sendWhatsAppReminder, 
    language,
    medicalHistories 
  } = useClinic();

  const [selectedDate, setSelectedDate] = useState('2026-09-23');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(appointments[0] || null);
  const [filterChair, setFilterChair] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Distinct Chairs
  const chairs = ['Chair 01', 'Chair 02', 'Chair 03', 'Chair 04'];

  // Doctor / Student assignment map for chairs
  const chairDoctors: Record<string, string> = {
    'Chair 01': 'Drg. Bozg Mactawish (Belal Labib)',
    'Chair 02': "Drg. Jerald D'Hora (Student Clinic)",
    'Chair 03': 'Drg. Putri Larasati (Nour Al-Huda)',
    'Chair 04': 'Dr. Sarah Al-Mansoor (Supervisor Chair)'
  };

  const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

  // Filter appointments for date and search
  const filteredAppointments = appointments.filter(app => {
    if (app.date !== selectedDate) return false;
    if (filterChair !== 'all' && app.chairNumber !== filterChair) return false;
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const patient = patients.find(p => p.id === app.patientId);
      const matchesPatient = patient?.fullName.toLowerCase().includes(q) || patient?.patientCode.toLowerCase().includes(q);
      const matchesCode = app.reservationCode.toLowerCase().includes(q);
      const matchesProc = app.procedure.toLowerCase().includes(q);
      return matchesPatient || matchesCode || matchesProc;
    }

    return true;
  });

  const getPatient = (id: string): Patient | undefined => patients.find(p => p.id === id);

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'registered':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'finished':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
      case 'no_show':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'scheduled':
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleStatusChange = (appId: string, newStatus: Appointment['status']) => {
    updateAppointment(appId, { status: newStatus });
    if (selectedAppointment?.id === appId) {
      setSelectedAppointment(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const selectedPatient = selectedAppointment ? getPatient(selectedAppointment.patientId) : null;
  const selectedMedHistory = selectedPatient?.medicalHistoryId 
    ? medicalHistories.find(m => m.id === selectedPatient.medicalHistoryId) 
    : medicalHistories.find(m => m.patientId === selectedPatient?.id);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Top Controls Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left: View switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-white text-slate-900 shadow-sm">
              {language === 'ar' ? 'التقويم والجدول' : 'Calendar'}
            </button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-600 hover:text-slate-900">
              {language === 'ar' ? 'سجل الحجوزات' : 'Log History'}
            </button>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            <strong className="text-slate-900 font-mono tabular-nums">{filteredAppointments.length}</strong> {language === 'ar' ? 'مواعيد مسجلة اليوم' : 'Total appointments today'}
          </span>
        </div>

        {/* Center: Date Navigation */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
            <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>{selectedDate === '2026-09-23' ? (language === 'ar' ? 'اليوم: الأربعاء 23 سبتمبر 2026' : 'Today: Wed, 23 Sep 2026') : selectedDate}</span>
          </div>
          <button 
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

        {/* Right: Filters & Book Appointment */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterChair}
              onChange={(e) => setFilterChair(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">{language === 'ar' ? 'جميع الكراسي' : 'All Chairs'}</option>
              {chairs.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenNewAppointment}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'موعد جديد' : 'New Appointment'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Calendar Grid + Drawer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Timeline Grid */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="min-w-[760px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header row: Chairs */}
            <div className="grid grid-cols-[80px_repeat(4,1fr)] border-b border-slate-200 bg-slate-50/80 sticky top-0 z-10">
              <div className="p-3 text-center text-xs font-semibold text-slate-400 border-r rtl:border-r-0 rtl:border-l border-slate-200">
                {language === 'ar' ? 'الوقت' : 'Time'}
              </div>
              {chairs.map((chair) => (
                <div key={chair} className="p-3 border-r rtl:border-r-0 rtl:border-l border-slate-200 last:border-r-0">
                  <div className="font-bold text-xs text-slate-900">{chair}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{chairDoctors[chair]}</div>
                </div>
              ))}
            </div>

            {/* Time Rows */}
            <div className="divide-y divide-slate-100">
              {hours.map((hour) => {
                const isBreak = hour === '13:00';
                return (
                  <div key={hour} className="grid grid-cols-[80px_repeat(4,1fr)] min-h-[96px] relative">
                    {/* Hour Column */}
                    <div className="p-3 text-center text-xs font-mono text-slate-400 border-r rtl:border-r-0 rtl:border-l border-slate-200 bg-slate-50/40 select-none">
                      {hour}
                    </div>

                    {/* Chairs Cells */}
                    {chairs.map((chair) => {
                      if (isBreak) {
                        return (
                          <div 
                            key={`${hour}-${chair}`} 
                            className="p-2 border-r rtl:border-r-0 rtl:border-l border-slate-200 last:border-r-0 bg-slate-50/60 flex items-center justify-center text-[11px] text-slate-400 font-medium tracking-wide"
                          >
                            ☕ {language === 'ar' ? 'استراحة سريرية وتعقيم' : 'BREAK & STERILIZATION'}
                          </div>
                        );
                      }

                      // Find appointment in this chair around this hour
                      const app = filteredAppointments.find(a => 
                        a.chairNumber === chair && a.startTime.startsWith(hour.slice(0, 2))
                      );

                      if (!app) {
                        return (
                          <div 
                            key={`${hour}-${chair}`} 
                            onClick={onOpenNewAppointment}
                            className="p-2 border-r rtl:border-r-0 rtl:border-l border-slate-200 last:border-r-0 hover:bg-blue-50/20 transition-colors group cursor-pointer relative"
                          >
                            <span className="hidden group-hover:flex items-center justify-center text-[11px] text-blue-600 font-medium">
                              + {language === 'ar' ? 'حجز' : 'Book'}
                            </span>
                          </div>
                        );
                      }

                      const pat = getPatient(app.patientId);
                      const isSelected = selectedAppointment?.id === app.id;

                      return (
                        <div 
                          key={`${hour}-${chair}`} 
                          className="p-2 border-r rtl:border-r-0 rtl:border-l border-slate-200 last:border-r-0"
                        >
                          <div
                            onClick={() => setSelectedAppointment(app)}
                            className={`p-2.5 rounded-xl border text-left rtl:text-right cursor-pointer transition-all ${
                              isSelected ? 'ring-2 ring-blue-500 shadow-md' : 'shadow-xs hover:shadow-md'
                            } ${
                              app.status === 'finished' 
                                ? 'bg-emerald-50/60 border-emerald-200' 
                                : app.status === 'registered'
                                  ? 'bg-blue-50/60 border-blue-200'
                                  : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {language === 'ar' ? pat?.fullNameAr || pat?.fullName : pat?.fullName}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold capitalize ${getStatusColor(app.status)}`}>
                                {app.status}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="font-mono tabular-nums">{app.startTime} - {app.endTime}</span>
                            </div>

                            <div className="text-[11px] text-blue-600 font-semibold mt-1 truncate">
                              • {app.procedure}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Drawer: Appointment & Patient Details (Matches video 00:03, 00:43) */}
        {selectedAppointment && selectedPatient && (
          <aside className="w-96 bg-white border-l rtl:border-l-0 rtl:border-r border-slate-200 flex flex-col h-full shadow-lg shrink-0 overflow-y-auto z-20 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500">{selectedAppointment.reservationCode}</span>
                <span className="mx-2 text-slate-300">·</span>
                <span className="text-xs font-semibold text-blue-600">{language === 'ar' ? 'موعد سريري' : 'Clinical Appointment'}</span>
              </div>
              <button 
                onClick={() => setSelectedAppointment(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Patient Profile Card */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {selectedPatient.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">
                    {language === 'ar' ? selectedPatient.fullNameAr || selectedPatient.fullName : selectedPatient.fullName}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {selectedPatient.gender === 'male' ? (language === 'ar' ? 'ذكر' : 'Male') : (language === 'ar' ? 'أنثى' : 'Female')} · {selectedPatient.age} {language === 'ar' ? 'سنة' : 'y/o'}
                  </div>
                  {/* Medical Checkup Status Indicator */}
                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    {selectedMedHistory ? (
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        selectedMedHistory.status === 'approved' 
                          ? 'text-emerald-600' 
                          : selectedMedHistory.status === 'pending_approval' 
                            ? 'text-amber-600' 
                            : 'text-slate-500'
                      }`}>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>
                          {selectedMedHistory.status === 'approved' 
                            ? (language === 'ar' ? 'الفحص الطبي معتمد من المشرف' : 'Medical checkup approved')
                            : selectedMedHistory.status === 'pending_approval'
                              ? (language === 'ar' ? 'الفحص الطبي بانتظار الاعتماد' : 'Checkup pending review')
                              : (language === 'ar' ? 'الفحص الطبي مسودة' : 'Checkup in draft')}
                        </span>
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'لم يتم إجراء الفحص الطبي' : 'No medical checkup yet'}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Treatment & Time Details */}
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{language === 'ar' ? 'الإجراء السريري:' : 'Treatment:'}</span>
                  <span className="font-bold text-slate-900">{selectedAppointment.procedure}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{language === 'ar' ? 'الموعد والكرسي:' : 'Schedule & Chair:'}</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {selectedAppointment.date} · {selectedAppointment.startTime} ({selectedAppointment.chairNumber})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{language === 'ar' ? 'حالة الحضور والجلسة:' : 'Session Status:'}</span>
                  <select
                    value={selectedAppointment.status}
                    onChange={(e) => handleStatusChange(selectedAppointment.id, e.target.value as Appointment['status'])}
                    className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-semibold text-slate-800"
                  >
                    <option value="scheduled">{language === 'ar' ? 'مجدول' : 'Scheduled'}</option>
                    <option value="registered">{language === 'ar' ? 'سُجل حضوره' : 'Registered'}</option>
                    <option value="in_progress">{language === 'ar' ? 'قيد العلاج' : 'In Progress'}</option>
                    <option value="finished">{language === 'ar' ? 'مكتمل' : 'Finished'}</option>
                    <option value="no_show">{language === 'ar' ? 'لم يحضر' : 'No Show'}</option>
                  </select>
                </div>
              </div>

              {/* WhatsApp Reminder Button (Direct feature from video & PDF) */}
              <button
                onClick={() => sendWhatsAppReminder(selectedAppointment.id)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  selectedAppointment.reminderSent 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>
                  {selectedAppointment.reminderSent 
                    ? (language === 'ar' ? 'تم إرسال تذكير واتساب (إعادة إرسال)' : 'WhatsApp Reminder Sent (Resend)')
                    : (language === 'ar' ? 'إرسال تذكير بالموعد عبر واتساب' : 'Send WhatsApp Reminder')}
                </span>
              </button>
            </div>

            {/* General Patient Info */}
            <div className="p-4 border-b border-slate-100 space-y-2.5">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {language === 'ar' ? 'البيانات الشخصية للمريض' : 'General Info'}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'رقم الهوية الوطنية' : 'National ID'}</span>
                  <span className="font-semibold font-mono text-slate-800">{selectedPatient.nationalId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</span>
                  <span className="font-semibold font-mono text-slate-800">{selectedPatient.phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'العنوان السكني' : 'Address'}</span>
                  <span className="font-medium text-slate-700">{selectedPatient.address}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'جهة اتصال الطوارئ' : 'Emergency Contact'}</span>
                  <span className="font-medium text-slate-700">
                    {selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.relationship}) - {selectedPatient.emergencyContact.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Clinical Alert Warning Box (Critical PDF requirement) */}
            {selectedMedHistory && selectedMedHistory.clinicalAlerts.length > 0 && (
              <div className="p-4 border-b border-slate-100 bg-red-50/40 space-y-2">
                <div className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>{language === 'ar' ? 'تنبيهات سريرية حرجة للمريض' : 'Critical Clinical Alerts'}</span>
                </div>
                {selectedMedHistory.clinicalAlerts.map((alert, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-red-200 text-xs shadow-xs">
                    <div className="font-bold text-red-800">
                      {language === 'ar' ? alert.titleAr : alert.title}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      {language === 'ar' ? alert.impactAr : alert.impact}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Primary Drawer Actions (Matches video 00:03, 00:43) */}
            <div className="p-4 mt-auto space-y-2 bg-slate-50/50">
              <button
                onClick={() => onOpenCheckup(selectedPatient.id)}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 active:scale-[0.98] transition-all"
              >
                <Stethoscope className="w-4 h-4" />
                <span>
                  {selectedMedHistory 
                    ? (language === 'ar' ? 'تعديل ومعاينة الفحص الطبي (4 خطوات)' : 'Edit Medical Checkup (4 Steps)')
                    : (language === 'ar' ? 'بدء الفحص الطبي الإلزامي (4 خطوات)' : 'Start Medical Checkup (4 Steps)')}
                </span>
              </button>

              <button
                onClick={() => onOpenCheckup(selectedPatient.id)}
                className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                <span>{language === 'ar' ? 'السجل الطبي الكامل والأشعة' : 'Add / View Medical Record'}</span>
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

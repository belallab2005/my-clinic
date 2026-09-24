import React, { useState } from 'react';
import { X, Calendar, Check } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { ProcedureType } from '../../types';

interface NewAppointmentModalProps {
  onClose: () => void;
  defaultPatientId?: string;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ onClose, defaultPatientId }) => {
  const { patients, allUsers, addAppointment, language, currentUser } = useClinic();

  const [patientId, setPatientId] = useState(defaultPatientId || patients[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [chairNumber, setChairNumber] = useState('Chair 01');
  const [procedure, setProcedure] = useState<ProcedureType>('Tooth Filling');

  const students = allUsers.filter(u => u.role === 'student');
  const [assignedStudentId, setAssignedStudentId] = useState(students[0]?.id || currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;

    // Calculate end time (+1 hour)
    const hour = parseInt(startTime.slice(0, 2), 10);
    const endTime = `${String(hour + 1).padStart(2, '0')}:00`;

    addAppointment({
      patientId,
      studentId: assignedStudentId,
      supervisorId: 'usr-sup-1',
      date,
      startTime,
      endTime,
      chairNumber,
      procedure,
      status: 'scheduled',
      fee: 0,
      paymentStatus: 'free_academic',
      notes: 'University clinical educational session'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-sm text-slate-900">
              {language === 'ar' ? 'حجز موعد سريري جديد' : 'Book Clinical Appointment'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'ar' ? 'المريض:' : 'Patient:'}
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.patientCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'ar' ? 'تاريخ الموعد:' : 'Date:'}
              </label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'ar' ? 'الوقت:' : 'Start Time:'}
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono"
              >
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="14:00">02:00 PM</option>
                <option value="15:00">03:00 PM</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'ar' ? 'الكرسي السريري:' : 'Assigned Chair:'}
              </label>
              <select
                value={chairNumber}
                onChange={(e) => setChairNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
              >
                <option value="Chair 01">Chair 01</option>
                <option value="Chair 02">Chair 02</option>
                <option value="Chair 03">Chair 03</option>
                <option value="Chair 04">Chair 04</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'ar' ? 'نوع الإجراء:' : 'Procedure:'}
              </label>
              <select
                value={procedure}
                onChange={(e) => setProcedure(e.target.value as ProcedureType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
              >
                <option value="Tooth Filling">Tooth Filling</option>
                <option value="Tooth Scaling">Tooth Scaling</option>
                <option value="Tooth Extraction">Tooth Extraction</option>
                <option value="Root Canal Treatment">Root Canal</option>
                <option value="Tooth Whitening">Tooth Whitening</option>
                <option value="Dental Crown">Dental Crown</option>
                <option value="General Checkup">General Checkup</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'ar' ? 'طالب العيادة المعالج:' : 'Assigned Student:'}
            </label>
            <select
              value={assignedStudentId}
              onChange={(e) => setAssignedStudentId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.studentId})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{language === 'ar' ? 'تأكيد الموعد' : 'Confirm Booking'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

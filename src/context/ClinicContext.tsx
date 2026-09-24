import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  User,
  UserRole,
  Section,
  ClinicalSubject,
  Patient,
  MedicalHistoryForm,
  CaseTreatment,
  Appointment,
  AttendanceRecord,
  ClinicNotification,
  EvaluationGrade
} from '../types';
import { computeClinicalAlerts } from '../data/initialData';
import { supabase } from '../lib/supabaseClient';
import * as M from '../lib/mappers';

interface ClinicContextType {
  currentUser: User;
  allUsers: User[];
  sections: Section[];
  subjects: ClinicalSubject[];
  patients: Patient[];
  medicalHistories: MedicalHistoryForm[];
  cases: CaseTreatment[];
  appointments: Appointment[];
  attendance: AttendanceRecord[];
  notifications: ClinicNotification[];
  language: 'en' | 'ar';
  loading: boolean;

  // Actions
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  setLanguage: (lang: 'en' | 'ar') => void;
  addPatient: (patient: Omit<Patient, 'id' | 'patientCode' | 'registeredAt' | 'activeTreatmentsCount'>) => Promise<Patient>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  saveMedicalHistory: (data: Omit<MedicalHistoryForm, 'id' | 'createdAt' | 'updatedAt' | 'clinicalAlerts'>, idToUpdate?: string) => Promise<MedicalHistoryForm>;
  approveMedicalHistory: (id: string, approve: boolean, feedback: string) => Promise<void>;
  createCase: (data: Omit<CaseTreatment, 'id' | 'caseNumber' | 'createdAt' | 'socialShareAllowed'>) => Promise<CaseTreatment>;
  updateCase: (id: string, updates: Partial<CaseTreatment>) => Promise<void>;
  evaluateCase: (caseId: string, rubric: EvaluationGrade['rubric'], comments: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'reservationCode' | 'reminderSent'>) => Promise<Appointment>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  sendWhatsAppReminder: (appointmentId: string) => Promise<string>;
  recordAttendance: (record: Omit<AttendanceRecord, 'id' | 'time'>) => Promise<void>;
  addSection: (section: Omit<Section, 'id'>) => Promise<void>;
  addSubject: (subject: Omit<ClinicalSubject, 'id'>) => Promise<void>;
  resetToDefaults: () => void;
  markNotificationRead: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<ClinicalSubject[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicalHistories, setMedicalHistories] = useState<MedicalHistoryForm[]>([]);
  const [cases, setCases] = useState<CaseTreatment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [notifications, setNotifications] = useState<ClinicNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<'en' | 'ar'>(() => {
    // Language is a pure UI preference — fine to keep in localStorage.
    const saved = localStorage.getItem('zondenta_lang');
    return saved === 'ar' ? 'ar' : 'en';
  });

  const setLanguage = (lang: 'en' | 'ar') => {
    setLanguageState(lang);
    localStorage.setItem('zondenta_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // ---- Load everything from Supabase once we have a session ----
  const loadAll = useCallback(async () => {
    setLoading(true);
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) { setLoading(false); return; }

    const [
      { data: me },
      { data: profiles },
      { data: sec },
      { data: subj },
      { data: pat },
      { data: med },
      { data: cs },
      { data: evals },
      { data: xr },
      { data: appt },
      { data: att },
      { data: notif },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', authData.user.id).single(),
      supabase.from('profiles').select('*'),
      supabase.from('sections').select('*'),
      supabase.from('subjects').select('*'),
      supabase.from('patients').select('*').order('registered_at', { ascending: false }),
      supabase.from('medical_histories').select('*'),
      supabase.from('cases').select('*').order('created_at', { ascending: false }),
      supabase.from('evaluations').select('*'),
      supabase.from('xrays').select('*'),
      supabase.from('appointments').select('*').order('date', { ascending: false }),
      supabase.from('attendance').select('*').order('date', { ascending: false }),
      supabase.from('notifications').select('*').order('timestamp', { ascending: false }),
    ]);

    if (me) setCurrentUser(M.fromProfile(me));
    setAllUsers((profiles || []).map(M.fromProfile));
    setSections((sec || []).map(M.fromSection));
    setSubjects((subj || []).map(M.fromSubject));
    setPatients((pat || []).map(M.fromPatient));
    setMedicalHistories((med || []).map(M.fromMedHistory));

    const evalByCase = new Map((evals || []).map((e: any) => [e.case_id, e]));
    const xraysByCase = new Map<string, any[]>();
    (xr || []).forEach((x: any) => {
      if (!xraysByCase.has(x.case_id)) xraysByCase.set(x.case_id, []);
      xraysByCase.get(x.case_id)!.push(x);
    });
    setCases((cs || []).map((c: any) => M.fromCase(c, evalByCase.get(c.id), xraysByCase.get(c.id) || [])));

    setAppointments((appt || []).map(M.fromAppointment));
    setAttendance((att || []).map(M.fromAttendance));
    setNotifications((notif || []).map(M.fromNotification));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) loadAll();
      else setCurrentUser(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadAll]);

  // ---- Realtime: keep every connected device in sync ----
  useEffect(() => {
    const channel = supabase
      .channel('clinic-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medical_histories' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, loadAll)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadAll]);

  // Real identity switching requires signing in as that person — RLS is
  // keyed off the authenticated session, so it can't be faked client-side.
  // Kept as no-ops (rather than removed) so existing UI calling them doesn't
  // crash; wire these to a real "sign in as" flow or remove the demo
  // switcher UI in TopBar / DataManagementView.
  const switchUser = (_userId: string) => {
    console.warn('switchUser is a no-op with real auth. Sign out and sign in as that user instead.');
  };
  const switchRole = (_role: UserRole) => {
    console.warn('switchRole is a no-op with real auth. Sign out and sign in as that user instead.');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // ---------------- Actions ----------------
  const addPatient = async (data: Omit<Patient, 'id' | 'patientCode' | 'registeredAt' | 'activeTreatmentsCount'>): Promise<Patient> => {
    const patientCode = `RS#WA${Date.now().toString().slice(-6)}`;
    const { data: row, error } = await supabase.from('patients').insert({
      ...M.toPatient(data as Partial<Patient>),
      patient_code: patientCode,
      active_treatments_count: 0,
      status: 'active',
    }).select().single();
    if (error) throw error;
    const newPatient = M.fromPatient(row);
    setPatients(prev => [newPatient, ...prev]);

    await supabase.from('notifications').insert(M.toNotification({
      title: 'New Patient Registered',
      titleAr: 'تسجيل مريض جديد',
      message: `${newPatient.fullName} registered by ${currentUser?.name}.`,
      messageAr: `تم تسجيل المريض ${newPatient.fullNameAr || newPatient.fullName} بواسطة ${currentUser?.nameAr || currentUser?.name}.`,
      type: 'appointment',
      targetRole: 'all',
      linkTab: 'patients',
    }));

    return newPatient;
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    const { error } = await supabase.from('patients').update(M.toPatient(updates)).eq('id', id);
    if (error) throw error;
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const saveMedicalHistory = async (
    data: Omit<MedicalHistoryForm, 'id' | 'createdAt' | 'updatedAt' | 'clinicalAlerts'>,
    idToUpdate?: string
  ): Promise<MedicalHistoryForm> => {
    const alerts = computeClinicalAlerts(data as any);
    const payload = M.toMedHistory({ ...data, clinicalAlerts: alerts });

    if (idToUpdate) {
      const { data: row, error } = await supabase.from('medical_histories')
        .update(payload).eq('id', idToUpdate).select().single();
      if (error) throw error;
      const updated = M.fromMedHistory(row);
      setMedicalHistories(prev => prev.map(m => m.id === idToUpdate ? updated : m));
      await updatePatient(data.patientId, { medicalHistoryId: idToUpdate });
      return updated;
    }

    const { data: row, error } = await supabase.from('medical_histories')
      .insert(payload).select().single();
    if (error) throw error;
    const newForm = M.fromMedHistory(row);
    setMedicalHistories(prev => [newForm, ...prev]);
    await updatePatient(data.patientId, { medicalHistoryId: newForm.id });

    if (newForm.status === 'pending_approval') {
      const patient = patients.find(p => p.id === data.patientId);
      await supabase.from('notifications').insert(M.toNotification({
        title: 'Medical Checkup Needs Approval',
        titleAr: 'فحص طبي بانتظار اعتماد المشرف',
        message: `Medical form for ${patient?.fullName || 'Patient'} submitted with ${alerts.length} clinical alerts.`,
        messageAr: `تم تقديم الفحص الطبي للمريض ${patient?.fullNameAr || 'المريض'} متضمناً ${alerts.length} تنبيهات سريرية.`,
        type: 'medical_approval',
        targetRole: 'supervisor',
        linkTab: 'approvals',
        linkId: newForm.id,
      }));
    }
    return newForm;
  };

  const approveMedicalHistory = async (id: string, approve: boolean, feedback: string) => {
    const now = new Date().toISOString();
    const { data: row, error } = await supabase.from('medical_histories').update({
      status: approve ? 'approved' : 'rejected',
      supervisor_feedback: feedback,
      approved_at: approve ? now : null,
      supervisor_id: currentUser?.id,
      updated_at: now,
    }).eq('id', id).select().single();
    if (error) throw error;
    const updated = M.fromMedHistory(row);
    setMedicalHistories(prev => prev.map(m => m.id === id ? updated : m));

    const patient = patients.find(p => p.id === updated.patientId);
    await supabase.from('notifications').insert(M.toNotification({
      title: approve ? 'Medical History Approved' : 'Medical History Needs Revision',
      titleAr: approve ? 'تم اعتماد التاريخ الطبي' : 'طلب تعديل على التاريخ الطبي',
      message: `${approve ? 'Approved' : 'Revision requested'} for patient ${patient?.fullName || 'Patient'}: "${feedback}"`,
      messageAr: `${approve ? 'تم اعتماد' : 'طلب تعديل'} الفحص الطبي للمريض ${patient?.fullNameAr || 'المريض'}: "${feedback}"`,
      type: 'medical_approval',
      targetRole: 'student',
      targetUserId: updated.studentId,
      linkTab: 'checkup',
      linkId: id,
    }));
  };

  const createCase = async (data: Omit<CaseTreatment, 'id' | 'caseNumber' | 'createdAt' | 'socialShareAllowed'>): Promise<CaseTreatment> => {
    const medHistory = medicalHistories.find(m => m.patientId === data.patientId);
    const socialAllowed = Boolean(medHistory?.publishConsentAgreed);
    const caseNumber = `CAS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const { data: row, error } = await supabase.from('cases').insert({
      ...M.toCase(data as Partial<CaseTreatment>),
      case_number: caseNumber,
      social_share_allowed: socialAllowed,
    }).select().single();
    if (error) throw error;
    const newCase = M.fromCase(row);
    setCases(prev => [newCase, ...prev]);

    await updatePatient(data.patientId, {
      activeTreatmentsCount: (patients.find(p => p.id === data.patientId)?.activeTreatmentsCount || 0) + 1,
      status: 'in_treatment',
    });

    return newCase;
  };

  const updateCase = async (id: string, updates: Partial<CaseTreatment>) => {
    const { error } = await supabase.from('cases').update(M.toCase(updates)).eq('id', id);
    if (error) throw error;
    setCases(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const evaluateCase = async (caseId: string, rubric: EvaluationGrade['rubric'], comments: string) => {
    const total = rubric.diagnosis + rubric.treatmentPlan + rubric.execution + rubric.infectionControl + rubric.professionalism;
    const percentage = Math.round((total / 25) * 100);
    const passed = percentage >= 60;
    const now = new Date().toISOString();
    const targetedCase = cases.find(c => c.id === caseId);
    if (!targetedCase) return;

    const { data: evalRow, error } = await supabase.from('evaluations').insert({
      case_id: caseId,
      supervisor_id: currentUser?.id,
      supervisor_name: currentUser?.name,
      student_id: targetedCase.studentId,
      rubric, total_score: total, percentage, comments, passed,
    }).select().single();
    if (error) throw error;

    await updateCase(caseId, {
      status: passed ? 'completed' : 'revision_requested',
      completedAt: passed ? now.split('T')[0] : undefined,
    });
    const evaluation = M.fromEvaluation(evalRow);
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, evaluation } : c));

    await supabase.from('notifications').insert(M.toNotification({
      title: `Case Evaluated: ${percentage}%`,
      titleAr: `تم تقييم الحالة: ${percentage}%`,
      message: `Supervisor ${currentUser?.name} marked case ${targetedCase.caseNumber} with ${total}/25.`,
      messageAr: `قام المشرف ${currentUser?.nameAr || currentUser?.name} برصد درجة للحالة ${targetedCase.caseNumber} بمجموع ${total}/25.`,
      type: 'case_evaluation',
      targetRole: 'student',
      targetUserId: targetedCase.studentId,
      linkTab: 'treatments',
      linkId: caseId,
    }));
  };

  const addAppointment = async (data: Omit<Appointment, 'id' | 'reservationCode' | 'reminderSent'>): Promise<Appointment> => {
    const code = `RS#WA${Date.now().toString().slice(-6)}`;
    const { data: row, error } = await supabase.from('appointments').insert({
      ...M.toAppointment(data as Partial<Appointment>),
      reservation_code: code,
      reminder_sent: false,
    }).select().single();
    if (error) throw error;
    const newApp = M.fromAppointment(row);
    setAppointments(prev => [newApp, ...prev]);
    return newApp;
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    const { error } = await supabase.from('appointments').update(M.toAppointment(updates)).eq('id', id);
    if (error) throw error;
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAppointment = async (id: string) => {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) throw error;
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const sendWhatsAppReminder = async (appointmentId: string): Promise<string> => {
    const app = appointments.find(a => a.id === appointmentId);
    if (!app) return '';
    const patient = patients.find(p => p.id === app.patientId);
    const student = allUsers.find(u => u.id === app.studentId);
    const phone = patient?.whatsapp || patient?.phone.replace(/[^0-9]/g, '') || '123456789';

    const textEn = `Hello ${patient?.fullName || 'Patient'},\nThis is a friendly reminder for your dental appointment at the University Dental Clinics.\n📅 Date: ${app.date}\n⏰ Time: ${app.startTime} - ${app.endTime}\n📍 Location: Dental Clinic Floor 2, ${app.chairNumber}\n👨‍⚕️ Provider: Dr./Student ${student?.name || 'Clinic Team'}\nProcedure: ${app.procedure}\nPlease arrive 10 minutes prior to your session. If you need to reschedule, reply to this message.`;
    const textAr = `مرحباً بك ${patient?.fullNameAr || patient?.fullName || 'عزيزي المريض'},\nنود تذكيرك بموعدك القادم في عيادات كلية طب الأسنان الجامعية.\n📅 التاريخ: ${app.date}\n⏰ الوقت: ${app.startTime} - ${app.endTime}\n📍 العيادة: الطابق الثاني - ${app.chairNumber}\n👨‍⚕️ الطبيب المعالج: ${student?.nameAr || student?.name || 'فريق العيادة'}\nنوع العلاج: ${app.procedure}\nيرجى الحضور قبل الموعد بـ 10 دقائق.`;
    const message = language === 'ar' ? textAr : textEn;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    await updateAppointment(appointmentId, { reminderSent: true });
    window.open(url, '_blank');
    return url;
  };

  const recordAttendance = async (data: Omit<AttendanceRecord, 'id' | 'time'>) => {
    const { data: row, error } = await supabase.from('attendance').insert({
      ...M.toAttendance(data as Partial<AttendanceRecord>),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }).select().single();
    if (error) throw error;
    setAttendance(prev => [M.fromAttendance(row), ...prev]);
  };

  const addSection = async (sectionData: Omit<Section, 'id'>) => {
    const { data: row, error } = await supabase.from('sections').insert(M.toSection(sectionData)).select().single();
    if (error) throw error;
    setSections(prev => [...prev, M.fromSection(row)]);
  };

  const addSubject = async (subjectData: Omit<ClinicalSubject, 'id'>) => {
    const { data: row, error } = await supabase.from('subjects').insert(M.toSubject(subjectData)).select().single();
    if (error) throw error;
    setSubjects(prev => [...prev, M.fromSubject(row)]);
  };

  // With a shared server database, "reset to defaults" would wipe data for
  // every user of the clinic — deliberately disabled. Reseed via SQL/seed
  // script in a dev/staging Supabase project instead.
  const resetToDefaults = () => {
    console.warn('resetToDefaults is disabled — this would erase shared server data for every user.');
  };

  const markNotificationRead = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error) throw error;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  if (!currentUser) {
    // Session resolved but no profile yet (or still loading) — caller
    // (App.tsx) is responsible for showing the login screen in this case.
    return loading ? null : <>{children}</>;
  }

  return (
    <ClinicContext.Provider value={{
      currentUser,
      allUsers,
      sections,
      subjects,
      patients,
      medicalHistories,
      cases,
      appointments,
      attendance,
      notifications,
      language,
      loading,
      switchUser,
      switchRole,
      setLanguage,
      addPatient,
      updatePatient,
      saveMedicalHistory,
      approveMedicalHistory,
      createCase,
      updateCase,
      evaluateCase,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      sendWhatsAppReminder,
      recordAttendance,
      addSection,
      addSubject,
      resetToDefaults,
      markNotificationRead,
      signOut,
    }}>
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) throw new Error('useClinic must be used within a ClinicProvider');
  return context;
};

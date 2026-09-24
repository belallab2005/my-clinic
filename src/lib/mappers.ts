// Thin snake_case (Postgres) <-> camelCase (app) mappers.
// Keeping these in one place means the rest of the app never has to
// know or care that the data now lives in Postgres instead of localStorage.
import {
  User, Section, ClinicalSubject, Patient, MedicalHistoryForm,
  CaseTreatment, Appointment, AttendanceRecord, ClinicNotification,
  EvaluationGrade, XRayImage
} from '../types';

export const fromProfile = (r: any): User => ({
  id: r.id, name: r.name, nameAr: r.name_ar, email: r.email, role: r.role,
  title: r.title, titleAr: r.title_ar, avatarBg: r.avatar_bg,
  studentId: r.student_id, sectionId: r.section_id, specialty: r.specialty, phone: r.phone,
});

export const fromSection = (r: any): Section => ({
  id: r.id, name: r.name, nameAr: r.name_ar, academicYear: r.academic_year,
  supervisorIds: r.supervisor_ids || [], studentIds: r.student_ids || [],
});
export const toSection = (s: Partial<Section>) => ({
  name: s.name, name_ar: s.nameAr, academic_year: s.academicYear,
  supervisor_ids: s.supervisorIds, student_ids: s.studentIds,
});

export const fromSubject = (r: any): ClinicalSubject => ({
  id: r.id, name: r.name, nameAr: r.name_ar, code: r.code,
  academicYear: r.academic_year, requirements: r.requirements || [],
});
export const toSubject = (s: Partial<ClinicalSubject>) => ({
  name: s.name, name_ar: s.nameAr, code: s.code,
  academic_year: s.academicYear, requirements: s.requirements,
});

export const fromPatient = (r: any): Patient => ({
  id: r.id, patientCode: r.patient_code, fullName: r.full_name, fullNameAr: r.full_name_ar,
  gender: r.gender, age: r.age, birthDate: r.birth_date, phone: r.phone, whatsapp: r.whatsapp,
  nationalId: r.national_id, address: r.address, emergencyContact: r.emergency_contact || { name: '', relationship: '', phone: '' },
  assignedStudentId: r.assigned_student_id, medicalHistoryId: r.medical_history_id,
  activeTreatmentsCount: r.active_treatments_count, registeredAt: r.registered_at, status: r.status,
});
export const toPatient = (p: Partial<Patient>) => ({
  patient_code: p.patientCode, full_name: p.fullName, full_name_ar: p.fullNameAr,
  gender: p.gender, age: p.age, birth_date: p.birthDate, phone: p.phone, whatsapp: p.whatsapp,
  national_id: p.nationalId, address: p.address, emergency_contact: p.emergencyContact,
  assigned_student_id: p.assignedStudentId, medical_history_id: p.medicalHistoryId,
  active_treatments_count: p.activeTreatmentsCount, registered_at: p.registeredAt, status: p.status,
});

export const fromMedHistory = (r: any): MedicalHistoryForm => ({
  id: r.id, patientId: r.patient_id, studentId: r.student_id, supervisorId: r.supervisor_id,
  status: r.status, supervisorFeedback: r.supervisor_feedback, approvedAt: r.approved_at,
  createdAt: r.created_at, updatedAt: r.updated_at,
  bloodPressureSystolic: r.blood_pressure_systolic, bloodPressureDiastolic: r.blood_pressure_diastolic,
  sicknesses: r.sicknesses || {}, currentMedications: r.current_medications || {}, allergies: r.allergies || {},
  femaleQuestions: r.female_questions || undefined,
  chiefComplaint: r.chief_complaint, chiefComplaintAr: r.chief_complaint_ar, visitReason: r.visit_reason,
  lastDentalVisitDate: r.last_dental_visit_date, gumBleeding: r.gum_bleeding, dentalPhobia: r.dental_phobia,
  previousAnesthesiaIssues: r.previous_anesthesia_issues,
  occlusion: r.occlusion, torusPalatinus: r.torus_palatinus, torusMandibularis: r.torus_mandibularis,
  palatum: r.palatum, anomalousTeethNotes: r.anomalous_teeth_notes, gingivalCondition: r.gingival_condition,
  treatmentConsentAgreed: r.treatment_consent_agreed, treatmentConsentDate: r.treatment_consent_date,
  patientSignatureText: r.patient_signature_text,
  publishConsentAgreed: r.publish_consent_agreed, publishConsentDate: r.publish_consent_date,
  clinicalAlerts: r.clinical_alerts || [],
});
export const toMedHistory = (m: Partial<MedicalHistoryForm>) => ({
  patient_id: m.patientId, student_id: m.studentId, supervisor_id: m.supervisorId,
  status: m.status, supervisor_feedback: m.supervisorFeedback, approved_at: m.approvedAt,
  blood_pressure_systolic: m.bloodPressureSystolic, blood_pressure_diastolic: m.bloodPressureDiastolic,
  sicknesses: m.sicknesses, current_medications: m.currentMedications, allergies: m.allergies,
  female_questions: m.femaleQuestions ?? null,
  chief_complaint: m.chiefComplaint, chief_complaint_ar: m.chiefComplaintAr, visit_reason: m.visitReason,
  last_dental_visit_date: m.lastDentalVisitDate || null, gum_bleeding: m.gumBleeding, dental_phobia: m.dentalPhobia,
  previous_anesthesia_issues: m.previousAnesthesiaIssues,
  occlusion: m.occlusion, torus_palatinus: m.torusPalatinus, torus_mandibularis: m.torusMandibularis,
  palatum: m.palatum, anomalous_teeth_notes: m.anomalousTeethNotes, gingival_condition: m.gingivalCondition,
  treatment_consent_agreed: m.treatmentConsentAgreed, treatment_consent_date: m.treatmentConsentDate || null,
  patient_signature_text: m.patientSignatureText,
  publish_consent_agreed: m.publishConsentAgreed, publish_consent_date: m.publishConsentDate || null,
  clinical_alerts: m.clinicalAlerts, updated_at: new Date().toISOString(),
});

export const fromCase = (r: any, evalRow?: any, xrayRows: any[] = []): CaseTreatment => ({
  id: r.id, caseNumber: r.case_number, patientId: r.patient_id, studentId: r.student_id,
  supervisorId: r.supervisor_id, subjectId: r.subject_id, toothNumber: r.tooth_number,
  condition: r.condition, procedure: r.procedure, procedureAr: r.procedure_ar, status: r.status,
  createdAt: r.created_at, completedAt: r.completed_at, notes: r.notes,
  xrays: xrayRows.map(fromXray), evaluation: evalRow ? fromEvaluation(evalRow) : undefined,
  socialShareAllowed: r.social_share_allowed,
});
export const toCase = (c: Partial<CaseTreatment>) => ({
  case_number: c.caseNumber, patient_id: c.patientId, student_id: c.studentId, supervisor_id: c.supervisorId,
  subject_id: c.subjectId, tooth_number: c.toothNumber, condition: c.condition, procedure: c.procedure,
  procedure_ar: c.procedureAr, status: c.status, completed_at: c.completedAt || null, notes: c.notes,
  social_share_allowed: c.socialShareAllowed,
});

export const fromXray = (r: any): XRayImage => ({
  id: r.id, type: r.type, title: r.title, titleAr: r.title_ar, url: r.url,
  uploadedAt: r.uploaded_at, notes: r.notes,
});

export const fromEvaluation = (r: any): EvaluationGrade => ({
  id: r.id, caseId: r.case_id, supervisorId: r.supervisor_id, supervisorName: r.supervisor_name,
  studentId: r.student_id, evaluatedAt: r.evaluated_at, rubric: r.rubric,
  totalScore: r.total_score, percentage: r.percentage, comments: r.comments, passed: r.passed,
});

export const fromAppointment = (r: any): Appointment => ({
  id: r.id, reservationCode: r.reservation_code, patientId: r.patient_id, studentId: r.student_id,
  supervisorId: r.supervisor_id, chairNumber: r.chair_number, date: r.date,
  startTime: r.start_time?.slice(0, 5), endTime: r.end_time?.slice(0, 5), procedure: r.procedure,
  status: r.status, fee: Number(r.fee), paymentStatus: r.payment_status, notes: r.notes,
  reminderSent: r.reminder_sent,
});
export const toAppointment = (a: Partial<Appointment>) => ({
  reservation_code: a.reservationCode, patient_id: a.patientId, student_id: a.studentId,
  supervisor_id: a.supervisorId, chair_number: a.chairNumber, date: a.date,
  start_time: a.startTime, end_time: a.endTime, procedure: a.procedure, status: a.status,
  fee: a.fee, payment_status: a.paymentStatus, notes: a.notes, reminder_sent: a.reminderSent,
});

export const fromAttendance = (r: any): AttendanceRecord => ({
  id: r.id, type: r.type, targetId: r.target_id, targetName: r.target_name,
  sectionName: r.section_name, date: r.date, time: r.time, chairNumber: r.chair_number,
  status: r.status, recordedBy: r.recorded_by, notes: r.notes,
});
export const toAttendance = (a: Partial<AttendanceRecord>) => ({
  type: a.type, target_id: a.targetId, target_name: a.targetName, section_name: a.sectionName,
  date: a.date, time: a.time, chair_number: a.chairNumber, status: a.status,
  recorded_by: a.recordedBy, notes: a.notes,
});

export const fromNotification = (r: any): ClinicNotification => ({
  id: r.id, title: r.title, titleAr: r.title_ar, message: r.message, messageAr: r.message_ar,
  type: r.type, targetRole: r.target_role, targetUserId: r.target_user_id,
  timestamp: r.timestamp, read: r.read, linkTab: r.link_tab, linkId: r.link_id,
});
export const toNotification = (n: Partial<ClinicNotification>) => ({
  title: n.title, title_ar: n.titleAr, message: n.message, message_ar: n.messageAr,
  type: n.type, target_role: n.targetRole, target_user_id: n.targetUserId,
  link_tab: n.linkTab, link_id: n.linkId,
});

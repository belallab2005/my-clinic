export type UserRole = 'super_admin' | 'supervisor' | 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  nameAr?: string;
  email: string;
  role: UserRole;
  title: string;
  titleAr?: string;
  avatarBg: string;
  studentId?: string;
  sectionId?: string;
  specialty?: string;
  phone?: string;
}

export interface Section {
  id: string;
  name: string;
  nameAr: string;
  academicYear: string;
  supervisorIds: string[];
  studentIds: string[];
}

export interface ClinicalSubject {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  academicYear: string;
  requirements: {
    procedureType: string;
    procedureTypeAr: string;
    targetCount: number;
  }[];
}

export interface ClinicalAlert {
  type: 'danger' | 'warning' | 'info';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  impact: string;
  impactAr: string;
}

export interface MedicalHistoryForm {
  id: string;
  patientId: string;
  studentId: string;
  supervisorId?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  supervisorFeedback?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;

  // Step 1: Medical Data
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  sicknesses: {
    heartDisease: boolean;
    hypertension: boolean;
    diabetes: boolean;
    hba1cLevel?: string;
    respiratoryDisease: boolean; // Asthma, COPD
    liverKidneyDisease: boolean; // Hepatitis, Renal
    bleedingDisorder: boolean; // Anemia, Hemophilia
    strokeEpilepsy: boolean;
    cancerTumor: boolean;
    recentSurgeryHospitalization: boolean;
    otherNotes: string;
  };
  currentMedications: {
    bloodThinners: boolean; // Warfarin, Aspirin
    bisphosphonates: boolean; // Fosamax, etc.
    bloodPressureMeds: boolean;
    diabetesMeds: boolean;
    otherList: string;
  };
  allergies: {
    localAnesthesia: boolean; // Lidocaine, Articaine
    penicillin: boolean;
    latex: boolean;
    nsaidsAspirin: boolean;
    otherDetails: string;
  };
  femaleQuestions?: {
    isPregnant: boolean;
    pregnancyMonth?: number;
    isLactating: boolean;
  };

  // Step 2: Oral & Dental History
  chiefComplaint: string;
  chiefComplaintAr?: string;
  visitReason: string;
  lastDentalVisitDate: string;
  gumBleeding: boolean;
  dentalPhobia: 'none' | 'mild' | 'severe';
  previousAnesthesiaIssues: boolean;

  // Step 3: Oral Check & Anatomical Findings
  occlusion: 'normal' | 'cross_bite' | 'deep_bite' | 'open_bite';
  torusPalatinus: 'none' | 'small' | 'medium' | 'large';
  torusMandibularis: 'none' | 'left' | 'right' | 'both';
  palatum: 'normal' | 'high' | 'flat';
  anomalousTeethNotes: string;
  gingivalCondition: 'healthy' | 'mild_gingivitis' | 'periodontitis';

  // Step 4: Digital Agreements & Consents (Separated per PDF specs!)
  treatmentConsentAgreed: boolean;
  treatmentConsentDate?: string;
  patientSignatureText: string;

  // CRITICAL SEPARATE CONSENT: Academic/Social Media sharing
  publishConsentAgreed: boolean;
  publishConsentDate?: string;

  // Calculated alerts
  clinicalAlerts: ClinicalAlert[];
}

export type ToothCondition = 
  | 'healthy'
  | 'caries'
  | 'filled'
  | 'crown'
  | 'missing'
  | 'rct'
  | 'extracted'
  | 'impacted';

export type ProcedureType = 
  | 'Tooth Filling'
  | 'Tooth Whitening'
  | 'Tooth Scaling'
  | 'Root Canal Treatment'
  | 'Tooth Extraction'
  | 'Dental Crown'
  | 'Periodontal Curettage'
  | 'Fluoride Application'
  | 'Oral Examination';

export interface XRayImage {
  id: string;
  type: 'pre_op' | 'post_op' | 'bitewing' | 'periapical' | 'panoramic';
  title: string;
  titleAr?: string;
  url: string;
  uploadedAt: string;
  notes?: string;
}

export interface EvaluationGrade {
  id: string;
  caseId: string;
  supervisorId: string;
  supervisorName: string;
  studentId: string;
  evaluatedAt: string;
  rubric: {
    diagnosis: number; // 0-5
    treatmentPlan: number; // 0-5
    execution: number; // 0-5
    infectionControl: number; // 0-5
    professionalism: number; // 0-5
  };
  totalScore: number; // 0-25
  percentage: number;
  comments: string;
  passed: boolean;
}

export interface CaseTreatment {
  id: string;
  caseNumber: string;
  patientId: string;
  studentId: string;
  supervisorId?: string;
  subjectId: string;
  toothNumber: number; // FDI 11-48 or 51-85
  condition: ToothCondition;
  procedure: ProcedureType;
  procedureAr?: string;
  status: 'planned' | 'in_progress' | 'ready_for_review' | 'completed' | 'revision_requested';
  createdAt: string;
  completedAt?: string;
  notes: string;
  xrays: XRayImage[];
  evaluation?: EvaluationGrade;
  socialShareAllowed: boolean; // Derived strictly from patient's separate publish consent
}

export interface Patient {
  id: string;
  patientCode: string;
  fullName: string;
  fullNameAr: string;
  gender: 'male' | 'female';
  age: number;
  birthDate: string;
  phone: string;
  whatsapp: string;
  nationalId: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  assignedStudentId: string;
  medicalHistoryId?: string;
  activeTreatmentsCount: number;
  registeredAt: string;
  status: 'active' | 'in_treatment' | 'completed';
}

export interface Appointment {
  id: string;
  reservationCode: string;
  patientId: string;
  studentId: string;
  supervisorId: string;
  chairNumber: string; // e.g., "Chair 01", "Chair 04"
  date: string; // YYYY-MM-DD
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  procedure: ProcedureType;
  status: 'scheduled' | 'registered' | 'in_progress' | 'finished' | 'cancelled' | 'no_show';
  fee: number;
  paymentStatus: 'paid' | 'pending' | 'free_academic';
  notes: string;
  reminderSent: boolean;
}

export interface AttendanceRecord {
  id: string;
  type: 'student_clinic' | 'patient_appointment';
  targetId: string; // studentId or patientId
  targetName: string;
  sectionName?: string;
  date: string;
  time: string;
  chairNumber?: string;
  status: 'present' | 'absent' | 'excused' | 'late';
  recordedBy: string; // supervisorId or studentId
  notes?: string;
}

export interface ClinicNotification {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  type: 'medical_approval' | 'case_evaluation' | 'appointment' | 'clinical_alert' | 'quota';
  targetRole: UserRole | 'all';
  targetUserId?: string;
  timestamp: string;
  read: boolean;
  linkTab?: string;
  linkId?: string;
}

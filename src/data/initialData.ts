import { 
  User, 
  Section, 
  ClinicalSubject, 
  Patient, 
  MedicalHistoryForm, 
  CaseTreatment, 
  Appointment, 
  AttendanceRecord,
  ClinicNotification,
  ClinicalAlert
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-owner',
    name: 'Dr. David Steward',
    nameAr: 'د. عميد الكلية والمالك',
    email: 'owner@spu.edu.sy',
    role: 'super_admin',
    title: 'Dean & Clinic Director (Owner)',
    titleAr: 'عميد كلية طب الأسنان ومدير العيادات',
    avatarBg: 'bg-emerald-700',
    specialty: 'Clinical Operations & Oral Surgery',
    phone: '+963 11 987 6543'
  },
  {
    id: 'user-supervisor',
    name: 'Dr. Sarah Al-Mansoor',
    nameAr: 'د. سارة المنصور',
    email: 'supervisor@spu.edu.sy',
    role: 'supervisor',
    title: 'Clinical Supervisor (Restorative & Endo)',
    titleAr: 'مشرفة سريرية (المداواة الترميمية واللبية)',
    avatarBg: 'bg-indigo-600',
    sectionId: 'sec-a',
    specialty: 'Conservative & Endodontics',
    phone: '+963 94 412 3456'
  },
  {
    id: 'user-student',
    name: 'Belal Labib',
    nameAr: 'بلال لبيب',
    email: 'student@spu.edu.sy',
    role: 'student',
    title: '4th Year Dental Student',
    titleAr: 'طالب طب أسنان - سنة رابعة سريرية',
    avatarBg: 'bg-blue-600',
    studentId: 'SPU-DEN-2026-4401',
    sectionId: 'sec-a',
    phone: '+963 93 355 7788'
  },
  {
    id: 'user-admin',
    name: 'Clinic Reception & Admin',
    nameAr: 'موظف الاستقبال والعيادات',
    email: 'admin@spu.edu.sy',
    role: 'admin',
    title: 'Front Desk & Reception Officer',
    titleAr: 'موظف تنظيم المواعيد والاستقبال',
    avatarBg: 'bg-slate-700',
    phone: '+963 11 555 4433'
  }
];

export const INITIAL_SECTIONS: Section[] = [
  {
    id: 'sec-a',
    name: 'Section A - 4th Year Clinical',
    nameAr: 'الشعبة (أ) - السنة الرابعة السريرية',
    academicYear: '2025/2026',
    supervisorIds: ['user-supervisor'],
    studentIds: ['user-student', 'user-student-2']
  },
  {
    id: 'sec-b',
    name: 'Section B - 5th Year Comprehensive',
    nameAr: 'الشعبة (ب) - السنة الخامسة الشاملة',
    academicYear: '2025/2026',
    supervisorIds: ['user-supervisor'],
    studentIds: []
  }
];

export const INITIAL_SUBJECTS: ClinicalSubject[] = [
  {
    id: 'sub-cons',
    name: 'Operative & Restorative Dentistry',
    nameAr: 'طب الأسنان الترميمي والمداواة السنية',
    code: 'CONS-401',
    academicYear: '4th Year',
    requirements: [
      { procedureType: 'Tooth Filling', procedureTypeAr: 'حشوات تجميلية وملغمية', targetCount: 5 }
    ]
  },
  {
    id: 'sub-surg',
    name: 'Oral & Maxillofacial Surgery',
    nameAr: 'جراحة الفم والأسنان والتخدير',
    code: 'SURG-402',
    academicYear: '4th Year',
    requirements: [
      { procedureType: 'Tooth Extraction', procedureTypeAr: 'قلع جراحي وبسيط', targetCount: 2 }
    ]
  },
  {
    id: 'sub-perio',
    name: 'Periodontology & Oral Medicine',
    nameAr: 'أمراض وجراحة اللثة وطب الفم',
    code: 'PERIO-403',
    academicYear: '4th Year',
    requirements: [
      { procedureType: 'Tooth Scaling', procedureTypeAr: 'تقليح وتنظيف عميق للثة', targetCount: 3 }
    ]
  },
  {
    id: 'sub-endo',
    name: 'Endodontics',
    nameAr: 'علاج جذور وأعصاب الأسنان',
    code: 'ENDO-404',
    academicYear: '4th Year',
    requirements: [
      { procedureType: 'Root Canal Treatment', procedureTypeAr: 'معالجة لبية كاملة', targetCount: 2 }
    ]
  }
];

export function computeClinicalAlerts(form: Partial<MedicalHistoryForm>): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];

  // 1. Warfarin / Aspirin / Anticoagulants
  if (form.currentMedications?.bloodThinners || form.sicknesses?.bleedingDisorder) {
    alerts.push({
      type: 'danger',
      title: 'Bleeding Risk / Anticoagulant Alert',
      titleAr: 'خطر نزيف حاد / مسيلات دم',
      description: 'Patient is on Blood Thinners (Warfarin/Aspirin) or has bleeding tendencies.',
      descriptionAr: 'المريض يتناول مسيلات دم (أسبرين/وارفارين) أو لديه اضطراب نزفي. يلزم فحص INR قبل أي جراحة.',
      impact: 'Critical during extractions, surgical flaps, or subgingival scaling.',
      impactAr: 'خطر حرج أثناء القلع أو الجراحة اللثوية أو التخدير الكتلي.'
    });
  }

  // 2. Bisphosphonates
  if (form.currentMedications?.bisphosphonates) {
    alerts.push({
      type: 'danger',
      title: 'MRONJ Risk / Bisphosphonate Therapy',
      titleAr: 'خطر النخر العظمي الفكي (MRONJ)',
      description: 'Patient takes bisphosphonates for osteoporosis or bone therapy.',
      descriptionAr: 'يتناول المريض أدوية البيسفوسفونات (هشاشة عظام). خطر نخر عظام الفك غير القابل للشفاء.',
      impact: 'Avoid extractions if possible; consult oral surgeon before invasive bone procedures.',
      impactAr: 'تجنب القلع الجراحي قدر الإمكان واستشر أخصائي جراحة الوجه والفكين.'
    });
  }

  // 3. Allergies (Local anesthesia or Latex)
  if (form.allergies?.localAnesthesia) {
    alerts.push({
      type: 'danger',
      title: 'Local Anesthesia Allergy',
      titleAr: 'تحذير حرج: حساسية مخدر موضعي',
      description: 'Documented reaction to dental local anesthetics (Amide/Ester).',
      descriptionAr: 'تحسس موثق من البنج الموضعي للأسنان. ممنوع حقن البنج المعتاد.',
      impact: 'Absolute contraindication for standard Lidocaine/Articaine without allergist testing.',
      impactAr: 'مانع مطلق لاستخدام الليدوكائين التقليدي دون استشارة حساسية مسبقة.'
    });
  }

  if (form.allergies?.latex) {
    alerts.push({
      type: 'warning',
      title: 'Latex Allergy',
      titleAr: 'حساسية مادة اللاتكس',
      description: 'Allergic reaction to latex gloves and rubber dam sheets.',
      descriptionAr: 'حساسية من القفازات ومطاط الحاجز المطاطي (Rubber Dam).',
      impact: 'Use Nitrile gloves and non-latex rubber dam only.',
      impactAr: 'استخدم قفازات نتريل وحاجز مطاطي خالي من اللاتكس حصراً.'
    });
  }

  if (form.allergies?.penicillin) {
    alerts.push({
      type: 'warning',
      title: 'Penicillin Allergy',
      titleAr: 'حساسية البنسلين ومضادات البيتا لاكتام',
      description: 'Allergic to penicillin family antibiotics.',
      descriptionAr: 'حساسية من مركبات البنسلين والاموكسيسيلين. تجنب وصف أوجمنتين.',
      impact: 'Prescribe Clindamycin or Azithromycin if antibiotic prophylaxis needed.',
      impactAr: 'استبدل بكليندامايسين أو أزيثرومايسين عند الحاجة لمضاد حيوي.'
    });
  }

  // 4. Blood pressure
  const sys = form.bloodPressureSystolic || 120;
  const dia = form.bloodPressureDiastolic || 80;
  if (sys >= 160 || dia >= 100) {
    alerts.push({
      type: 'danger',
      title: `Severe Hypertension (${sys}/${dia} mmHg)`,
      titleAr: `ارتفاع حاد بضغط الدم (${sys}/${dia} مم زئبق)`,
      description: 'Stage 2 severe hypertension detected at chairside triage.',
      descriptionAr: 'ضغط دم مرتفع جداً في العيادة. خطر أزمة فرط ضغط الدم.',
      impact: 'Postpone elective dental treatments; avoid vasoconstrictors (Epinephrine).',
      impactAr: 'تأجيل الإجراءات غير الطارئة وتجنب المقبضات الوعائية كالإبينفرين.'
    });
  } else if (sys >= 140 || dia >= 90) {
    alerts.push({
      type: 'warning',
      title: `Elevated Blood Pressure (${sys}/${dia} mmHg)`,
      titleAr: `ضغط دم مرتفع (${sys}/${dia} مم زئبق)`,
      description: 'Stage 1 hypertension. Monitor vitals before injecting anesthesia.',
      descriptionAr: 'ارتفاع متوسط بالضغط. قم بإعادة القياس قبل التخدير.',
      impact: 'Limit Epinephrine to maximum 2 dental cartridges (0.04mg).',
      impactAr: 'الحد الأقصى للإبينفرين هو أمبولتان فقط.'
    });
  }

  // 5. Diabetes
  if (form.sicknesses?.diabetes) {
    alerts.push({
      type: 'warning',
      title: 'Diabetes Mellitus',
      titleAr: 'مرض السكري',
      description: `Patient is diabetic${form.sicknesses.hba1cLevel ? ` (Last HbA1c: ${form.sicknesses.hba1cLevel})` : ''}.`,
      descriptionAr: `المريض مصاب بالسكري${form.sicknesses.hba1cLevel ? ` (آخر فحص تراكمي: ${form.sicknesses.hba1cLevel})` : ''}.`,
      impact: 'Higher susceptibility to periodontal infections and delayed wound healing.',
      impactAr: 'عرضة أكبر للعدوى وبطء التئام الجروح اللثوية.'
    });
  }

  // 6. Pregnancy
  if (form.femaleQuestions?.isPregnant) {
    alerts.push({
      type: 'warning',
      title: `Pregnancy (Month ${form.femaleQuestions.pregnancyMonth || 'Unknown'})`,
      titleAr: `حمل (الشهر ${form.femaleQuestions.pregnancyMonth || 'غير محدد'})`,
      description: 'Patient is pregnant. Safe trimester considerations apply.',
      descriptionAr: 'المريضة حامل. تتطلب حذر الأشعة والأدوية والجلوس بكرسي العيادة.',
      impact: 'Avoid 1st trimester non-emergency care; avoid NSAIDs & certain antibiotics; protect with lead apron.',
      impactAr: 'تجنب الإشعاع دون واقي رصاصي؛ تجنب مسكنات البروفين والأسبرين.'
    });
  }

  return alerts;
}

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    patientCode: 'RS#WA0011',
    fullName: 'Christopher Smallwood',
    fullNameAr: 'كريستوفر سمولوود',
    gender: 'male',
    age: 21,
    birthDate: '2004-01-21',
    phone: '+1 (555) 321-4567',
    whatsapp: '15553214567',
    nationalId: 'NAT-4991028',
    address: '4551 Lynn Ogden Lane, Beaumont, TX 77701',
    emergencyContact: {
      name: 'Eleanor Smallwood',
      relationship: 'Mother',
      phone: '+1 (555) 888-9900'
    },
    assignedStudentId: 'user-student',
    medicalHistoryId: 'med-1',
    activeTreatmentsCount: 2,
    registeredAt: '2026-03-10',
    status: 'in_treatment'
  },
  {
    id: 'pat-2',
    patientCode: 'RS#WA0012',
    fullName: 'Mariam Al-Khalil',
    fullNameAr: 'مريم الخليل',
    gender: 'female',
    age: 34,
    birthDate: '1992-07-14',
    phone: '+966 50 444 8899',
    whatsapp: '966504448899',
    nationalId: '1099238411',
    address: 'King Fahd Road, Riyadh',
    emergencyContact: {
      name: 'Tariq Al-Khalil',
      relationship: 'Spouse',
      phone: '+966 50 111 2233'
    },
    assignedStudentId: 'user-student',
    medicalHistoryId: 'med-2',
    activeTreatmentsCount: 1,
    registeredAt: '2026-03-14',
    status: 'in_treatment'
  },
  {
    id: 'pat-3',
    patientCode: 'RS#WA0013',
    fullName: 'Fahad Al-Otaibi',
    fullNameAr: 'فهد العتيبي',
    gender: 'male',
    age: 58,
    birthDate: '1968-11-03',
    phone: '+966 55 777 2211',
    whatsapp: '966557772211',
    nationalId: '1044781290',
    address: 'Al-Malaz District, Building 40, Riyadh',
    emergencyContact: {
      name: 'Saud Al-Otaibi',
      relationship: 'Son',
      phone: '+966 55 999 1122'
    },
    assignedStudentId: 'user-student',
    medicalHistoryId: 'med-3',
    activeTreatmentsCount: 1,
    registeredAt: '2026-03-18',
    status: 'in_treatment'
  },
  {
    id: 'pat-4',
    patientCode: 'RS#WA0014',
    fullName: 'Sarah Hendrika',
    fullNameAr: 'سارة هندريكا',
    gender: 'female',
    age: 26,
    birthDate: '2000-04-19',
    phone: '+1 (555) 765-4321',
    whatsapp: '15557654321',
    nationalId: 'NAT-8199201',
    address: '210 University Boulevard, Austin, TX',
    emergencyContact: {
      name: 'Mark Hendrika',
      relationship: 'Brother',
      phone: '+1 (555) 332-1100'
    },
    assignedStudentId: 'user-student-2',
    medicalHistoryId: 'med-4',
    activeTreatmentsCount: 1,
    registeredAt: '2026-03-20',
    status: 'active'
  }
];

export const INITIAL_MEDICAL_HISTORIES: MedicalHistoryForm[] = [
  {
    id: 'med-1',
    patientId: 'pat-1',
    studentId: 'user-student',
    supervisorId: 'user-supervisor',
    status: 'approved',
    supervisorFeedback: 'Medical history validated. Note the mild aspirin usage; verify INR before deep curettage.',
    approvedAt: '2026-03-11T10:30:00Z',
    createdAt: '2026-03-10T09:15:00Z',
    updatedAt: '2026-03-11T10:30:00Z',
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    sicknesses: {
      heartDisease: false,
      hypertension: false,
      diabetes: false,
      respiratoryDisease: false,
      liverKidneyDisease: false,
      bleedingDisorder: false,
      strokeEpilepsy: false,
      cancerTumor: false,
      recentSurgeryHospitalization: false,
      otherNotes: 'No major systemic diseases.'
    },
    currentMedications: {
      bloodThinners: true, // Aspirin 81mg daily
      bisphosphonates: false,
      bloodPressureMeds: false,
      diabetesMeds: false,
      otherList: 'Baby Aspirin 81mg (cardioprotective prophylactic)'
    },
    allergies: {
      localAnesthesia: false,
      penicillin: false,
      latex: true, // Latex allergy!
      nsaidsAspirin: false,
      otherDetails: 'Mild contact dermatitis with latex gloves.'
    },
    chiefComplaint: 'Pain on biting and sensitivity to cold water on upper right molar.',
    chiefComplaintAr: 'ألم عند المضغ وحساسية للماء البارد في الضرس العلوي الأيمن.',
    visitReason: 'Restorative treatment & general checkup',
    lastDentalVisitDate: '2025-06-15',
    gumBleeding: true,
    dentalPhobia: 'mild',
    previousAnesthesiaIssues: false,
    occlusion: 'normal',
    torusPalatinus: 'none',
    torusMandibularis: 'none',
    palatum: 'normal',
    anomalousTeethNotes: 'Normal anatomy; crowding on lower anterior teeth.',
    gingivalCondition: 'mild_gingivitis',
    treatmentConsentAgreed: true,
    treatmentConsentDate: '2026-03-10',
    patientSignatureText: 'Christopher Smallwood',
    publishConsentAgreed: true, // Consented to clinical academic sharing
    publishConsentDate: '2026-03-10',
    clinicalAlerts: [
      {
        type: 'danger',
        title: 'Bleeding Risk / Anticoagulant Alert',
        titleAr: 'خطر نزيف حاد / مسيلات دم',
        description: 'Patient takes prophylactic Aspirin 81mg daily.',
        descriptionAr: 'المريض يتناول بيبي أسبرين وقائي يومياً. مراعاة النزف اللثوي.',
        impact: 'Monitor hemostasis during subgingival scaling.',
        impactAr: 'مراقبة التخثر اللثوي أثناء التقليح وتنظيف الجذور.'
      },
      {
        type: 'warning',
        title: 'Latex Allergy',
        titleAr: 'حساسية مادة اللاتكس',
        description: 'Allergic contact reaction to latex material.',
        descriptionAr: 'حساسية تماسية مع مادة اللاتكس.',
        impact: 'Use Nitrile gloves & latex-free dental dams.',
        impactAr: 'استخدم قفازات نتريل وحاجز مطاطي خالي من اللاتكس.'
      }
    ]
  },
  {
    id: 'med-2',
    patientId: 'pat-2',
    studentId: 'user-student',
    supervisorId: 'user-supervisor',
    status: 'pending_approval',
    supervisorFeedback: undefined,
    createdAt: '2026-03-14T11:00:00Z',
    updatedAt: '2026-03-14T11:00:00Z',
    bloodPressureSystolic: 145,
    bloodPressureDiastolic: 92,
    sicknesses: {
      heartDisease: false,
      hypertension: true,
      diabetes: false,
      respiratoryDisease: false,
      liverKidneyDisease: false,
      bleedingDisorder: false,
      strokeEpilepsy: false,
      cancerTumor: false,
      recentSurgeryHospitalization: false,
      otherNotes: 'Controlled hypertension on Amlodipine.'
    },
    currentMedications: {
      bloodThinners: false,
      bisphosphonates: false,
      bloodPressureMeds: true,
      diabetesMeds: false,
      otherList: 'Amlodipine 5mg once daily'
    },
    allergies: {
      localAnesthesia: false,
      penicillin: true, // Penicillin allergic!
      latex: false,
      nsaidsAspirin: false,
      otherDetails: 'Anaphylactic rash with Amoxicillin in childhood.'
    },
    femaleQuestions: {
      isPregnant: false,
      isLactating: true
    },
    chiefComplaint: 'Food impaction between lower left molars and bleeding gums.',
    chiefComplaintAr: 'انحشار الطعام بين الأضراس السفلية اليسرى ونزيف باللثة.',
    visitReason: 'Checkup and scaling',
    lastDentalVisitDate: '2024-11-20',
    gumBleeding: true,
    dentalPhobia: 'none',
    previousAnesthesiaIssues: false,
    occlusion: 'normal',
    torusPalatinus: 'small',
    torusMandibularis: 'none',
    palatum: 'normal',
    anomalousTeethNotes: 'Slight palatal torus observed.',
    gingivalCondition: 'mild_gingivitis',
    treatmentConsentAgreed: true,
    treatmentConsentDate: '2026-03-14',
    patientSignatureText: 'Mariam Al-Khalil',
    publishConsentAgreed: false, // CRITICAL: Refused social media consent!
    publishConsentDate: undefined,
    clinicalAlerts: [
      {
        type: 'warning',
        title: 'Penicillin Allergy',
        titleAr: 'حساسية البنسلين',
        description: 'Severe allergy to Penicillin / Amoxicillin family.',
        descriptionAr: 'حساسية مؤكدة من البنسلين ومشتقاته.',
        impact: 'Do not prescribe Augmentin; use Clindamycin if indicated.',
        impactAr: 'ممنوع وصف مركبات الأموكسيسيلين نهائياً.'
      },
      {
        type: 'warning',
        title: 'Elevated Blood Pressure (145/92 mmHg)',
        titleAr: 'ضغط دم مرتفع (145/92 مم زئبق)',
        description: 'Mild Stage 1 hypertension measured today.',
        descriptionAr: 'ضغط دم مرتفع المرحلة الأولى.',
        impact: 'Limit Epinephrine in dental local anesthesia to max 2 carpules.',
        impactAr: 'الحد الأقصى للتخدير المحتوي على أدرينالين هو كربولتان.'
      }
    ]
  },
  {
    id: 'med-3',
    patientId: 'pat-3',
    studentId: 'user-student',
    status: 'approved',
    approvedAt: '2026-03-19T09:00:00Z',
    supervisorFeedback: 'INR report verified (INR = 2.1). Simple extraction of root remnant on #46 approved with local hemostatic sponge.',
    createdAt: '2026-03-18T14:00:00Z',
    updatedAt: '2026-03-19T09:00:00Z',
    bloodPressureSystolic: 135,
    bloodPressureDiastolic: 85,
    sicknesses: {
      heartDisease: true, // Atrial fibrillation
      hypertension: true,
      diabetes: false,
      respiratoryDisease: false,
      liverKidneyDisease: false,
      bleedingDisorder: true,
      strokeEpilepsy: false,
      cancerTumor: false,
      recentSurgeryHospitalization: true,
      otherNotes: 'Atrial fibrillation, cardiac stent placed 3 years ago.'
    },
    currentMedications: {
      bloodThinners: true, // Warfarin!
      bisphosphonates: false,
      bloodPressureMeds: true,
      diabetesMeds: false,
      otherList: 'Warfarin 3mg daily, Lisinopril 10mg'
    },
    allergies: {
      localAnesthesia: false,
      penicillin: false,
      latex: false,
      nsaidsAspirin: false,
      otherDetails: 'None known'
    },
    chiefComplaint: 'Broken tooth with sharp edge causing cheek pain.',
    chiefComplaintAr: 'سن مكسور ذو حافة حادة يسبب ألم وجرح بالخد.',
    visitReason: 'Extraction of retained root',
    lastDentalVisitDate: '2025-01-10',
    gumBleeding: false,
    dentalPhobia: 'mild',
    previousAnesthesiaIssues: false,
    occlusion: 'normal',
    torusPalatinus: 'none',
    torusMandibularis: 'both',
    palatum: 'normal',
    anomalousTeethNotes: 'Bilateral mandibular tori present.',
    gingivalCondition: 'healthy',
    treatmentConsentAgreed: true,
    treatmentConsentDate: '2026-03-18',
    patientSignatureText: 'Fahad Al-Otaibi',
    publishConsentAgreed: true,
    publishConsentDate: '2026-03-18',
    clinicalAlerts: [
      {
        type: 'danger',
        title: 'High Bleeding Risk / Warfarin Therapy',
        titleAr: 'خطر نزيف حرج / علاج الوارفارين',
        description: 'Patient is on therapeutic anticoagulation for AFib.',
        descriptionAr: 'المريض يتناول الوارفارين بانتظام للرجفان الأذيني.',
        impact: 'Surgicel sponge & sutures required immediately post-extraction.',
        impactAr: 'يلزم خياطة الجرح وإسفنجة تخثر ليدوية وتجنب الترويض الحاد.'
      }
    ]
  }
];

export const INITIAL_CASES: CaseTreatment[] = [
  {
    id: 'case-1',
    caseNumber: 'CAS-2026-001',
    patientId: 'pat-1',
    studentId: 'user-student',
    supervisorId: 'user-supervisor',
    subjectId: 'sub-cons',
    toothNumber: 16, // FDI: Upper Right 1st Molar
    condition: 'caries',
    procedure: 'Tooth Filling',
    procedureAr: 'حشوة مركبة (كومبوزيت) سن 16',
    status: 'completed',
    createdAt: '2026-03-12',
    completedAt: '2026-03-15',
    notes: 'Class II MO Composite restoration on tooth #16. Cavity depth 2.5mm, bonded with 7th gen adhesive, shade A2.',
    xrays: [
      {
        id: 'xr-1',
        type: 'pre_op',
        title: 'Pre-Operative Bitewing #16',
        titleAr: 'أشعة أجنحة الإطباق قبل العلاج',
        url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
        uploadedAt: '2026-03-12'
      },
      {
        id: 'xr-2',
        type: 'post_op',
        title: 'Post-Operative Periapical #16',
        titleAr: 'أشعة ذروية بعد إنهاء الحشوة',
        url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
        uploadedAt: '2026-03-15'
      }
    ],
    evaluation: {
      id: 'eval-1',
      caseId: 'case-1',
      supervisorId: 'user-supervisor',
      supervisorName: 'Dr. Sarah Al-Mansoor',
      studentId: 'user-student',
      evaluatedAt: '2026-03-15',
      rubric: {
        diagnosis: 5,
        treatmentPlan: 5,
        execution: 4,
        infectionControl: 5,
        professionalism: 5
      },
      totalScore: 24,
      percentage: 96,
      comments: 'Excellent rubber dam isolation and anatomical contact point recreation. Margins well polished.',
      passed: true
    },
    socialShareAllowed: true
  },
  {
    id: 'case-2',
    caseNumber: 'CAS-2026-002',
    patientId: 'pat-1',
    studentId: 'user-student',
    supervisorId: 'user-supervisor',
    subjectId: 'sub-cons',
    toothNumber: 26, // FDI: Upper Left 1st Molar
    condition: 'caries',
    procedure: 'Tooth Filling',
    procedureAr: 'حشوة كلاس 1 سن 26',
    status: 'in_progress',
    createdAt: '2026-03-15',
    notes: 'Class I Occlusal caries. Caries excavation completed, pending composite layering under supervisor supervision.',
    xrays: [],
    socialShareAllowed: true
  },
  {
    id: 'case-3',
    caseNumber: 'CAS-2026-003',
    patientId: 'pat-1',
    studentId: 'user-student',
    supervisorId: 'user-supervisor',
    subjectId: 'sub-perio',
    toothNumber: 31, // Lower anterior
    condition: 'caries',
    procedure: 'Tooth Scaling',
    procedureAr: 'تنظيف وتقليح لثوي كامل',
    status: 'completed',
    createdAt: '2026-03-11',
    completedAt: '2026-03-11',
    notes: 'Full mouth ultrasonic supra and subgingival scaling. Patient motivated on flossing.',
    xrays: [],
    evaluation: {
      id: 'eval-2',
      caseId: 'case-3',
      supervisorId: 'user-supervisor',
      supervisorName: 'Dr. Sarah Al-Mansoor',
      studentId: 'user-student',
      evaluatedAt: '2026-03-11',
      rubric: {
        diagnosis: 4,
        treatmentPlan: 4,
        execution: 4,
        infectionControl: 5,
        professionalism: 5
      },
      totalScore: 22,
      percentage: 88,
      comments: 'Good ultrasonic tip angulation. Remember to polish with non-abrasive paste next time.',
      passed: true
    },
    socialShareAllowed: true
  },
  {
    id: 'case-4',
    caseNumber: 'CAS-2026-004',
    patientId: 'pat-3',
    studentId: 'user-student',
    supervisorId: 'user-supervisor',
    subjectId: 'sub-surg',
    toothNumber: 46, // Lower right 1st molar
    condition: 'extracted',
    procedure: 'Tooth Extraction',
    procedureAr: 'قلع جذر سن 46',
    status: 'completed',
    createdAt: '2026-03-19',
    completedAt: '2026-03-19',
    notes: 'Extraction of retained roots of #46 under 2% Lidocaine with 1:100,000 Epinephrine. Hemostatic sponge placed, 3-0 silk suture.',
    xrays: [],
    evaluation: {
      id: 'eval-3',
      caseId: 'case-4',
      supervisorId: 'user-supervisor',
      supervisorName: 'Dr. Sarah Al-Mansoor',
      studentId: 'user-student',
      evaluatedAt: '2026-03-19',
      rubric: {
        diagnosis: 5,
        treatmentPlan: 5,
        execution: 5,
        infectionControl: 5,
        professionalism: 5
      },
      totalScore: 25,
      percentage: 100,
      comments: 'Flawless surgical management of patient on anticoagulants. Suture secure and bleeding fully controlled.',
      passed: true
    },
    socialShareAllowed: true
  },
  {
    id: 'case-5',
    caseNumber: 'CAS-2026-005',
    patientId: 'pat-2',
    studentId: 'user-student',
    supervisorId: 'user-supervisor',
    subjectId: 'sub-cons',
    toothNumber: 36, // Lower left 1st molar
    condition: 'caries',
    procedure: 'Tooth Filling',
    procedureAr: 'حشوة كلاس 2 سن 36',
    status: 'ready_for_review',
    createdAt: '2026-03-21',
    notes: 'MO Composite restoration completed today. Needs final supervisor evaluation and grading.',
    xrays: [],
    socialShareAllowed: false // Patient opted out of social share!
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-1',
    reservationCode: 'RS#WA0011',
    patientId: 'pat-1',
    studentId: 'user-student',
    supervisorId: 'user-supervisor',
    chairNumber: 'Chair 01',
    date: '2026-09-23', // Today!
    startTime: '09:00',
    endTime: '10:00',
    procedure: 'Tooth Filling',
    status: 'registered',
    fee: 0,
    paymentStatus: 'free_academic',
    notes: 'Continue composite restoration on tooth #26.',
    reminderSent: true
  },
  {
    id: 'app-2',
    reservationCode: 'RS#WA0012',
    patientId: 'pat-2',
    studentId: 'user-student',
    supervisorId: 'user-supervisor',
    chairNumber: 'Chair 01',
    date: '2026-09-23', // Today!
    startTime: '10:30',
    endTime: '11:30',
    procedure: 'Tooth Scaling',
    status: 'scheduled',
    fee: 0,
    paymentStatus: 'free_academic',
    notes: 'Checkup & full mouth prophylaxis after medical approval.',
    reminderSent: true
  },
  {
    id: 'app-3',
    reservationCode: 'RS#WA0013',
    patientId: 'pat-3',
    studentId: 'user-student',
    supervisorId: 'user-supervisor',
    chairNumber: 'Chair 02',
    date: '2026-09-23', // Today!
    startTime: '13:00',
    endTime: '14:00',
    procedure: 'Oral Examination',
    status: 'scheduled',
    fee: 0,
    paymentStatus: 'free_academic',
    notes: 'Suture removal post-extraction check.',
    reminderSent: false
  },
  {
    id: 'app-4',
    reservationCode: 'RS#WA0014',
    patientId: 'pat-4',
    studentId: 'user-student-2',
    supervisorId: 'user-supervisor',
    chairNumber: 'Chair 03',
    date: '2026-09-23',
    startTime: '09:30',
    endTime: '10:45',
    procedure: 'Tooth Whitening',
    status: 'finished',
    fee: 50,
    paymentStatus: 'paid',
    notes: 'Chairside cosmetic bleaching session completed.',
    reminderSent: true
  },
  {
    id: 'app-5',
    reservationCode: 'RS#WA0015',
    patientId: 'pat-1',
    studentId: 'user-student',
    supervisorId: 'user-supervisor',
    chairNumber: 'Chair 01',
    date: '2026-09-24',
    startTime: '10:00',
    endTime: '11:00',
    procedure: 'Tooth Filling',
    status: 'scheduled',
    fee: 0,
    paymentStatus: 'free_academic',
    notes: 'Follow-up polishing & occlusion check.',
    reminderSent: false
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    type: 'student_clinic',
    targetId: 'user-student',
    targetName: 'Belal Labib',
    sectionName: 'Section A - 4th Year',
    date: '2026-09-23',
    time: '08:45 AM',
    chairNumber: 'Chair 01',
    status: 'present',
    recordedBy: 'user-supervisor',
    notes: 'Punctual with full sterile PPE & dental armamentarium kit.'
  },
  {
    id: 'att-2',
    type: 'student_clinic',
    targetId: 'user-student-2',
    targetName: 'Nour Al-Huda',
    sectionName: 'Section A - 4th Year',
    date: '2026-09-23',
    time: '08:55 AM',
    chairNumber: 'Chair 03',
    status: 'present',
    recordedBy: 'user-supervisor',
    notes: 'On time for morning surgical clinic.'
  },
  {
    id: 'att-3',
    type: 'patient_appointment',
    targetId: 'pat-1',
    targetName: 'Christopher Smallwood',
    date: '2026-09-23',
    time: '08:50 AM',
    chairNumber: 'Chair 01',
    status: 'present',
    recordedBy: 'user-student',
    notes: 'Arrived 10 mins early in reception waiting lobby.'
  }
];

export const INITIAL_NOTIFICATIONS: ClinicNotification[] = [
  {
    id: 'notif-1',
    title: 'Medical History Needs Review',
    titleAr: 'نموذج تاريخ طبي بانتظار الاعتماد',
    message: 'Student Belal Labib submitted Medical Checkup for patient Mariam Al-Khalil (Hypertension / Penicillin Alert).',
    messageAr: 'قام الطالب بلال لبيب بتقديم الفحص الطبي للمريضة مريم الخليل (تنبيه ضغط / بنسلين).',
    type: 'medical_approval',
    targetRole: 'supervisor',
    timestamp: '2026-09-23T08:30:00Z',
    read: false,
    linkTab: 'approvals'
  },
  {
    id: 'notif-2',
    title: 'Case Ready for Grading',
    titleAr: 'حالة سريرية جاهزة للتقييم والرصد',
    message: 'Case CAS-2026-005 (Class II MO tooth #36) completed and submitted for grading.',
    messageAr: 'تم إنهاء الحالة CAS-2026-005 للسن 36 وبانتظار التقييم ووضع الدرجة.',
    type: 'case_evaluation',
    targetRole: 'supervisor',
    timestamp: '2026-09-23T09:15:00Z',
    read: false,
    linkTab: 'grading'
  },
  {
    id: 'notif-3',
    title: 'Critical Clinical Alert Registered',
    titleAr: 'تسجيل تنبيه سريري حرج',
    message: 'Patient Fahad Al-Otaibi is taking Warfarin (Anticoagulant). Verify INR before surgery.',
    messageAr: 'المريض فهد العتيبي يتناول الوارفارين (مسيل دم). يلزم فحص INR قبل أي تدخل جراحي.',
    type: 'clinical_alert',
    targetRole: 'all',
    timestamp: '2026-09-22T14:00:00Z',
    read: true,
    linkTab: 'patients'
  }
];

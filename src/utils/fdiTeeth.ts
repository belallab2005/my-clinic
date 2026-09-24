export interface ToothData {
  fdi: number;
  universal: number;
  nameEn: string;
  nameAr: string;
  arch: 'maxillary' | 'mandibular';
  quadrant: 1 | 2 | 3 | 4;
  type: 'incisor' | 'canine' | 'premolar' | 'molar';
}

export const ADULT_TEETH: ToothData[] = [
  // Upper Right (Quadrant 1) - FDI 18 to 11
  { fdi: 18, universal: 1, nameEn: 'Upper Right 3rd Molar (Wisdom)', nameAr: 'رحى ثالثة علوية يمنى (عقل)', arch: 'maxillary', quadrant: 1, type: 'molar' },
  { fdi: 17, universal: 2, nameEn: 'Upper Right 2nd Molar', nameAr: 'رحى ثانية علوية يمنى', arch: 'maxillary', quadrant: 1, type: 'molar' },
  { fdi: 16, universal: 3, nameEn: 'Upper Right 1st Molar', nameAr: 'رحى أولى علوية يمنى', arch: 'maxillary', quadrant: 1, type: 'molar' },
  { fdi: 15, universal: 4, nameEn: 'Upper Right 2nd Premolar', nameAr: 'ضاحك ثانٍ علوي أيمن', arch: 'maxillary', quadrant: 1, type: 'premolar' },
  { fdi: 14, universal: 5, nameEn: 'Upper Right 1st Premolar', nameAr: 'ضاحك أول علوي أيمن', arch: 'maxillary', quadrant: 1, type: 'premolar' },
  { fdi: 13, universal: 6, nameEn: 'Upper Right Canine', nameAr: 'ناب علوي أيمن', arch: 'maxillary', quadrant: 1, type: 'canine' },
  { fdi: 12, universal: 7, nameEn: 'Upper Right Lateral Incisor', nameAr: 'رباعية علوية يمنى', arch: 'maxillary', quadrant: 1, type: 'incisor' },
  { fdi: 11, universal: 8, nameEn: 'Upper Right Central Incisor', nameAr: 'ثنية علوية يمنى', arch: 'maxillary', quadrant: 1, type: 'incisor' },

  // Upper Left (Quadrant 2) - FDI 21 to 28
  { fdi: 21, universal: 9, nameEn: 'Upper Left Central Incisor', nameAr: 'ثنية علوية يسرى', arch: 'maxillary', quadrant: 2, type: 'incisor' },
  { fdi: 22, universal: 10, nameEn: 'Upper Left Lateral Incisor', nameAr: 'رباعية علوية يسرى', arch: 'maxillary', quadrant: 2, type: 'incisor' },
  { fdi: 23, universal: 11, nameEn: 'Upper Left Canine', nameAr: 'ناب علوي أيسر', arch: 'maxillary', quadrant: 2, type: 'canine' },
  { fdi: 24, universal: 12, nameEn: 'Upper Left 1st Premolar', nameAr: 'ضاحك أول علوي أيسر', arch: 'maxillary', quadrant: 2, type: 'premolar' },
  { fdi: 25, universal: 13, nameEn: 'Upper Left 2nd Premolar', nameAr: 'ضاحك ثانٍ علوي أيسر', arch: 'maxillary', quadrant: 2, type: 'premolar' },
  { fdi: 26, universal: 14, nameEn: 'Upper Left 1st Molar', nameAr: 'رحى أولى علوية يسرى', arch: 'maxillary', quadrant: 2, type: 'molar' },
  { fdi: 27, universal: 15, nameEn: 'Upper Left 2nd Molar', nameAr: 'رحى ثانية علوية يسرى', arch: 'maxillary', quadrant: 2, type: 'molar' },
  { fdi: 28, universal: 16, nameEn: 'Upper Left 3rd Molar (Wisdom)', nameAr: 'رحى ثالثة علوية يسرى (عقل)', arch: 'maxillary', quadrant: 2, type: 'molar' },

  // Lower Left (Quadrant 3) - FDI 38 to 31
  { fdi: 38, universal: 17, nameEn: 'Lower Left 3rd Molar (Wisdom)', nameAr: 'رحى ثالثة سفلية يسرى (عقل)', arch: 'mandibular', quadrant: 3, type: 'molar' },
  { fdi: 37, universal: 18, nameEn: 'Lower Left 2nd Molar', nameAr: 'رحى ثانية سفلية يسرى', arch: 'mandibular', quadrant: 3, type: 'molar' },
  { fdi: 36, universal: 19, nameEn: 'Lower Left 1st Molar', nameAr: 'رحى أولى سفلية يسرى', arch: 'mandibular', quadrant: 3, type: 'molar' },
  { fdi: 35, universal: 20, nameEn: 'Lower Left 2nd Premolar', nameAr: 'ضاحك ثانٍ سفلي أيسر', arch: 'mandibular', quadrant: 3, type: 'premolar' },
  { fdi: 34, universal: 21, nameEn: 'Lower Left 1st Premolar', nameAr: 'ضاحك أول سفلي أيسر', arch: 'mandibular', quadrant: 3, type: 'premolar' },
  { fdi: 33, universal: 22, nameEn: 'Lower Left Canine', nameAr: 'ناب سفلي أيسر', arch: 'mandibular', quadrant: 3, type: 'canine' },
  { fdi: 32, universal: 23, nameEn: 'Lower Left Lateral Incisor', nameAr: 'رباعية سفلية يسرى', arch: 'mandibular', quadrant: 3, type: 'incisor' },
  { fdi: 31, universal: 24, nameEn: 'Lower Left Central Incisor', nameAr: 'ثنية سفلية يسرى', arch: 'mandibular', quadrant: 3, type: 'incisor' },

  // Lower Right (Quadrant 4) - FDI 41 to 48
  { fdi: 41, universal: 25, nameEn: 'Lower Right Central Incisor', nameAr: 'ثنية سفلية يمنى', arch: 'mandibular', quadrant: 4, type: 'incisor' },
  { fdi: 42, universal: 26, nameEn: 'Lower Right Lateral Incisor', nameAr: 'رباعية سفلية يمنى', arch: 'mandibular', quadrant: 4, type: 'incisor' },
  { fdi: 43, universal: 27, nameEn: 'Lower Right Canine', nameAr: 'ناب سفلي أيمن', arch: 'mandibular', quadrant: 4, type: 'canine' },
  { fdi: 44, universal: 28, nameEn: 'Lower Right 1st Premolar', nameAr: 'ضاحك أول سفلي أيمن', arch: 'mandibular', quadrant: 4, type: 'premolar' },
  { fdi: 45, universal: 29, nameEn: 'Lower Right 2nd Premolar', nameAr: 'ضاحك ثانٍ سفلي أيمن', arch: 'mandibular', quadrant: 4, type: 'premolar' },
  { fdi: 46, universal: 30, nameEn: 'Lower Right 1st Molar', nameAr: 'رحى أولى سفلية يمنى', arch: 'mandibular', quadrant: 4, type: 'molar' },
  { fdi: 47, universal: 31, nameEn: 'Lower Right 2nd Molar', nameAr: 'رحى ثانية سفلية يمنى', arch: 'mandibular', quadrant: 4, type: 'molar' },
  { fdi: 48, universal: 32, nameEn: 'Lower Right 3rd Molar (Wisdom)', nameAr: 'رحى ثالثة سفلية يمنى (عقل)', arch: 'mandibular', quadrant: 4, type: 'molar' }
];

export const TOOTH_CONDITIONS_CONFIG = {
  healthy: { labelEn: 'Healthy / Sound', labelAr: 'سليم', color: '#10B981', border: '#059669', bg: 'bg-emerald-500' },
  caries: { labelEn: 'Active Caries / Decay', labelAr: 'تسوس نشط', color: '#EF4444', border: '#DC2626', bg: 'bg-red-500' },
  filled: { labelEn: 'Restored / Filled', labelAr: 'محشو مسبقاً', color: '#3B82F6', border: '#2563EB', bg: 'bg-blue-500' },
  crown: { labelEn: 'Crown / Prosthesis', labelAr: 'تاج / تلبيسة', color: '#8B5CF6', border: '#7C3AED', bg: 'bg-purple-500' },
  rct: { labelEn: 'Endodontic / RCT', labelAr: 'معالجة لبية / عصب', color: '#F59E0B', border: '#D97706', bg: 'bg-amber-500' },
  missing: { labelEn: 'Missing / Congenitally Absent', labelAr: 'مفقود خلقياً أو مخلوع', color: '#94A3B8', border: '#64748B', bg: 'bg-slate-400' },
  extracted: { labelEn: 'Extracted', labelAr: 'مخلوع بالعيادة', color: '#64748B', border: '#475569', bg: 'bg-slate-500' },
  impacted: { labelEn: 'Impacted', labelAr: 'منطمر', color: '#EC4899', border: '#DB2777', bg: 'bg-pink-500' },
};

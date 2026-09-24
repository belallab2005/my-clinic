import React, { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

interface NewPatientModalProps {
  onClose: () => void;
  onCreated?: (newPatientId: string) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({ onClose, onCreated }) => {
  const { addPatient, language, currentUser } = useClinic();

  const [fullName, setFullName] = useState('');
  const [fullNameAr, setFullNameAr] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState(25);
  const [phone, setPhone] = useState('+966 50 123 4567');
  const [address, setAddress] = useState('Riyadh, Saudi Arabia');
  const [emName, setEmName] = useState('');
  const [emPhone, setEmPhone] = useState('');
  const [emRel, setEmRel] = useState('Brother');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const birthYear = new Date().getFullYear() - age;
    const p = addPatient({
      fullName,
      fullNameAr: fullNameAr || fullName,
      nationalId: nationalId || '10' + Math.floor(10000000 + Math.random() * 90000000),
      gender,
      age,
      birthDate: `${birthYear}-01-01`,
      phone,
      whatsapp: phone,
      address,
      assignedStudentId: currentUser.id,
      status: 'active',
      emergencyContact: {
        name: emName || 'Emergency Relative',
        phone: emPhone || phone,
        relationship: emRel
      }
    });

    if (onCreated) onCreated(p.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-sm text-slate-900">
              {language === 'ar' ? 'تسجيل مريض سريري جديد' : 'Register New Clinical Patient'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'ar' ? 'الاسم بالإنجليزية (Full Name):' : 'Full Name (English):'}
              </label>
              <input 
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Christopher Smallwood"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'ar' ? 'الاسم بالعربية:' : 'Full Name (Arabic):'}
              </label>
              <input 
                type="text"
                value={fullNameAr}
                onChange={(e) => setFullNameAr(e.target.value)}
                placeholder="e.g. كريستوفر سمولوود"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'ar' ? 'الجنس:' : 'Gender:'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800"
              >
                <option value="male">{language === 'ar' ? 'ذكر' : 'Male'}</option>
                <option value="female">{language === 'ar' ? 'أنثى' : 'Female'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'ar' ? 'العمر:' : 'Age:'}
              </label>
              <input 
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'ar' ? 'الهوية الوطنية:' : 'National ID:'}
              </label>
              <input 
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="1098765432"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'ar' ? 'رقم الهاتف:' : 'Phone Number:'}
              </label>
              <input 
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'ar' ? 'العنوان السكني:' : 'Address:'}
              </label>
              <input 
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              {language === 'ar' ? 'بيانات الطوارئ (Emergency Contact)' : 'Emergency Contact'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text"
                placeholder="Relative Name"
                value={emName}
                onChange={(e) => setEmName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800"
              />
              <input 
                type="text"
                placeholder="Relative Phone"
                value={emPhone}
                onChange={(e) => setEmPhone(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 font-mono"
              />
            </div>
          </div>

          {/* Footer */}
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
              <span>{language === 'ar' ? 'حفظ وتوليد الكود الطبي' : 'Save Patient File'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

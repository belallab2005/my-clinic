import React, { useState } from 'react';
import { X, Layers, Check } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { ToothCondition, ProcedureType } from '../../types';
import { ADULT_TEETH, TOOTH_CONDITIONS_CONFIG } from '../../utils/fdiTeeth';

interface NewCaseModalProps {
  onClose: () => void;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({ onClose }) => {
  const { patients, subjects, createCase, language, currentUser } = useClinic();

  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [toothNumber, setToothNumber] = useState<number>(16);
  const [condition, setCondition] = useState<ToothCondition>('caries');
  const [procedure, setProcedure] = useState<ProcedureType>('Tooth Filling');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;

    // Pick appropriate subject
    let subjectId = 'sub-cons';
    if (procedure === 'Tooth Extraction') subjectId = 'sub-surg';
    else if (procedure === 'Tooth Scaling') subjectId = 'sub-perio';
    else if (procedure === 'Root Canal Treatment') subjectId = 'sub-endo';

    createCase({
      patientId,
      studentId: currentUser.id,
      subjectId,
      toothNumber,
      condition,
      procedure,
      status: 'planned',
      notes: notes || 'Procedure planned according to clinical guidelines.',
      xrays: []
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-sm text-slate-900">
              {language === 'ar' ? 'تسجيل حالة علاجية جديدة' : 'Log New Clinical Case'}
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
                {language === 'ar' ? 'رقم السن (FDI):' : 'Tooth (FDI):'}
              </label>
              <select
                value={toothNumber}
                onChange={(e) => setToothNumber(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800"
              >
                {ADULT_TEETH.map(t => (
                  <option key={t.fdi} value={t.fdi}>
                    #{t.fdi} - {t.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'ar' ? 'حالة السن:' : 'Condition:'}
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ToothCondition)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
              >
                {Object.entries(TOOTH_CONDITIONS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.labelEn}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'ar' ? 'الإجراء السريري المطلوب:' : 'Required Procedure:'}
            </label>
            <select
              value={procedure}
              onChange={(e) => setProcedure(e.target.value as ProcedureType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
            >
              <option value="Tooth Filling">Tooth Filling (Restorative)</option>
              <option value="Tooth Scaling">Tooth Scaling (Periodontics)</option>
              <option value="Tooth Extraction">Tooth Extraction (Surgery)</option>
              <option value="Root Canal Treatment">Root Canal Treatment (Endodontics)</option>
              <option value="Dental Crown">Dental Crown (Prosthodontics)</option>
              <option value="Tooth Whitening">Tooth Whitening (Cosmetic)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'ar' ? 'الملاحظات السريرية:' : 'Clinical Notes:'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Clinical observation, cavity classification, or medical considerations..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800"
            />
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
              <span>{language === 'ar' ? 'تسجيل الحالة' : 'Create Case'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

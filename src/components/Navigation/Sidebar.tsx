import React from 'react';
import { 
  CalendarDays, 
  Users, 
  Stethoscope, 
  Layers, 
  Award, 
  FileCheck2, 
  ClipboardCheck, 
  BarChart3, 
  Database,
  Shield,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { t } from '../../utils/translations';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, mobileOpen = false, onCloseMobile }) => {
  const { currentUser, language, medicalHistories, cases } = useClinic();
  const dict = t[language];

  // Pending counts for supervisor badge
  const pendingApprovalsCount = medicalHistories.filter(m => m.status === 'pending_approval').length;
  const pendingGradingCount = cases.filter(c => c.status === 'ready_for_review').length;

  const navItems = [
    {
      id: 'reservations',
      label: dict.reservations,
      icon: CalendarDays,
      roles: ['super_admin', 'supervisor', 'student']
    },
    {
      id: 'patients',
      label: dict.patients,
      icon: Users,
      roles: ['super_admin', 'supervisor', 'student']
    },
    {
      id: 'checkup',
      label: dict.medicalCheckup,
      icon: Stethoscope,
      roles: ['super_admin', 'supervisor', 'student']
    },
    {
      id: 'odontogram',
      label: dict.odontogram,
      icon: Layers,
      roles: ['super_admin', 'supervisor', 'student']
    },
    {
      id: 'quota',
      label: dict.quota,
      icon: Award,
      roles: ['super_admin', 'supervisor', 'student']
    },
    {
      id: 'supervision',
      label: dict.supervision,
      icon: FileCheck2,
      badge: currentUser.role !== 'student' ? (pendingApprovalsCount + pendingGradingCount) : undefined,
      roles: ['super_admin', 'supervisor']
    },
    {
      id: 'attendance',
      label: dict.attendance,
      icon: ClipboardCheck,
      roles: ['super_admin', 'supervisor', 'student']
    },
    {
      id: 'owner_dashboard',
      label: dict.ownerDashboard,
      icon: BarChart3,
      roles: ['super_admin', 'supervisor']
    },
    {
      id: 'settings',
      label: dict.settings,
      icon: Database,
      roles: ['super_admin', 'supervisor', 'student']
    }
  ];

  return (
    <>
      {/* Mobile/tablet backdrop — only rendered while the drawer is open */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={`w-64 bg-white border-r rtl:border-r-0 rtl:border-l border-slate-200 flex flex-col shrink-0 h-screen select-none z-40
          fixed top-0 rtl:right-0 ltr:left-0 transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : 'rtl:translate-x-full ltr:-translate-x-full'}
          md:sticky md:translate-x-0 md:z-20`}
      >
      {/* SPU-DENTAL-CLINICS Brand Header */}
      <div className="h-20 px-5 flex items-center gap-3 border-b border-slate-100 bg-slate-50/50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-indigo-700 to-sky-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-600/20 shrink-0 ring-2 ring-blue-100">
          SPU
        </div>
        <div className="min-w-0 leading-tight">
          <div className="text-xs font-black tracking-tight text-slate-900 truncate">
            SPU-DENTAL-CLINICS
          </div>
          <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5 truncate">
            {language === 'ar' ? 'الجامعة السورية الخاصة' : 'Syrian Private Univ.'}
          </div>
          <div className="text-[9px] text-slate-400 truncate">
            {language === 'ar' ? 'عيادات كلية طب الأسنان' : 'Faculty of Dentistry'}
          </div>
        </div>
      </div>

      {/* Current User Persona Banner */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-lg ${currentUser.avatarBg} text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs`}>
            {currentUser.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 truncate">
              {language === 'ar' ? currentUser.nameAr || currentUser.name : currentUser.name}
            </div>
            <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
              {currentUser.role === 'super_admin' && <Shield className="w-3 h-3 text-emerald-600 inline shrink-0" />}
              {currentUser.role === 'supervisor' && <UserCheck className="w-3 h-3 text-indigo-600 inline shrink-0" />}
              {currentUser.role === 'student' && <GraduationCap className="w-3 h-3 text-blue-600 inline shrink-0" />}
              <span className="truncate">
                {currentUser.role === 'super_admin' 
                  ? dict.superAdminRole
                  : currentUser.role === 'supervisor' 
                    ? dict.supervisorRole
                    : dict.studentRole}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isAllowed = item.roles.includes(currentUser.role);

          if (!isAllowed) return null;

          return (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); onCloseMobile?.(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 font-bold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  isActive ? 'bg-white text-blue-600' : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer info: Local Hosted Notice & SPU Accreditation */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-2 text-[11px] text-slate-600 font-bold">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{dict.locallyHosted}</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 leading-snug">
          {dict.locallyHostedDesc}
        </div>
      </div>
    </aside>
    </>
  );
};

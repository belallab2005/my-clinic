import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Bell, 
  Globe, 
  ShieldCheck, 
  UserCheck, 
  GraduationCap, 
  ChevronDown,
  X,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { UserRole } from '../../types';
import { t } from '../../utils/translations';

interface TopBarProps {
  onOpenNewPatient: () => void;
  onOpenNewAppointment: () => void;
  onOpenNewCase: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenNewPatient,
  onOpenNewAppointment,
  onOpenNewCase,
  searchQuery,
  setSearchQuery,
  setActiveTab,
  onToggleSidebar
}) => {
  const { 
    currentUser, 
    allUsers, 
    switchUser, 
    language, 
    setLanguage, 
    notifications, 
    markNotificationRead 
  } = useClinic();

  const dict = t[language];

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const quickAddRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(e.target as Node)) {
        setQuickAddOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'supervisor':
        return <UserCheck className="w-4 h-4 text-indigo-600" />;
      case 'student':
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
    }
  };

  const getRoleBadgeLabel = (role: UserRole) => {
    if (language === 'ar') {
      if (role === 'super_admin') return 'المالك والعمادة (سوبر أدمن)';
      if (role === 'supervisor') return 'المشرف السريري (أدمن)';
      return 'طالب العيادة (مستخدم عادي)';
    }
    if (role === 'super_admin') return 'Super Admin / Dean';
    if (role === 'supervisor') return 'Supervisor / Admin';
    return 'Dental Student / User';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Sidebar toggle — phone/tablet only, desktop keeps the permanent sidebar */}
      <button
        onClick={onToggleSidebar}
        className="md:hidden shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600"
        aria-label="Toggle menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Search Zone */}
      <div className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={dict.searchPlaceholder}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 rtl:pl-8 rtl:pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Action Zone */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Bilingual Switcher: Segmented Pill */}
        <div className="flex items-center bg-slate-100 border border-slate-200 p-0.5 rounded-xl shadow-2xs">
          <button
            onClick={() => setLanguage('ar')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
              language === 'ar' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🇸🇾</span>
            <span>العربية</span>
          </button>

          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
              language === 'en' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🇺🇸</span>
            <span>English</span>
          </button>
        </div>

        {/* Quick Add Button */}
        <div className="relative" ref={quickAddRef}>
          <button
            onClick={() => setQuickAddOpen(!quickAddOpen)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{dict.quickAdd}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {quickAddOpen && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => { setQuickAddOpen(false); onOpenNewPatient(); }}
                className="w-full text-left rtl:text-right px-4 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-blue-600 flex items-center gap-2.5"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">P</div>
                <div>
                  <div className="font-bold">{dict.newPatient}</div>
                  <div className="text-[10px] text-slate-400">{language === 'ar' ? 'ملف سريري ورقم وطني' : 'Register clinical patient'}</div>
                </div>
              </button>

              <button
                onClick={() => { setQuickAddOpen(false); onOpenNewAppointment(); }}
                className="w-full text-left rtl:text-right px-4 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-emerald-600 flex items-center gap-2.5"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold">{dict.newAppointment}</div>
                  <div className="text-[10px] text-slate-400">{language === 'ar' ? 'تحديد كرسي ووقت' : 'Assign chair & time'}</div>
                </div>
              </button>

              <button
                onClick={() => { setQuickAddOpen(false); onOpenNewCase(); }}
                className="w-full text-left rtl:text-right px-4 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-purple-600 flex items-center gap-2.5"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold">{dict.newCase}</div>
                  <div className="text-[10px] text-slate-400">{language === 'ar' ? 'السن FDI والإجراء' : 'FDI tooth & procedure'}</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-40 animate-in fade-in duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">
                  {language === 'ar' ? 'إشعارات عيادات SPU' : 'SPU Clinic Notifications'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {unreadCount} {language === 'ar' ? 'جديد' : 'new'}
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    {language === 'ar' ? 'لا توجد إشعارات حالية' : 'No notifications'}
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.linkTab) setActiveTab(n.linkTab);
                        setNotifOpen(false);
                      }}
                      className={`p-3 text-left rtl:text-right cursor-pointer hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}
                    >
                      <div className="flex items-start gap-2.5">
                        {n.type === 'clinical_alert' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : n.type === 'medical_approval' ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        ) : (
                          <Bell className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="text-xs font-bold text-slate-900">
                            {language === 'ar' ? n.titleAr : n.title}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {language === 'ar' ? n.messageAr : n.message}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fast Role & Account Switcher */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
          >
            <div className={`w-8 h-8 rounded-lg ${currentUser.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left rtl:text-right leading-none">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>{language === 'ar' ? currentUser.nameAr || currentUser.name : currentUser.name}</span>
                {getRoleIcon(currentUser.role)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                {getRoleBadgeLabel(currentUser.role)}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'ar' ? 'تبديل الحساب السريع (الأدوار الثلاثة)' : 'Instant 3-Role Switcher'}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {language === 'ar' 
                    ? 'اختر حساباً لمعاينة الصلاحيات فوراً بـ SPU' 
                    : 'Switch accounts to test SPU role permissions'}
                </div>
              </div>

              <div className="py-1">
                {allUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchUser(user.id);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 text-left rtl:text-right hover:bg-slate-50 transition-colors ${
                      user.id === currentUser.id ? 'bg-blue-50/70 border-l-4 rtl:border-l-0 rtl:border-r-4 border-blue-600' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${user.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate flex items-center justify-between">
                        <span>{language === 'ar' ? user.nameAr || user.name : user.name}</span>
                        {user.id === currentUser.id && (
                          <span className="text-[10px] text-blue-600 font-bold uppercase">{language === 'ar' ? 'النشط' : 'Active'}</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        {getRoleIcon(user.role)}
                        <span>{getRoleBadgeLabel(user.role)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-500">
                {language === 'ar' 
                  ? 'عيادات SPU مجهزة بـ 3 أدوار تعمل محلياً بمتصفحك دون سيرفر خارجي.' 
                  : 'SPU-DENTAL-CLINICS: Super Admin, Supervisor, and Student locally loaded.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

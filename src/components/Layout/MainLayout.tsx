import React, { useState } from 'react';
import { Sidebar } from '../Navigation/Sidebar';
import { TopBar } from '../Navigation/TopBar';
import { ReservationsView } from '../Reservations/ReservationsView';
import { PatientsView } from '../Patients/PatientsView';
import { OdontogramView } from '../Odontogram/OdontogramView';
import { StudentQuotaView } from '../Quota/StudentQuotaView';
import { SupervisorReviewView } from '../Supervision/SupervisorReviewView';
import { AttendanceView } from '../Attendance/AttendanceView';
import { OwnerDashboardView } from '../Dashboard/OwnerDashboardView';
import { DataManagementView } from '../Settings/DataManagementView';
import { MedicalCheckupModal } from '../MedicalCheckup/MedicalCheckupModal';
import { NewPatientModal } from '../Modals/NewPatientModal';
import { NewAppointmentModal } from '../Modals/NewAppointmentModal';
import { NewCaseModal } from '../Modals/NewCaseModal';
import { useClinic } from '../../context/ClinicContext';

export const MainLayout: React.FC = () => {
  const { patients, language } = useClinic();

  const [activeTab, setActiveTab] = useState<string>('reservations');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Modals
  const [activeCheckupPatientId, setActiveCheckupPatientId] = useState<string | null>(null);
  const [newPatientOpen, setNewPatientOpen] = useState<boolean>(false);
  const [newAppointmentOpen, setNewAppointmentOpen] = useState<boolean>(false);
  const [newCaseOpen, setNewCaseOpen] = useState<boolean>(false);

  return (
    <div className="flex h-screen w-screen bg-slate-100 overflow-hidden font-sans select-text" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar — overlay drawer on phone/tablet, permanent column on desktop */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* TopBar */}
        <TopBar
          onOpenNewPatient={() => setNewPatientOpen(true)}
          onOpenNewAppointment={() => setNewAppointmentOpen(true)}
          onOpenNewCase={() => setNewCaseOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onToggleSidebar={() => setMobileSidebarOpen(o => !o)}
        />

        {/* Tab Router */}
        <main className="flex-1 overflow-hidden relative flex">
          {activeTab === 'reservations' && (
            <ReservationsView 
              onOpenCheckup={(pid) => setActiveCheckupPatientId(pid)}
              onOpenNewAppointment={() => setNewAppointmentOpen(true)}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'patients' && (
            <PatientsView
              onOpenCheckup={(pid) => setActiveCheckupPatientId(pid)}
              onOpenNewPatient={() => setNewPatientOpen(true)}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'checkup' && (
            // Dedicated Medical checkup tab: shows first patient or opens modal
            <PatientsView
              onOpenCheckup={(pid) => setActiveCheckupPatientId(pid)}
              onOpenNewPatient={() => setNewPatientOpen(true)}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'odontogram' && (
            <OdontogramView 
              onOpenNewCase={() => setNewCaseOpen(true)}
            />
          )}

          {activeTab === 'quota' && (
            <StudentQuotaView />
          )}

          {activeTab === 'supervision' && (
            <SupervisorReviewView
              onOpenCheckupModal={(pid) => setActiveCheckupPatientId(pid)}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView />
          )}

          {activeTab === 'owner_dashboard' && (
            <OwnerDashboardView />
          )}

          {activeTab === 'settings' && (
            <DataManagementView />
          )}
        </main>
      </div>

      {/* 4-Step Medical Checkup Modal */}
      {activeCheckupPatientId && (
        <MedicalCheckupModal
          patientId={activeCheckupPatientId}
          onClose={() => setActiveCheckupPatientId(null)}
          onPlanCreated={() => {}}
        />
      )}

      {/* New Patient Modal */}
      {newPatientOpen && (
        <NewPatientModal
          onClose={() => setNewPatientOpen(false)}
          onCreated={(pid) => {
            // Automatically open checkup for newly registered patient
            setActiveCheckupPatientId(pid);
          }}
        />
      )}

      {/* New Appointment Modal */}
      {newAppointmentOpen && (
        <NewAppointmentModal
          onClose={() => setNewAppointmentOpen(false)}
        />
      )}

      {/* New Clinical Case Modal */}
      {newCaseOpen && (
        <NewCaseModal
          onClose={() => setNewCaseOpen(false)}
        />
      )}
    </div>
  );
};

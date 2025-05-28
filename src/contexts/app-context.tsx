"use client";

import type { Patient, Appointment } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';

interface AppContextType {
  patients: Patient[];
  appointments: Appointment[];
  addPatient: (patient: Omit<Patient, 'id' | 'registrationDate'>) => Patient;
  findPatientById: (id: string) => Patient | undefined;
  updatePatient: (patient: Patient) => void;
  searchPatients: (searchTerm: string) => Patient[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'patientName'>) => Appointment;
  getAppointmentsByPatientId: (patientId: string) => Appointment[];
  getUpcomingAppointments: (limit?: number) => Appointment[];
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialPatients: Patient[] = [
  {
    id: '1',
    name: 'John Doe',
    dob: '1985-07-15',
    gender: 'Male',
    contact: '555-1234',
    address: '123 Main St, Anytown, USA',
    registrationDate: '2023-01-10',
    medicalHistory: 'Seasonal allergies. No major surgeries. Regular check-ups.',
  },
  {
    id: '2',
    name: 'Jane Smith',
    dob: '1992-03-22',
    gender: 'Female',
    contact: '555-5678',
    address: '456 Oak Ave, Anytown, USA',
    registrationDate: '2023-02-20',
    medicalHistory: 'History of migraines. Prescribed Sumatriptan. Appendix removed in 2010.',
  },
];

const initialAppointments: Appointment[] = [
  {
    id: '101',
    patientId: '1',
    patientName: 'John Doe',
    dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    reason: 'Annual Check-up',
    status: 'Scheduled',
    notes: 'Routine physical examination.'
  },
  {
    id: '102',
    patientId: '2',
    patientName: 'Jane Smith',
    dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    reason: 'Migraine Follow-up',
    status: 'Scheduled',
    notes: 'Discuss effectiveness of current medication.'
  },
  {
    id: '103',
    patientId: '1',
    patientName: 'John Doe',
    dateTime: '2023-12-01T10:00:00.000Z',
    reason: 'Flu Shot',
    status: 'Completed',
  }
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading from localStorage or API
    const storedPatients = localStorage.getItem('patients');
    const storedAppointments = localStorage.getItem('appointments');
    
    setPatients(storedPatients ? JSON.parse(storedPatients) : initialPatients);
    setAppointments(storedAppointments ? JSON.parse(storedAppointments) : initialAppointments);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('patients', JSON.stringify(patients));
    }
  }, [patients, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('appointments', JSON.stringify(appointments));
    }
  }, [appointments, isLoading]);

  const addPatient = (patientData: Omit<Patient, 'id' | 'registrationDate'>): Patient => {
    const newPatient: Patient = {
      ...patientData,
      id: Date.now().toString(),
      registrationDate: format(new Date(), 'yyyy-MM-dd'),
    };
    setPatients(prev => [...prev, newPatient]);
    return newPatient;
  };

  const findPatientById = (id: string): Patient | undefined => {
    return patients.find(p => p.id === id);
  };
  
  const updatePatient = (updatedPatient: Patient): void => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const searchPatients = (searchTerm: string): Patient[] => {
    if (!searchTerm) return patients;
    return patients.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.includes(searchTerm)
    );
  };

  const addAppointment = (appointmentData: Omit<Appointment, 'id' | 'patientName'>): Appointment => {
    const patient = findPatientById(appointmentData.patientId);
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now().toString(),
      patientName: patient?.name || 'Unknown Patient',
    };
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  };

  const getAppointmentsByPatientId = (patientId: string): Appointment[] => {
    return appointments.filter(a => a.patientId === patientId).sort((a,b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  };

  const getUpcomingAppointments = (limit?: number): Appointment[] => {
    const upcoming = appointments
      .filter(a => new Date(a.dateTime) > new Date() && a.status === 'Scheduled')
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    return limit ? upcoming.slice(0, limit) : upcoming;
  };

  return (
    <AppContext.Provider value={{
      patients,
      appointments,
      addPatient,
      findPatientById,
      updatePatient,
      searchPatients,
      addAppointment,
      getAppointmentsByPatientId,
      getUpcomingAppointments,
      isLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

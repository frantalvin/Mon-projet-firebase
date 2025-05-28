export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  address: string;
  registrationDate: string;
  medicalHistory: string; // For treatments, notes, etc.
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string; // Optional: denormalized for easier display
  dateTime: string;
  reason: string;
  notes?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

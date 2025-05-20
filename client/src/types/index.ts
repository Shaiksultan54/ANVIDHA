export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface TenderSubmitter {
  _id: string;
  name: string;
  email: string;
}

export interface Tender {
  _id: string;
  tenderId: string;
  organization: string;
  description: string;
  dueDate: string;
  documentUrl: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: TenderSubmitter;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface TenderFormData {
  organization: string;
  description: string;
  dueDate: string;
  price: number;
  document?: File;
}
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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface TenderDocument {
  url: string;
  name: string;
  size: number;
}

export interface TenderAttribute {
  key: string;
  value: string;
}

export interface Tender {
  _id: string;
  tenderId: string;
  organization: string;
  description: string;
  dueDate: string;
  documents: TenderDocument[];
  price: number;
  attributes?: TenderAttribute[];
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TenderFormData {
  tenderId: string;
  organization: string;
  description: string;
  dueDate: string;
  price: number;
  documents?: File[];
  attributes?: TenderAttribute[];
}
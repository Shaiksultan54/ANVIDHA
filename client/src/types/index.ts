// ===========================
// User Types
// ===========================
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
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
// ===========================
// Tender Document Type
// ===========================
export interface TenderDocument {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimetype: string;
  cloudinaryId: string;
  createdAt: string;
  updatedAt: string;
}

// ===========================
// Tender Attribute Type
// ===========================
export interface TenderAttribute {
  key: string;
  value: string;
}

// ===========================
// Tender Type
// ===========================
export interface Tender {
  _id: string;
  tenderId: string;
  organization: string;
  description: string;
  dueDate: string;
  documents: TenderDocument[];
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  attributes: TenderAttribute[];
  submittedBy: User;
  createdAt: string;
  updatedAt: string;
}

// ===========================
// Tender Form Data (for Create/Update)
// ===========================
export interface TenderFormData {
  tenderId: string;
  organization: string;
  description: string;
  dueDate: string;
  price: number;
  documents?: File[];
  attributes?: TenderAttribute[];
}

// ===========================
// API Response Types
// ===========================
export interface TendersResponse {
  tenders: Tender[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  message: string;
  stack?: string;
}

// ===========================
// Tender Filter/Search Params
// ===========================
export interface TenderFilterParams {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected';
  organization?: string;
  search?: string;
}

// ===========================
// Auth Context Types
// ===========================
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// ===========================
// Component Prop Types
// ===========================
export interface TenderCardProps {
  tender: Tender;
  onStatusUpdate?: (id: string, status: 'pending' | 'approved' | 'rejected') => void;
  onDelete?: (id: string) => void;
}

export interface TenderListProps {
  filters?: TenderFilterParams;
  onTenderSelect?: (tender: Tender) => void;
}

export interface DocumentListProps {
  documents: TenderDocument[];
  onDocumentDelete?: (documentId: string) => void;
  readOnly?: boolean;
}

export interface AttributeListProps {
  attributes: TenderAttribute[];
  onAttributeChange?: (attributes: TenderAttribute[]) => void;
  readOnly?: boolean;
}

// ===========================
// Form Validation Errors
// ===========================
export interface TenderFormErrors {
  tenderId?: string;
  organization?: string;
  description?: string;
  dueDate?: string;
  price?: string;
  documents?: string;
  attributes?: string;
}
export interface LoginFormErrors {
  email?: string;
  password?: string;
}
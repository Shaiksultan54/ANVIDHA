import axios from 'axios';
import { TenderFormData } from '../types';

const api = axios.create({
  baseURL: '/api/tenders',
});

// Add Authorization token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all tenders
export const getAllTenders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  organization?: string;
  search?: string;
}) => {
  try {
    const response = await api.get('/', { params });
    console.log('✅ getAllTenders response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ getAllTenders error:', error);
    throw error;
  }
};

// Get a single tender
export const getTenderById = async (id: string) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

// Create a new tender
export const createTender = async (data: TenderFormData) => {
  const form = new FormData();
  form.append('tenderId', data.tenderId);
  form.append('organization', data.organization);
  form.append('description', data.description);
  form.append('dueDate', data.dueDate);
  form.append('price', data.price.toString());

  if (data.attributes) {
    form.append('attributes', JSON.stringify(data.attributes));
  }

  if (data.documents) {
    data.documents.forEach((file) => form.append('documents', file));
  }

  const response = await api.post('/', form);
  return response.data;
};

// Update a tender
export const updateTender = async (
  id: string,
  data: TenderFormData,
  role: 'admin' | 'user'
) => {
  const form = new FormData();
  form.append('tenderId', data.tenderId);
  form.append('organization', data.organization);
  form.append('description', data.description);
  form.append('dueDate', data.dueDate);
  form.append('price', data.price.toString());

  if (role === 'admin' && data.attributes) {
    form.append('attributes', JSON.stringify(data.attributes));
  }

  if (data.documents) {
    data.documents.forEach((file) => form.append('documents', file));
  }

  const response = await api.put(`/${id}`, form);
  return response.data;
};

// Update tender status (admin only)
export const updateTenderStatus = async (
  id: string,
  status: 'pending' | 'approved' | 'rejected'
) => {
  const response = await api.patch(
    `/${id}/status`,
    { status },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data;
};

// Delete tender
export const deleteTender = async (id: string) => {
  await api.delete(`/${id}`);
};

// Delete document from tender
export const deleteDocument = async (tenderId: string, documentId: string) => {
  await api.delete(`/${tenderId}/documents/${documentId}`);
};

// Download document
export const downloadDocument = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

import api from './api';
import { Tender, TenderFormData } from '../types';

// Get all tenders
export const getAllTenders = async (): Promise<Tender[]> => {
  const response = await api.get('/tenders');
  return response.data;
};

// Get a single tender
export const getTenderById = async (id: string): Promise<Tender> => {
  const response = await api.get(`/tenders/${id}`);
  return response.data;
};

// Create a new tender
export const createTender = async (formData: TenderFormData): Promise<Tender> => {
  // Create form data for file upload
  const form = new FormData();
  form.append('organization', formData.organization);
  form.append('description', formData.description);
  form.append('dueDate', formData.dueDate);
  form.append('price', formData.price.toString());
  
  if (formData.document) {
    form.append('document', formData.document);
  }

  const response = await api.post('/tenders', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Update tender details and optionally upload new document
export const updateTender = async (
  id: string,
  formData: TenderFormData
): Promise<Tender> => {
  const form = new FormData();
  form.append('organization', formData.organization);
  form.append('description', formData.description);
  form.append('dueDate', formData.dueDate);
  form.append('price', formData.price.toString());
  
  if (formData.document) {
    form.append('document', formData.document);
  }

  const response = await api.put(`/tenders/${id}`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Update tender status (admin only)
export const updateTenderStatus = async (
  id: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<Tender> => {
  const response = await api.patch(`/tenders/${id}/status`, { status });
  return response.data;
};

// Delete a tender (admin only)
export const deleteTender = async (id: string): Promise<void> => {
  await api.delete(`/tenders/${id}`);
};
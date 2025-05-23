import api from './api';
import { Tender, TenderFormData } from '../types';

export const getAllTenders = async (): Promise<Tender[]> => {
  try {
    const response = await api.get('/tenders');
    console.log('Tenders response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching tenders:', error);
    throw error;
  }
};

export const getTenderById = async (id: string): Promise<Tender> => {
  try {
    const response = await api.get(`/tenders/${id}`);
    console.log('Tender details response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching tender:', error);
    throw error;
  }
};

export const createTender = async (formData: TenderFormData): Promise<Tender> => {
  try {
    const form = new FormData();
    form.append('tenderId', formData.tenderId);
    form.append('organization', formData.organization);
    form.append('description', formData.description);
    form.append('dueDate', formData.dueDate);
    form.append('price', formData.price.toString());
    
    if (formData.attributes) {
      form.append('attributes', JSON.stringify(formData.attributes));
    }
    
    if (formData.documents) {
      formData.documents.forEach((file) => {
        form.append('documents', file);
      });
    }

    const response = await api.post('/tenders', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Create tender response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating tender:', error);
    throw error;
  }
};

export const updateTender = async (
  id: string,
  formData: TenderFormData
): Promise<Tender> => {
  try {
    const form = new FormData();
    form.append('tenderId', formData.tenderId);
    form.append('organization', formData.organization);
    form.append('description', formData.description);
    form.append('dueDate', formData.dueDate);
    form.append('price', formData.price.toString());
    
    if (formData.attributes) {
      form.append('attributes', JSON.stringify(formData.attributes));
    }
    
    if (formData.documents) {
      formData.documents.forEach((file) => {
        form.append('documents', file);
      });
    }

    const response = await api.put(`/tenders/${id}`, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Update tender response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating tender:', error);
    throw error;
  }
};

export const updateTenderStatus = async (
  id: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<Tender> => {
  try {
    const response = await api.patch(`/tenders/${id}/status`, { status });
    console.log('Update status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  }
};

export const deleteTender = async (id: string): Promise<void> => {
  try {
    await api.delete(`/tenders/${id}`);
    console.log('Tender deleted successfully');
  } catch (error) {
    console.error('Error deleting tender:', error);
    throw error;
  }
};
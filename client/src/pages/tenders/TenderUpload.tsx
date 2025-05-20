import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Building, Calendar, IndianRupee, FileText, Upload, X } from 'lucide-react';
import { createTender } from '../../services/tenderService';
import { TenderFormData } from '../../types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const tenderSchema = z.object({
  organization: z.string().min(2, 'Organization name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  dueDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  price: z.coerce.number().positive('Price must be a positive number'),
});

type TenderFormValues = z.infer<typeof tenderSchema>;

const TenderUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenderFormValues>({
    resolver: zodResolver(tenderSchema),
    defaultValues: {
      organization: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      price: 0,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    
    if (!file) {
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum limit of 5MB`);
      return;
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Only PDF and Word documents are allowed');
      return;
    }
    
    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError(null);
  };

  const onSubmit = async (data: TenderFormValues) => {
    if (!selectedFile) {
      setFileError('Document is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData: TenderFormData = {
        ...data,
        document: selectedFile,
      };
      
      await createTender(formData);
      toast.success('Tender uploaded successfully');
      navigate('/tenders');
    } catch (error) {
      console.error('Error uploading tender:', error);
      toast.error('Failed to upload tender');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Upload New Tender</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add a new tender to the system for users to view and apply.
        </p>
      </header>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                  Organization
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="organization"
                    className={`pl-10 block w-full py-2 px-3 border ${
                      errors.organization ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    placeholder="Organization name"
                    {...register('organization')}
                  />
                </div>
                {errors.organization && (
                  <p className="mt-1 text-sm text-red-600">{errors.organization.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="dueDate"
                    className={`pl-10 block w-full py-2 px-3 border ${
                      errors.dueDate ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    {...register('dueDate')}
                  />
                </div>
                {errors.dueDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price (IND)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {/* <DollarSign className="h-5 w-5 text-gray-400" /> */}
                    <IndianRupee className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="price"
                    className={`pl-10 block w-full py-2 px-3 border ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    {...register('price')}
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="document" className="block text-sm font-medium text-gray-700">
                  Tender Document
                </label>
                <div className="mt-1">
                  {!selectedFile ? (
                    <div className="max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="document"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span>Upload a document</span>
                            <input
                              id="document"
                              name="document"
                              type="file"
                              className="sr-only"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF or Word up to 5MB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-lg flex items-center p-4 border border-gray-300 rounded-md">
                      <FileText className="h-6 w-6 text-gray-400 mr-2" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="ml-4 text-red-600 hover:text-red-900"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
                {fileError && <p className="mt-1 text-sm text-red-600">{fileError}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  rows={4}
                  className={`block w-full py-2 px-3 border ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Enter a detailed description of the tender..."
                  {...register('description')}
                />
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/tenders')}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Tender
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TenderUpload;
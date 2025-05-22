import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building, 
  Calendar, 
  Check, 
  Clock, 
  IndianRupee, 
  Download, 
  FileText, 
  Pencil,
  Save,
  X 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Tender, TenderFormData } from '../../types';
import { 
  getTenderById, 
  updateTender,
  updateTenderStatus, 
  deleteTender 
} from '../../services/tenderService';
import { useAuth } from '../../context/AuthContext';

const TenderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tender, setTender] = useState<Tender | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isuser = user?.role === 'admin'|| user?.role === 'user';
  const isOwner = tender?.submittedBy?._id === user?._id;
  const canEdit = isAdmin || isOwner || isuser;

  // Form state
  const [formData, setFormData] = useState({
    tenderId: '',
    organization: '',
    description: '',
    dueDate: '',
    price: 0,
  });

  useEffect(() => {
    const fetchTender = async () => {
      try {
        if (id) {
          const data = await getTenderById(id);
          setTender(data);
          setFormData({
            tenderId: data.tenderId || '',
            organization: data.organization || '',
            description: data.description || '',
            dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
            price: data.price || 0,
          });
        }
      } catch (error) {
        console.error('Error fetching tender:', error);
        toast.error('Failed to load tender details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTender();
  }, [id]);

  const handleStatusUpdate = async (status: 'pending' | 'approved' | 'rejected') => {
    if (!tender || !id) return;
    
    try {
      setIsUpdating(true);
      const updatedTender = await updateTenderStatus(id, status);
      setTender(updatedTender);
      toast.success(`Tender status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update tender status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!tender || !id) return;
    
    if (!window.confirm('Are you sure you want to delete this tender?')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      await deleteTender(id);
      toast.success('Tender deleted successfully');
      navigate('/tenders');
    } catch (error) {
      console.error('Error deleting tender:', error);
      toast.error('Failed to delete tender');
      setIsDeleting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name}: File size must be less than 5MB`);
        return;
      }

      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Only PDF and Word documents are allowed`);
        return;
      }

      validFiles.push(file);
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setIsUpdating(true);
      const updateData: TenderFormData = {
        ...formData,
        documents: selectedFiles,
        attributes: isuser ? tender?.attributes || [] : [],
      };

      const updatedTender = await updateTender(id, updateData, user?.role ?? "user");
      setTender(updatedTender);
      setIsEditing(false);
      toast.success('Tender updated successfully');
    } catch (error) {
      console.error('Error updating tender:', error);
      toast.error('Failed to update tender');
    } finally {
      setIsUpdating(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format creation date
  const formatCreationDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Tender not found</h3>
        <p className="mt-1 text-gray-500">
          The tender you are looking for does not exist or has been removed.
        </p>
        <div className="mt-6">
          <Link
            to="/tenders"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tenders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <Link
            to="/tenders"
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Tenders
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Tender Details: {tender.tenderId || 'N/A'}
          </h1>
        </div>

        {canEdit && (
          <div className="flex space-x-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Tender
                </button>
                {isAdmin && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Tender'}
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel Editing
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tender Content */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {tender.organization || 'N/A'}
            </h3>
            <div className="mt-2 sm:mt-0">
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                  tender.status || 'pending'
                )}`}
              >
                {tender.status || 'pending'}
              </span>
            </div>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {tender.createdAt && (
              <>Created on {formatCreationDate(tender.createdAt)}</>
            )}
            {tender.submittedBy && (
              <> by {tender.submittedBy.name} ({tender.submittedBy.email})</>
            )}
          </p>
        </div>

        {/* Tender Details */}
        {isEditing ? (
          <form onSubmit={handleSubmit} className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="tenderId" className="block text-sm font-medium text-gray-700">
                  Tender ID
                </label>
                <input
                  type="text"
                  id="tenderId"
                  value={formData.tenderId}
                  onChange={(e) => setFormData({ ...formData, tenderId: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

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
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
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
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price (₹)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="pl-10 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Update Documents
                </label>
                <div className="mt-2 space-y-4">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center p-4 border border-gray-300 rounded-md">
                      <FileText className="h-6 w-6 text-gray-400 mr-2" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="ml-4 text-red-600 hover:text-red-900"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="documents"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Upload documents</span>
                          <input
                            id="documents"
                            name="documents"
                            type="file"
                            className="sr-only"
                            accept=".pdf,.doc,.docx"
                            multiple
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF or Word up to 5MB each</p>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Current documents:
                  {(tender.documents || []).map((doc, index) => (
                    <a
                      key={index}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-indigo-600 hover:text-indigo-900"
                    >
                      Document {index + 1}
                    </a>
                  ))}
                  {(!tender.documents || tender.documents.length === 0) && (
                    <span className="ml-2 text-gray-500">No documents available</span>
                  )}
                </p>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Tender ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{tender.tenderId || 'N/A'}</dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Building className="mr-1 h-4 w-4 text-gray-400" />
                  Organization
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{tender.organization || 'N/A'}</dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                  Due Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {tender.dueDate ? formatDate(tender.dueDate) : 'N/A'}
                </dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <IndianRupee className="mr-1 h-4 w-4 text-gray-400" />
                  Price
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  ₹{(tender.price || 0).toLocaleString()}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FileText className="mr-1 h-4 w-4 text-gray-400" />
                  Documents
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {tender.documents && tender.documents.length > 0 ? (
                    tender.documents.map((doc, index) => (
                      <a
                        key={index}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mr-4 text-indigo-600 hover:text-indigo-900"
                      >
                        <Download className="mr-1 h-4 w-4" />
                        Document {index + 1}
                      </a>
                    ))
                  ) : (
                    <span className="text-gray-500">No documents available</span>
                  )}
                </dd>
              </div>

              {isAdmin && tender.attributes && tender.attributes.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Additional Attributes</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="grid grid-cols-2 gap-4">
                      {tender.attributes.map((attr, index) => (
                        <div key={index} className="border rounded p-2">
                          <span className="font-medium">{attr.key}:</span> {attr.value}
                        </div>
                      ))}
                    </div>
                  </dd>
                </div>
              )}

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                  {tender.description || 'No description available'}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {/* Admin Actions */}
        {isAdmin && !isEditing && (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-500">Update Status</h4>
            <div className="mt-2 flex flex-wrap gap-3">
              <button
                onClick={() => handleStatusUpdate('pending')}
                disabled={isUpdating || tender.status === 'pending'}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm ${
                  tender.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800 cursor-default'
                    : 'text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Clock className="mr-1 h-3 w-3" />
                Mark as Pending
              </button>
              
              <button
                onClick={() => handleStatusUpdate('approved')}
                disabled={isUpdating || tender.status === 'approved'}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm ${
                  tender.status === 'approved'
                    ? 'bg-green-100 text-green-800 cursor-default'
                    : 'text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Check className="mr-1 h-3 w-3" />
                Approve
              </button>
              
              <button
                onClick={() => handleStatusUpdate('rejected')}
                disabled={isUpdating || tender.status === 'rejected'}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm ${
                  tender.status === 'rejected'
                    ? 'bg-red-100 text-red-800 cursor-default'
                    : 'text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <X className="mr-1 h-3 w-3" />
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenderDetails;
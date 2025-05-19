import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building, 
  Calendar, 
  Check, 
  Clock, 
  DollarSign, 
  Download, 
  FileText, 
  X 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Tender } from '../../types';
import { 
  getTenderById, 
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchTender = async () => {
      try {
        if (id) {
          const data = await getTenderById(id);
          setTender(data);
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
            Tender Details: {tender.tenderId}
          </h1>
        </div>

        {isAdmin && (
          <div className="flex space-x-3">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete Tender'}
            </button>
          </div>
        )}
      </div>

      {/* Tender Header */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {tender.organization}
            </h3>
            <div className="mt-2 sm:mt-0">
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                  tender.status
                )}`}
              >
                {tender.status}
              </span>
            </div>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Created on {formatCreationDate(tender.createdAt)}
          </p>
        </div>

        {/* Tender Details */}
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Building className="mr-1 h-4 w-4 text-gray-400" />
                Organization
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{tender.organization}</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                Due Date
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(tender.dueDate)}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <DollarSign className="mr-1 h-4 w-4 text-gray-400" />
                Price
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                ${tender.price.toLocaleString()}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <FileText className="mr-1 h-4 w-4 text-gray-400" />
                Document
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                <a
                  href={tender.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Download Document
                </a>
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                {tender.description}
              </dd>
            </div>
          </dl>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
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
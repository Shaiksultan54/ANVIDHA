import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, FileText, XCircle } from 'lucide-react';
import { Tender } from '../../types';
import { getAllTenders } from '../../services/tenderService';
import { useAuth } from '../../context/AuthContext';

const UserDashboard: React.FC = () => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const data = await getAllTenders();
        setTenders(data);
      } catch (error) {
        console.error('Error fetching tenders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenders();
  }, []);

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  // Count tenders by status
  const pendingTenders = tenders.filter(tender => tender.status === 'pending').length;
  const approvedTenders = tenders.filter(tender => tender.status === 'approved').length;
  const rejectedTenders = tenders.filter(tender => tender.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back, {user?.name}. Here's an overview of your tenders.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Tenders</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{pendingTenders}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved Tenders</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{approvedTenders}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Rejected Tenders</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{rejectedTenders}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent tenders */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Recent Tenders</h2>
          <Link 
            to="/tenders" 
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
          >
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="border-t border-gray-200">
          {isLoading ? (
            <div className="p-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : tenders.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {tenders.slice(0, 5).map((tender) => (
                <li key={tender._id}>
                  <Link to={`/tenders/${tender._id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {tender.organization}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {tender.tenderId}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {tender.description.substring(0, 100)}
                            {tender.description.length > 100 ? '...' : ''}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p className="flex items-center">
                            {getStatusIcon(tender.status)}
                            <span className="ml-1 capitalize">{tender.status}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-10 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tenders yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by submitting a new tender.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
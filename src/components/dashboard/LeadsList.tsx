import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllLeads, deleteLead } from '../../lib/supabase';
import { Download, Trash2, Star, MapPin, Globe } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import LeadDetails from './LeadDetails';
import { exportToCSV } from '../../utils/csvExporter';

export default function LeadsList() {
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Listen for new leads
  useEffect(() => {
    const handleLeadStored = () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    };

    window.addEventListener('gbp_optimizer_lead_stored', handleLeadStored);
    return () => window.removeEventListener('gbp_optimizer_lead_stored', handleLeadStored);
  }, [queryClient]);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: getAllLeads,
    refetchInterval: 5000 // Periodically check for new leads
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setDeletingId(null);
    }
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete lead:', error);
      alert('Failed to delete lead. Please try again.');
    }
  };

  const handleExport = () => {
    if (!leads?.length) return;
    
    const exportData = leads.map(lead => ({
      'Business Name': lead.business_name,
      'Category': lead.business_category,
      'Address': lead.business_address,
      'Rating': lead.business_rating,
      'Reviews': lead.business_reviews_count || 0,
      'Website': lead.business_website || 'Not listed',
      'Phone': lead.business_phone || 'Not listed',
      'Profile Status': lead.business_claimed ? 'Claimed' : 'Unclaimed',
      'Email': lead.email,
      'Overall Score': lead.report_data?.overallScore || 0,
      'Date': formatDate(lead.created_at),
      'Source': lead.source || 'app'
    }));

    exportToCSV(exportData, `leads-export-${new Date().toISOString().split('T')[0]}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">All Leads</h2>
          <button
            onClick={handleExport}
            disabled={!leads?.length}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
              ${leads?.length ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}
            `}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Leads
          </button>
        </div>

        {!leads?.length ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No leads found.</p>
          </div>
        ) : (
          <div className="mt-4">
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Business
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rating
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {leads.map((lead) => (
                          <tr 
                            key={lead.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => setSelectedLead(lead.id)}
                          >
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{lead.business_name}</div>
                              <div className="text-sm text-gray-500 flex items-center mt-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                {lead.business_category}
                              </div>
                              {lead.business_website && (
                                <a
                                  href={lead.business_website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-indigo-600 hover:text-indigo-800 mt-1 inline-flex items-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Globe className="h-4 w-4 mr-1" />
                                  Website
                                </a>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{lead.email}</div>
                              {lead.business_phone && (
                                <div className="text-sm text-gray-500">{lead.business_phone}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="ml-1 text-sm font-medium text-gray-900">
                                  {lead.business_rating}
                                </span>
                                <span className="ml-2 text-sm text-gray-500">
                                  ({lead.business_reviews_count || 0})
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                lead.business_claimed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {lead.business_claimed ? 'Claimed' : 'Unclaimed'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(lead.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(lead.id);
                                }}
                                disabled={deletingId === lead.id}
                                className={`text-red-600 hover:text-red-900 ${
                                  deletingId === lead.id ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedLead && (
        <LeadDetails
          leadId={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
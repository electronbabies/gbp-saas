import React from 'react';
import { Mail } from 'lucide-react';

export default function EmailTemplates() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Email Templates</h2>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Mail className="h-4 w-4 mr-2" />
            New Template
          </button>
        </div>
        
        <div className="mt-6">
          <p className="text-gray-500 text-center py-4">No templates found</p>
        </div>
      </div>
    </div>
  );
}
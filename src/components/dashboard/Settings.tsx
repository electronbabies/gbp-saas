import React, { useState } from 'react';
import { Key, Save, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { googleMapsManager } from '../../utils/googleMaps';

export default function Settings() {
  const { apiKeys, updateApiKeys } = useAuthStore();
  const [formData, setFormData] = useState({
    googlePlaces: apiKeys.googlePlaces || '',
    openai: apiKeys.openai || ''
  });

  const [showKeys, setShowKeys] = useState({
    googlePlaces: false,
    openai: false
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (!formData.googlePlaces || !formData.openai) {
        throw new Error('Both API keys are required');
      }

      // Clean up Google Maps before updating keys
      googleMapsManager.cleanup();
      
      // Update API keys
      updateApiKeys(formData);
      
      setMessage({ type: 'success', text: 'API keys updated successfully' });
      
      // Reload the page to reinitialize with new keys
      window.location.reload();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update API keys' 
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleKeyVisibility = (key: 'googlePlaces' | 'openai') => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center mb-6">
          <Key className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">API Settings</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
          <div>
            <label htmlFor="googlePlaces" className="block text-sm font-medium text-gray-700">
              Google Places API Key
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type={showKeys.googlePlaces ? "text" : "password"}
                id="googlePlaces"
                value={formData.googlePlaces}
                onChange={(e) => setFormData(prev => ({ ...prev, googlePlaces: e.target.value }))}
                className="block w-full pr-10 sm:text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 border-gray-300"
                placeholder="Enter your Google Places API Key"
              />
              <button
                type="button"
                onClick={() => toggleKeyVisibility('googlePlaces')}
                className="absolute inset-y-0 right-0 px-3 flex items-center cursor-pointer"
              >
                {showKeys.googlePlaces ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">Required for business search functionality</p>
          </div>

          <div>
            <label htmlFor="openai" className="block text-sm font-medium text-gray-700">
              OpenAI API Key
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type={showKeys.openai ? "text" : "password"}
                id="openai"
                value={formData.openai}
                onChange={(e) => setFormData(prev => ({ ...prev, openai: e.target.value }))}
                className="block w-full pr-10 sm:text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 border-gray-300"
                placeholder="Enter your OpenAI API Key"
              />
              <button
                type="button"
                onClick={() => toggleKeyVisibility('openai')}
                className="absolute inset-y-0 right-0 px-3 flex items-center cursor-pointer"
              >
                {showKeys.openai ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">Required for generating business analysis reports</p>
          </div>

          {message && (
            <div className={`rounded-md p-4 ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={saving}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save API Keys
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
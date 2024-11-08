import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { generateEmbedToken } from '../../utils/embedToken';

export default function EmbedCode() {
  const [copied, setCopied] = useState(false);
  const [embedType, setEmbedType] = useState<'normal' | 'fullpage'>('normal');
  const { agency, apiKeys } = useAuthStore();
  
  // Generate a unique token that includes agency ID and API keys
  const embedToken = agency ? generateEmbedToken(
    agency.id,
    apiKeys.googlePlaces || '',
    apiKeys.openai || ''
  ) : '';
  
  const currentUrl = window.location.origin;
  const embedUrl = `${currentUrl}/scanner/${agency?.id}?token=${encodeURIComponent(embedToken)}`;
  
  const embedCodes = {
    normal: `<iframe
  src="${embedUrl}"
  width="100%"
  height="800"
  frameborder="0"
  style="border: 1px solid #e5e7eb; border-radius: 8px;"
  title="Business Profile Scanner"
></iframe>`,
    fullpage: `<iframe
  src="${embedUrl}"
  width="100%"
  height="100%"
  frameborder="0"
  style="border: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100vh;"
  title="Business Profile Scanner"
></iframe>`
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCodes[embedType]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!apiKeys.googlePlaces || !apiKeys.openai || !agency) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Embed Scanner
          </h3>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Please configure your API keys in Settings and ensure you're logged in before generating embed code.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Embed Scanner
          </h3>
        </div>
        
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">Embed Type</label>
          <div className="mt-2 flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-indigo-600"
                name="embedType"
                value="normal"
                checked={embedType === 'normal'}
                onChange={(e) => setEmbedType(e.target.value as 'normal' | 'fullpage')}
              />
              <span className="ml-2">Normal</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-indigo-600"
                name="embedType"
                value="fullpage"
                checked={embedType === 'fullpage'}
                onChange={(e) => setEmbedType(e.target.value as 'normal' | 'fullpage')}
              />
              <span className="ml-2">Full Page</span>
            </label>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">
          Copy this code to embed the scanner on your website:
        </p>
        
        <div className="relative">
          <pre className="bg-gray-50 p-4 rounded-lg text-sm text-gray-800 overflow-x-auto">
            {embedCodes[embedType]}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 bg-white rounded-md shadow-sm border border-gray-200"
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>Notes:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>The scanner URL includes your unique agency identifier</li>
            <li>All leads will be automatically linked to your account</li>
            <li>Update the embed code if you change your API keys</li>
            <li>{embedType === 'fullpage' ? 
              'Full page embed takes over the entire viewport' : 
              'Normal embed can be placed within your page layout'}</li>
            <li>You can adjust the width and height attributes as needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
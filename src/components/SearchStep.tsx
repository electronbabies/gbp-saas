import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import PlacesAutocomplete from './PlacesAutocomplete';
import { googleMapsManager } from '../utils/googleMaps';
import { useAuthStore } from '../store/authStore';

interface SearchStepProps {
  onSearch: (place: google.maps.places.PlaceResult) => void;
}

export default function SearchStep({ onSearch }: SearchStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { apiKeys } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function initGoogleMaps() {
      if (!apiKeys.googlePlaces) {
        if (mounted) {
          setError('Google Places API key is required');
          setIsLoading(false);
        }
        return;
      }

      try {
        await googleMapsManager.loadGoogleMaps(apiKeys.googlePlaces);
        if (mounted) {
          setIsLoading(false);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.error('Failed to load Google Maps:', err);
          setError('Failed to initialize search. Please try again.');
          setIsLoading(false);
        }
      }
    }

    initGoogleMaps();

    return () => {
      mounted = false;
    };
  }, [apiKeys.googlePlaces]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Find Your Business
      </h2>
      <p className="text-gray-600 mb-8">
        Enter your business name to analyze your Google Business Profile
      </p>
      
      <div className="max-w-xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <PlacesAutocomplete onSelect={onSearch} />
        )}
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>We'll analyze your business profile and provide detailed optimization recommendations.</p>
      </div>
    </div>
  );
}
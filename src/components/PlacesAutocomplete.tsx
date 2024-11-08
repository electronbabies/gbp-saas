import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { googleMapsManager } from '../utils/googleMaps';

interface PlacesAutocompleteProps {
  onSelect: (place: google.maps.places.PlaceResult) => void;
}

export default function PlacesAutocomplete({ onSelect }: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { apiKeys } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function initializeAutocomplete() {
      if (!inputRef.current || !apiKeys.googlePlaces) return;

      try {
        // Load Google Maps if not already loaded
        if (!googleMapsManager.isLoaded()) {
          await googleMapsManager.loadGoogleMaps(apiKeys.googlePlaces);
        }

        // Clean up existing autocomplete
        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }

        // Initialize new autocomplete
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['establishment'],
          fields: [
            'place_id',
            'name',
            'formatted_address',
            'types',
            'rating',
            'user_ratings_total',
            'business_status',
            'website',
            'formatted_phone_number',
            'opening_hours',
            'photos',
            'reviews'
          ]
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place.place_id) {
            setError('Please select a valid business from the dropdown');
            return;
          }

          setIsLoading(true);
          try {
            onSelect(place);
          } catch (err) {
            setError('Failed to process selection');
            console.error('Place selection error:', err);
          } finally {
            setIsLoading(false);
          }
        });

        if (mounted) {
          autocompleteRef.current = autocomplete;
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.error('Autocomplete initialization error:', err);
          setError('Failed to initialize search. Please check your API key.');
        }
      }
    }

    initializeAutocomplete();

    return () => {
      mounted = false;
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [apiKeys.googlePlaces, onSelect]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter business name..."
          className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm"
          disabled={isLoading}
          autoComplete="off"
        />
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        {isLoading && (
          <div className="absolute right-4 top-3.5">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
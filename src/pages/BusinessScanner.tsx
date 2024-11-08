import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, Search, Scan, FileText, Settings } from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import SearchStep from '../components/SearchStep';
import ScanningStep from '../components/ScanningStep';
import ReportStep from '../components/ReportStep';
import { useAuthStore } from '../store/authStore';
import { parseEmbedToken } from '../utils/embedToken';
import type { BusinessReport } from '../lib/openai';

export interface Business {
  id: string;
  name: string;
  category: string;
  address: string;
  rating: number;
  reviews_count?: number;
  claimed?: boolean;
  photos?: string[];
  website?: string;
  phone?: string;
  hours?: Record<string, string>;
  place_id?: string;
  types?: string[];
  posts?: Array<{
    text: string;
    image?: string;
    created_time: string;
    type: 'EVENT' | 'OFFER' | 'UPDATE' | 'PRODUCT';
  }>;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
    relative_time_description: string;
  }>;
}

const steps = [
  { title: 'Search', icon: Search },
  { title: 'Scan', icon: Scan },
  { title: 'Report', icon: FileText }
];

// Check if we're in an iframe
const isEmbedded = window.self !== window.top;

export default function BusinessScanner() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [existingReport, setExistingReport] = useState<BusinessReport | null>(null);
  const { agency, apiKeys, updateApiKeys } = useAuthStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      const tokenData = parseEmbedToken(token);
      if (tokenData?.keys) {
        updateApiKeys(tokenData.keys);
      }
    }

    const businessParam = searchParams.get('business');
    const reportParam = searchParams.get('report');

    if (businessParam && reportParam) {
      try {
        const business = JSON.parse(decodeURIComponent(businessParam));
        const report = JSON.parse(decodeURIComponent(reportParam));
        setSelectedBusiness(business);
        setExistingReport(report);
        setCurrentStep(2);
      } catch (error) {
        console.error('Failed to parse business/report data from URL:', error);
      }
    }
  }, [searchParams, updateApiKeys]);

  const handleBusinessSelect = (place: google.maps.places.PlaceResult) => {
    if (!place.place_id) return;

    // Create a service to get detailed place information including reviews
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    
    service.getDetails({
      placeId: place.place_id,
      fields: [
        'name',
        'formatted_address',
        'rating',
        'user_ratings_total',
        'business_status',
        'website',
        'formatted_phone_number',
        'opening_hours',
        'photos',
        'reviews',
        'types'
      ]
    }, (placeDetails, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && placeDetails) {
        // Filter and sort reviews to get the lowest rated ones first
        const sortedReviews = placeDetails.reviews
          ?.sort((a, b) => a.rating - b.rating)
          .map(review => ({
            author_name: review.author_name,
            rating: review.rating,
            text: review.text,
            time: review.time,
            relative_time_description: review.relative_time_description
          })) || [];

        // Mock posts data for now since Google's API doesn't provide posts
        // In a real implementation, you would fetch this from the Google My Business API
        const mockPosts = [
          {
            text: "Check out our latest offerings!",
            created_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            type: 'UPDATE' as const
          },
          {
            text: "Special discount this weekend!",
            created_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            type: 'OFFER' as const
          }
        ];

        const business: Business = {
          id: placeDetails.place_id || crypto.randomUUID(),
          name: placeDetails.name || 'Unknown Business',
          category: placeDetails.types?.[0]?.replace(/_/g, ' ') || 'Business',
          address: placeDetails.formatted_address || 'Address unavailable',
          rating: placeDetails.rating || 0,
          reviews_count: placeDetails.user_ratings_total,
          claimed: placeDetails.business_status === 'OPERATIONAL',
          website: placeDetails.website,
          phone: placeDetails.formatted_phone_number,
          place_id: placeDetails.place_id,
          types: placeDetails.types,
          photos: placeDetails.photos?.map(photo => photo.getUrl({ maxWidth: 800 })),
          hours: placeDetails.opening_hours?.weekday_text?.reduce((acc, day) => {
            const [name, hours] = day.split(': ');
            acc[name] = hours;
            return acc;
          }, {} as Record<string, string>),
          reviews: sortedReviews,
          posts: mockPosts
        };

        setSelectedBusiness(business);
        setCurrentStep(1);
      }
    });
  };

  if (!apiKeys.googlePlaces || !apiKeys.openai) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <Settings className="mx-auto h-12 w-12 text-indigo-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">API Keys Required</h2>
            <p className="text-gray-600 mb-6">
              {isEmbedded ? 
                "Invalid configuration. Please contact the website owner." :
                "Please configure your API keys in the settings to use the scanner."
              }
            </p>
            {!isEmbedded && (
              <Link
                to="/dashboard/settings"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Configure API Keys
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {agency && !isEmbedded && (
        <div className="max-w-5xl mx-auto mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Link>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>

        <div className="mt-8">
          {currentStep === 0 && (
            <SearchStep onSearch={handleBusinessSelect} />
          )}
          {currentStep === 1 && selectedBusiness && (
            <ScanningStep 
              business={selectedBusiness} 
              onScanComplete={() => setCurrentStep(2)}
            />
          )}
          {currentStep === 2 && selectedBusiness && (
            <ReportStep 
              business={selectedBusiness}
              apiKeys={apiKeys}
              isEmbedded={isEmbedded}
              existingReport={existingReport}
            />
          )}
        </div>
      </div>
    </div>
  );
}
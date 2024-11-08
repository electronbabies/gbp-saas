import React from 'react';
import { Tags, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CategoryAnalysisProps {
  currentCategory: string;
  businessName: string;
}

// Helper function to get recommended categories based on primary category
function getRecommendedCategories(primaryCategory: string): string[] {
  const categoryMap: Record<string, string[]> = {
    'restaurant': ['Restaurant', 'Food Delivery', 'Takeout Restaurant'],
    'cafe': ['Cafe', 'Coffee Shop', 'Breakfast Restaurant'],
    'hair_salon': ['Hair Salon', 'Beauty Salon', 'Hairdresser'],
    'gym': ['Gym', 'Fitness Center', 'Personal Trainer'],
    'hotel': ['Hotel', 'Lodging', 'Resort'],
    'dental': ['Dental Clinic', 'Dentist', 'Cosmetic Dentist'],
    'retail': ['Retail Store', 'Shopping Store', 'Boutique'],
    'automotive': ['Auto Repair Shop', 'Car Dealer', 'Auto Parts Store'],
    'real_estate': ['Real Estate Agency', 'Property Management', 'Real Estate Agent'],
    // Add more category mappings as needed
  };

  // Normalize the category string for matching
  const normalizedCategory = primaryCategory.toLowerCase().replace(/[^a-z]/g, '_');
  
  // Return default categories if no specific recommendations found
  return categoryMap[normalizedCategory] || [
    primaryCategory,
    'Local Business',
    'Service Provider'
  ];
}

export default function CategoryAnalysis({ currentCategory, businessName }: CategoryAnalysisProps) {
  const recommendedCategories = getRecommendedCategories(currentCategory);
  const hasRecommendedCategories = recommendedCategories.length > 0;
  const isUsingRecommended = recommendedCategories.includes(currentCategory);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Tags className="h-6 w-6 text-indigo-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">Business Category Analysis</h3>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Current Category</h4>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200">
              {currentCategory}
            </span>
            {isUsingRecommended ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Recommended Categories</h4>
          <div className="flex flex-wrap gap-2">
            {recommendedCategories.map((category, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  category === currentCategory
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Category Optimization Tips</h4>
        <ul className="space-y-2">
          <li className="flex items-start text-sm text-gray-700">
            <CheckCircle2 className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
            Choose up to 10 relevant categories to improve visibility
          </li>
          <li className="flex items-start text-sm text-gray-700">
            <CheckCircle2 className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
            Primary category should be most specific to your business
          </li>
          <li className="flex items-start text-sm text-gray-700">
            <CheckCircle2 className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
            Additional categories should represent other services you offer
          </li>
        </ul>

        {!isUsingRecommended && (
          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
              <p className="text-sm text-yellow-700">
                Consider updating your primary category to one of the recommended options for better visibility in search results.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import React from 'react';
import { MapPin, Star } from 'lucide-react';
import type { Business } from '../App';

interface SelectBusinessStepProps {
  businesses: Business[];
  onSelect: (business: Business) => void;
}

export default function SelectBusinessStep({ businesses, onSelect }: SelectBusinessStepProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
        Select Your Business
      </h2>
      <p className="text-gray-600 mb-8 text-center">
        Choose your business from the list below
      </p>

      <div className="space-y-4">
        {businesses.map((business) => (
          <button
            key={business.id}
            onClick={() => onSelect(business)}
            className="w-full p-6 bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600">
                  {business.name}
                </h3>
                <div className="flex items-center mt-2 text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{business.address}</span>
                </div>
                <div className="mt-2 text-gray-500">{business.category}</div>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-medium text-gray-900">{business.rating}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
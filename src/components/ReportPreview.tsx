import React from 'react';
import { Lock, CheckCircle2, AlertTriangle, Star, TrendingUp, BarChart2, MessageSquare, Image } from 'lucide-react';
import type { BusinessReport } from '../lib/openai';
import type { Business } from '../pages/BusinessScanner';

interface ReportPreviewProps {
  report: BusinessReport;
  business: Business;
  onGetFullReport: () => void;
}

export default function ReportPreview({ report, business, onGetFullReport }: ReportPreviewProps) {
  // Calculate letter grade
  const getLetterGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const { grade } = getLetterGrade(Math.round(report.overallScore));

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Your Google Business Profile Analysis
        </h2>
        <p className="text-xl text-gray-600 mb-4">{business.name}</p>
        <p className="text-gray-500">{business.address}</p>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-indigo-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{business.rating}</div>
            <div className="text-sm text-gray-500">Rating</div>
          </div>
          <div className="text-center">
            <div className="bg-indigo-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{business.reviews_count || 0}</div>
            <div className="text-sm text-gray-500">Reviews</div>
          </div>
          <div className="text-center">
            <div className="bg-indigo-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Image className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{business.photos?.length || 0}</div>
            <div className="text-sm text-gray-500">Photos</div>
          </div>
          <div className="text-center">
            <div className="bg-indigo-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <BarChart2 className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{Math.round(report.overallScore)}</div>
            <div className="text-sm text-gray-500">Overall Score</div>
          </div>
        </div>
      </div>

      {/* Business Photos */}
      {business.photos?.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Image className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Business Photos</h3>
            </div>
            <span className="text-sm text-gray-500">{business.photos.length} photos</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {business.photos.slice(0, 3).map((photo, index) => (
              <div key={index} className="aspect-video rounded-lg overflow-hidden">
                <img 
                  src={photo} 
                  alt={`${business.name} - Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Critical Review */}
      {business.reviews?.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <MessageSquare className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Critical Customer Feedback</h3>
            </div>
            <span className="text-sm text-gray-500">
              {business.reviews.length} total reviews
            </span>
          </div>

          <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="absolute -top-3 -left-3">
              <div className={`flex items-center px-3 py-1 rounded-full text-white shadow-sm ${
                business.reviews[0].rating <= 2 ? 'bg-red-500' :
                business.reviews[0].rating === 3 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}>
                <Star className="h-3.5 w-3.5 fill-current mr-1" />
                <span className="text-sm font-medium">{business.reviews[0].rating}</span>
              </div>
            </div>

            <div className="mt-4">
              <blockquote className="text-gray-700 leading-relaxed">
                "{business.reviews[0].text}"
              </blockquote>
              
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <div>
                  <p className="font-medium text-gray-900">{business.reviews[0].author_name}</p>
                  <p className="text-sm text-gray-500">{business.reviews[0].relative_time_description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blurred Report Preview */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white z-20 pointer-events-none"></div>
        <div className="filter blur-[2px]">
          {report.sections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-xl p-8 mb-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-gray-100">
                    <div className="h-6 w-6 bg-gray-300 rounded"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                    <div className="h-4 w-24 bg-gray-200 rounded mt-1"></div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-300">
                  {Math.round(section.score)}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-24 bg-gray-100 rounded-xl"></div>
                <div className="h-16 bg-gray-50 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lock Overlay */}
      <div className="relative mt-12">
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-transparent z-10"></div>
        <div className="relative z-20">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-12 text-white text-center shadow-xl">
            <div className="bg-white/10 rounded-full p-4 w-20 h-20 mx-auto mb-8 flex items-center justify-center backdrop-blur-sm">
              <Lock className="h-10 w-10 text-white" />
            </div>
            
            <h3 className="text-3xl font-bold mb-6">Unlock Your Complete Analysis</h3>
            
            <div className="max-w-2xl mx-auto mb-8">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Comprehensive recommendations',
                  'Step-by-step action plan',
                  'Competitive analysis',
                  'Priority optimization areas'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <CheckCircle2 className="h-5 w-5 text-indigo-300 mr-3" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onGetFullReport}
              className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Get Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
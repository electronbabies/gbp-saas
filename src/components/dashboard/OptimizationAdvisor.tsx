import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { generateOptimizationAdvice } from '../../lib/openai';
import { useAuthStore } from '../../store/authStore';
import { 
  Lightbulb, X, ArrowRight, TrendingUp, 
  Target, Zap, CheckCircle2, AlertTriangle,
  BarChart2, Globe, Star, Clock, Phone,
  MapPin, Image, MessageSquare, Award
} from 'lucide-react';

interface OptimizationAdvisorProps {
  business: {
    name: string;
    category: string;
    rating: number;
    reviews_count?: number;
    claimed?: boolean;
    website?: string;
    phone?: string;
    hours?: Record<string, string>;
    photos?: string[];
    address?: string;
  };
  onClose: () => void;
}

export default function OptimizationAdvisor({ business, onClose }: OptimizationAdvisorProps) {
  const { apiKeys } = useAuthStore();

  const { data: advice, isLoading, error } = useQuery({
    queryKey: ['optimization-advice', business.name],
    queryFn: () => generateOptimizationAdvice(business, apiKeys.openai || ''),
    enabled: !!apiKeys.openai
  });

  if (!apiKeys.openai) {
    return (
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-xl z-50">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">AI Optimization Advisor</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Please configure your OpenAI API key in Settings to use the AI Advisor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-xl z-50">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">AI Optimization Advisor</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Analyzing business profile and generating recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !advice) {
    return (
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-xl z-50">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">AI Optimization Advisor</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Failed to generate optimization advice. Please try again later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-xl overflow-y-auto z-50">
      <div className="sticky top-0 bg-white z-10 p-6 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Lightbulb className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">AI Optimization Advisor</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Introduction */}
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Overview</h3>
          <p className="text-gray-800">{advice.introduction.overview}</p>
          <p className="mt-2 text-gray-700">{advice.introduction.importance}</p>
        </div>

        {/* Profile Completeness Score */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Profile Completeness</h3>
            <span className="text-2xl font-bold text-indigo-600">{advice.profileOptimization.completenessScore}%</span>
          </div>
          <p className="text-gray-700 mb-4">{advice.profileOptimization.currentStatus}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Present Elements</h4>
              <ul className="space-y-2">
                {advice.profileOptimization.completeness.present.map((item, index) => (
                  <li key={index} className="flex items-center text-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Missing Elements</h4>
              <ul className="space-y-2">
                {advice.profileOptimization.completeness.missing.map((item, index) => (
                  <li key={index} className="flex items-center text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Business Information Analysis */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Business Information Analysis</h3>
          
          <div className="grid gap-4">
            {/* Website Analysis */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Globe className="h-5 w-5 text-indigo-600 mr-2" />
                <h4 className="font-medium text-gray-900">Website</h4>
              </div>
              <p className="text-sm text-gray-700 mb-2">{advice.businessInfo.contactAnalysis.website.status}</p>
              <ul className="space-y-1">
                {advice.businessInfo.contactAnalysis.website.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <ArrowRight className="h-4 w-4 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Phone Analysis */}
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Phone className="h-5 w-5 text-indigo-600 mr-2" />
                <h4 className="font-medium text-gray-900">Phone Number</h4>
              </div>
              <p className="text-sm text-gray-700 mb-2">{advice.businessInfo.contactAnalysis.phone.status}</p>
              <ul className="space-y-1">
                {advice.businessInfo.contactAnalysis.phone.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <ArrowRight className="h-4 w-4 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews Analysis */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Star className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Reviews Analysis</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-indigo-600">{advice.reviewsAnalysis.statistics.totalReviews}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-indigo-600">{advice.reviewsAnalysis.statistics.averageRating}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Sentiment Analysis</h4>
              <div className="space-y-3">
                {advice.reviewsAnalysis.sentimentAnalysis.negativeThemes.map((theme, index) => (
                  <div key={index} className="bg-red-50 rounded-lg p-4">
                    <h5 className="font-medium text-red-800 mb-2">{theme.theme}</h5>
                    <ul className="space-y-1">
                      {theme.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="flex items-start text-sm">
                          <ArrowRight className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-red-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Plan */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center mb-6">
            <Target className="h-6 w-6 mr-2" />
            <h3 className="text-xl font-semibold">Priority Action Plan</h3>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Immediate Actions</h4>
              <div className="space-y-4">
                {advice.actionPlan.immediate.map((action, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{action.task}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        action.priority === 'critical' ? 'bg-red-500' :
                        action.priority === 'high' ? 'bg-orange-500' :
                        'bg-yellow-500'
                      } bg-opacity-25`}>
                        {action.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-white/80 mb-3">{action.impact}</p>
                    <ul className="space-y-2">
                      {action.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start text-sm">
                          <ArrowRight className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-white/90">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">Short-term Optimization</h4>
              <div className="space-y-4">
                {advice.actionPlan.shortTerm.map((action, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{action.task}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        action.priority === 'high' ? 'bg-orange-500' :
                        action.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      } bg-opacity-25`}>
                        {action.priority.toUpperCase()}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {action.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start text-sm">
                          <ArrowRight className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-white/90">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CheckCircle2, XCircle, Star, TrendingUp, BarChart2, 
  AlertTriangle, MessageSquare, Quote, Image, Camera,
  FileText, MapPin, Calendar, Clock, Users
} from 'lucide-react';
import type { Business } from '../pages/BusinessScanner';
import { generateBusinessReport } from '../lib/openai';
import LeadCaptureModal from './LeadCaptureModal';
import { storeLead } from '../lib/supabase';
import ReportPreview from './ReportPreview';
import CategoryAnalysis from './CategoryAnalysis';
import { parseEmbedToken } from '../utils/embedToken';
import type { BusinessReport } from '../lib/openai';

interface ReportStepProps {
  business: Business;
  apiKeys: {
    googlePlaces?: string;
    openai?: string;
  };
  isEmbedded?: boolean;
  existingReport?: BusinessReport | null;
}

function getStrengthExplanation(strength: string): string {
  const explanations: Record<string, string> = {
    'Profile is claimed and verified': 'A verified profile builds trust with customers and gives you full control over your business information.',
    'Strong overall rating': 'High ratings increase visibility in search results and build customer confidence.',
    'Good number of reviews': 'More reviews provide social proof and help potential customers make informed decisions.',
    'Website link provided': 'Direct website links make it easy for customers to find detailed information and make purchases.',
    'Business hours listed': 'Accurate business hours help customers plan their visits and reduce frustration.'
  };

  return explanations[strength] || '';
}

const ReportStep: React.FC<ReportStepProps> = ({ business, apiKeys, isEmbedded = false, existingReport }) => {
  const [report, setReport] = useState<BusinessReport | null>(existingReport || null);
  const [loading, setLoading] = useState(!existingReport);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchParams] = useSearchParams();

  // Get agency ID from token
  const token = searchParams.get('token');
  const tokenData = token ? parseEmbedToken(token) : null;
  const agencyId = tokenData?.agencyId || 'demo';

  useEffect(() => {
    let mounted = true;

    async function generateReport() {
      if (!apiKeys.openai || report) return;

      try {
        setLoading(true);
        setError(null);
        const generatedReport = await generateBusinessReport(business, apiKeys.openai);
        if (mounted) {
          setReport(generatedReport);
        }
      } catch (err) {
        if (mounted) {
          console.error('Error generating report:', err);
          setError('Failed to generate business report. Please try again.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    generateReport();

    return () => {
      mounted = false;
    };
  }, [business, apiKeys.openai, report]);

  const handleEmailSubmit = async (email: string) => {
    if (submitting || !report) return;

    try {
      setSubmitting(true);
      const leadData = {
        email,
        business_name: business.name,
        business_category: business.category,
        business_address: business.address,
        business_rating: business.rating,
        business_reviews_count: business.reviews_count,
        business_claimed: business.claimed,
        business_photos: business.photos,
        business_website: business.website,
        business_phone: business.phone,
        business_hours: business.hours,
        place_id: business.place_id,
        report_data: report,
        agency_id: agencyId,
        source: isEmbedded ? 'embed' : 'app',
        email_sent: false
      };

      await storeLead(leadData);
      setUserEmail(email);
      setShowModal(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error storing lead:', err);
      setError('Failed to save your information. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Generating Your Report
        </h2>
        <p className="text-gray-600">
          Please wait while we analyze your business profile and generate optimization recommendations...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Report Generation Failed
        </h2>
        <p className="text-gray-600 mb-8">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!report) return null;

  if (!userEmail) {
    return (
      <>
        <ReportPreview 
          report={report} 
          business={business}
          onGetFullReport={() => setShowModal(true)} 
        />
        <LeadCaptureModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleEmailSubmit}
        />
      </>
    );
  }

  const filteredSections = report.sections.filter(section => 
    section.title.toLowerCase() !== 'customer reviews'
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Your Google Business Profile Analysis
        </h2>
        <p className="text-xl text-gray-600 mb-4">{business.name}</p>
        <p className="text-gray-500">{business.address}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-xl p-6 text-center shadow-lg">
          <div className="bg-indigo-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <Star className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{business.rating}</div>
          <div className="text-sm text-gray-500">Rating</div>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-lg">
          <div className="bg-indigo-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{business.reviews_count || 0}</div>
          <div className="text-sm text-gray-500">Reviews</div>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-lg">
          <div className="bg-indigo-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <Image className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{business.photos?.length || 0}</div>
          <div className="text-sm text-gray-500">Photos</div>
        </div>
        <div className="bg-white rounded-xl p-6 text-center shadow-lg">
          <div className="bg-indigo-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{Math.round(report.overallScore)}</div>
          <div className="text-sm text-gray-500">Overall Score</div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Summary</h3>
        <p className="text-gray-700 leading-relaxed mb-6">{report.summary.overview}</p>
        <div className="space-y-4">
          {report.summary.strengths.map((strength, index) => (
            <div key={index} className="bg-green-50 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">{strength}</p>
                  <p className="text-sm text-green-700 mt-1">{getStrengthExplanation(strength)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Photos */}
      {business.photos && business.photos.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Image className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Business Photos</h3>
            </div>
            <span className="text-sm text-gray-500">{business.photos.length} photos</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
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

          <div className="bg-indigo-50 rounded-lg p-4">
            <h4 className="font-medium text-indigo-900 mb-3">Photo Best Practices</h4>
            <ul className="space-y-2">
              <li className="flex items-start text-sm text-indigo-800">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 mr-2 mt-0.5" />
                Use high-quality, well-lit photos that showcase your business
              </li>
              <li className="flex items-start text-sm text-indigo-800">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 mr-2 mt-0.5" />
                Include a mix of interior, exterior, and product/service photos
              </li>
              <li className="flex items-start text-sm text-indigo-800">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 mr-2 mt-0.5" />
                Update photos regularly to show current offerings and seasonal changes
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Category Analysis */}
      <CategoryAnalysis 
        currentCategory={business.category}
        businessName={business.name}
      />

      {/* Critical Customer Feedback */}
      {business.reviews && business.reviews.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <MessageSquare className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Critical Customer Feedback</h3>
            </div>
            <span className="text-sm text-gray-500">
              Showing {Math.min(3, business.reviews.length)} critical reviews
            </span>
          </div>

          <div className="grid gap-6">
            {business.reviews.slice(0, 3).map((review, index) => (
              <div 
                key={index} 
                className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 shadow-sm"
              >
                <Quote className="absolute top-4 right-4 h-12 w-12 text-indigo-50 transform rotate-12" />
                
                <div className="absolute -top-3 -left-3">
                  <div className={`flex items-center px-3 py-1 rounded-full text-white shadow-sm ${
                    review.rating <= 2 ? 'bg-red-500' :
                    review.rating === 3 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}>
                    <Star className="h-3.5 w-3.5 fill-current mr-1" />
                    <span className="text-sm font-medium">{review.rating}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <blockquote className="text-gray-700 leading-relaxed relative z-10">
                    "{review.text}"
                  </blockquote>
                  
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div>
                      <p className="font-medium text-gray-900">{review.author_name}</p>
                      <p className="text-sm text-gray-500">{review.relative_time_description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Business Posts */}
      {business.posts && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">Business Posts</h3>
            </div>
          </div>

          {business.posts.length > 0 ? (
            <div className="grid gap-6">
              {business.posts.map((post, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <p className="text-gray-700">{post.text}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(post.created_time).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                      {post.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">No Recent Posts Found</h4>
                  <p className="mt-2 text-sm text-yellow-700">
                    Regular posts help keep your profile active and engage customers. Consider posting:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                    <li>• Special offers and promotions</li>
                    <li>• New products or services</li>
                    <li>• Business updates and events</li>
                    <li>• Customer testimonials</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 bg-indigo-50 rounded-lg p-4">
            <h4 className="font-medium text-indigo-900 mb-3">Posting Best Practices</h4>
            <ul className="space-y-2">
              <li className="flex items-start text-sm text-indigo-800">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 mr-2 mt-0.5" />
                Post at least once per week to maintain engagement
              </li>
              <li className="flex items-start text-sm text-indigo-800">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 mr-2 mt-0.5" />
                Include high-quality images with your posts
              </li>
              <li className="flex items-start text-sm text-indigo-800">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 mr-2 mt-0.5" />
                Use a mix of post types (updates, offers, events)
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Optimization Recommendations */}
      <div className="space-y-6">
        {filteredSections.map((section, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  section.priority === 'high' ? 'bg-red-100' :
                  section.priority === 'medium' ? 'bg-yellow-100' :
                  'bg-green-100'
                }`}>
                  <TrendingUp className={`h-5 w-5 ${
                    section.priority === 'high' ? 'text-red-600' :
                    section.priority === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                </div>
                <h3 className="text-lg font-semibold">{section.title}</h3>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  section.priority === 'high' ? 'bg-red-100 text-red-800' :
                  section.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {section.priority.charAt(0).toUpperCase() + section.priority.slice(1)} Priority
                </span>
                <span className="text-2xl font-bold text-indigo-600">
                  {Math.round(section.score)}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              {section.recommendations.map((rec, recIndex) => (
                <div key={recIndex} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${
                      rec.impact === 'high' ? 'text-red-500' :
                      rec.impact === 'medium' ? 'text-amber-500' :
                      'text-green-500'
                    }`} />
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{rec.action}</h4>
                      <p className="text-gray-600 leading-relaxed mb-4">{rec.details}</p>
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Implementation Steps:</h5>
                        <ul className="space-y-2">
                          {rec.implementation.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start text-sm text-gray-600">
                              <span className="font-medium mr-2">{stepIndex + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportStep;
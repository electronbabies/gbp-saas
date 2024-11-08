import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  X, FileText, MapPin, Phone, Globe, Star, Lightbulb, Mail,
  Users, TrendingUp, BarChart2, CheckCircle2, AlertTriangle,
  Calendar, Clock, ArrowRight
} from 'lucide-react';
import { getLead } from '../../lib/supabase';
import { formatDate } from '../../utils/dateFormatter';
import OptimizationAdvisor from './OptimizationAdvisor';
import { googleMapsManager } from '../../utils/googleMaps';
import { useAuthStore } from '../../store/authStore';

interface LeadDetailsProps {
  leadId: string;
  onClose: () => void;
}

const buttonClasses = "inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors";

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-50';
  if (score >= 60) return 'bg-yellow-50';
  return 'bg-red-50';
}

export default function LeadDetails({ leadId, onClose }: LeadDetailsProps) {
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const { apiKeys } = useAuthStore();

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', leadId],
    queryFn: () => getLead(leadId)
  });

  useEffect(() => {
    let mounted = true;
    
    async function initializeMap() {
      if (!lead?.business_address || !apiKeys.googlePlaces) return;

      try {
        await googleMapsManager.loadGoogleMaps(apiKeys.googlePlaces);

        if (!mounted) return;

        const geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({ address: lead.business_address }, (results, status) => {
          if (!mounted) return;
          
          if (status === 'OK' && results?.[0]?.geometry?.location) {
            const mapElement = document.getElementById('business-map');
            if (!mapElement) {
              setMapError('Map container not found');
              return;
            }

            const newMap = new google.maps.Map(mapElement, {
              center: results[0].geometry.location,
              zoom: 15,
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }]
                }
              ]
            });

            const newMarker = new google.maps.Marker({
              map: newMap,
              position: results[0].geometry.location,
              title: lead.business_name
            });

            setMap(newMap);
            setMarker(newMarker);
            setMapError(null);
          } else {
            setMapError('Could not locate business address');
          }
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to load map');
      }
    }

    initializeMap();

    return () => {
      mounted = false;
      if (marker) marker.setMap(null);
    };
  }, [lead?.business_address, lead?.business_name, apiKeys.googlePlaces]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!lead) return null;

  const overallScore = lead.report_data?.overallScore || 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-50 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-t-xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <div className="absolute transform rotate-45 translate-x-1/2 -translate-y-1/2 bg-white w-full h-full"></div>
          </div>
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">{lead.business_name}</h2>
              <p className="text-indigo-200 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {lead.business_category}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAdvisor(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                AI Advisor
              </button>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-indigo-200">Overall Score</span>
                <BarChart2 className="h-5 w-5 text-indigo-300" />
              </div>
              <div className="text-2xl font-bold">{overallScore}/100</div>
              <div className="mt-2 bg-white/20 rounded-full h-2">
                <div 
                  className="bg-indigo-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${overallScore}%` }}
                />
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-indigo-200">Rating</span>
                <Star className="h-5 w-5 text-indigo-300" />
              </div>
              <div className="text-2xl font-bold">{lead.business_rating}/5</div>
              <div className="mt-2 text-sm text-indigo-200">
                {lead.business_reviews_count || 0} reviews
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-indigo-200">Profile Status</span>
                {lead.business_claimed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                )}
              </div>
              <div className="text-2xl font-bold">
                {lead.business_claimed ? 'Claimed' : 'Unclaimed'}
              </div>
              <div className="mt-2 text-sm text-indigo-200">
                {lead.business_claimed ? 'Verified Business' : 'Verification Needed'}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Map */}
              <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                {mapError ? (
                  <div className="w-full h-64 flex items-center justify-center bg-gray-100">
                    <div className="text-center text-gray-500">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p>{mapError}</p>
                    </div>
                  </div>
                ) : (
                  <div id="business-map" className="w-full h-64"></div>
                )}
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                <div className="grid gap-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-indigo-500 mr-3" />
                    <span className="text-gray-700">{lead.business_address}</span>
                  </div>
                  {lead.business_phone && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-5 w-5 text-indigo-500 mr-3" />
                      <span className="text-gray-700">{lead.business_phone}</span>
                    </div>
                  )}
                  {lead.business_website && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Globe className="h-5 w-5 text-indigo-500 mr-3" />
                      <a 
                        href={lead.business_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        {lead.business_website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Lead Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Information</h3>
                <div className="grid gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-1">
                      <Mail className="h-4 w-4 text-indigo-500 mr-2" />
                      <span className="text-sm font-medium text-gray-500">Email</span>
                    </div>
                    <p className="text-gray-900">{lead.email}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-1">
                      <Calendar className="h-4 w-4 text-indigo-500 mr-2" />
                      <span className="text-sm font-medium text-gray-500">Captured On</span>
                    </div>
                    <p className="text-gray-900">{formatDate(lead.created_at)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-1">
                      <Users className="h-4 w-4 text-indigo-500 mr-2" />
                      <span className="text-sm font-medium text-gray-500">Source</span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      lead.source === 'embed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {lead.source || 'app'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Analysis</h3>
                <div className="space-y-4">
                  {lead.report_data?.sections.map((section, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">{section.title}</span>
                        <span className={`${getScoreColor(section.score)} font-semibold`}>
                          {section.score}/100
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            section.score >= 80 ? 'bg-green-500' :
                            section.score >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${section.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 transition-colors"
            >
              Close
            </button>
            <Link
              to={`/scanner?business=${encodeURIComponent(JSON.stringify({
                id: lead.place_id || crypto.randomUUID(),
                name: lead.business_name,
                category: lead.business_category,
                address: lead.business_address,
                rating: lead.business_rating,
                reviews_count: lead.business_reviews_count,
                claimed: lead.business_claimed,
                photos: lead.business_photos,
                website: lead.business_website,
                phone: lead.business_phone,
                hours: lead.business_hours,
                place_id: lead.place_id
              }))}&report=${encodeURIComponent(JSON.stringify(lead.report_data))}`}
              onClick={onClose}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg flex items-center shadow-lg hover:shadow-xl transition-all"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Full Report
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>

      {/* AI Advisor Side Panel */}
      {showAdvisor && (
        <OptimizationAdvisor
          business={{
            name: lead.business_name,
            category: lead.business_category,
            rating: lead.business_rating,
            reviews_count: lead.business_reviews_count,
            claimed: lead.business_claimed,
            website: lead.business_website,
            phone: lead.business_phone,
            hours: lead.business_hours
          }}
          onClose={() => setShowAdvisor(false)}
        />
      )}
    </div>
  );
}
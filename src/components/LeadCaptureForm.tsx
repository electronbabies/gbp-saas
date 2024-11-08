import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { storeLead } from '../lib/supabase';

interface LeadCaptureFormProps {
  onSubmit: (email: string, sendEmail: boolean) => void;
  businessData: {
    name: string;
    category: string;
    address: string;
    rating: number;
  };
  reportData: any;
}

export default function LeadCaptureForm({ 
  onSubmit, 
  businessData,
  reportData 
}: LeadCaptureFormProps) {
  const [email, setEmail] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [error, setError] = useState('');
  const agency = useAuthStore(state => state.agency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      if (agency) {
        await storeLead(agency.id, email, businessData, reportData);
      }
      onSubmit(email, sendEmail);
    } catch (err) {
      setError('Failed to save lead. Please try again.');
    }
  };

  // Rest of the component remains the same...
}
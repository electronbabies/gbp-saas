import { supabase } from './supabase';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  agency_id: string;
  created_at: string;
}

export async function sendEmail(to: string, templateId: string, data: Record<string, any>) {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: { to, templateId, data }
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .insert([template])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating template:', error);
    return null;
  }
}

export async function updateEmailTemplate(id: string, updates: Partial<EmailTemplate>) {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating template:', error);
    return null;
  }
}

export async function deleteEmailTemplate(id: string) {
  try {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting template:', error);
    return false;
  }
}
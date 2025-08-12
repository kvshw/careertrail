import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

// User Profile types
export interface UserProfile {
  id: string
  user_id: string
  first_name?: string
  last_name?: string
  display_name?: string
  bio?: string
  location?: string
  website?: string
  linkedin?: string
  github?: string
  avatar_url?: string
  phone?: string
  timezone?: string
  preferences?: {
    email_notifications: boolean
    weekly_summary: boolean
    job_alerts: boolean
  }
  created_at: string
  updated_at: string
}

export interface UserProfileFormData {
  first_name?: string
  last_name?: string
  display_name?: string
  bio?: string
  location?: string
  website?: string
  linkedin?: string
  github?: string
  avatar_url?: string
  phone?: string
  timezone?: string
  preferences: {
    email_notifications: boolean
    weekly_summary: boolean
    job_alerts: boolean
  }
}

// Database types
export interface Job {
  id: string
  company: string
  role: string
  status: 'applied' | 'interviewing' | 'offer' | 'rejected'
  applied_date: string
  link?: string
  notes?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  country: string
  industry?: string
  website?: string
  logo_url?: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  job_id?: string
  folder_id?: string
  name: string
  description?: string
  file_path: string
  file_size: number
  file_type: string
  category: 'resume' | 'cover_letter' | 'portfolio' | 'certificate' | 'other'
  version: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Folder {
  id: string
  user_id: string
  name: string
  description?: string
  color: string
  parent_folder_id?: string
  created_at: string
  updated_at: string
}

export interface FolderFormData {
  name: string
  description?: string
  color?: string
  parent_folder_id?: string
}

export interface DocumentFormData {
  name: string
  description?: string
  category: 'resume' | 'cover_letter' | 'portfolio' | 'certificate' | 'other'
  job_id?: string
  folder_id?: string
}

export interface DocumentAnalysisRecord {
  id: string
  user_id: string
  document_id: string
  result: any
  created_at: string
}

export interface DocumentOptimizationRecord {
  id: string
  user_id: string
  document_id: string
  job_description: string
  optimization_result: any
  created_at: string
  updated_at: string
}

export interface JobFormData {
  company: string
  role: string
  status: 'applied' | 'interviewing' | 'offer' | 'rejected'
  applied_date: string
  link?: string
  notes?: string
}

// New types for job activities and metrics
export interface JobActivity {
  id: string
  user_id: string
  job_id: string
  activity_type: 'applied' | 'interview_scheduled' | 'interview_completed' | 'offer_received' | 'offer_accepted' | 'offer_declined' | 'rejected' | 'withdrawn' | 'follow_up_sent' | 'thank_you_sent'
  description?: string
  activity_date: string
  created_at: string
}

export interface JobMetrics {
  totalApplications: number
  applicationsThisMonth: number
  interviewRate: number
  offerRate: number
  averageResponseTime: number
  statusBreakdown: {
    applied: number
    interviewing: number
    offer: number
    rejected: number
  }
  recentActivity: JobActivity[]
  topCompanies: Array<{
    company: string
    count: number
  }>
}

// Contact types
export interface Contact {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  company?: string
  role?: string
  linkedin_url?: string
  category: 'recruiter' | 'hiring_manager' | 'colleague' | 'networking' | 'referral' | 'other'
  status: 'active' | 'inactive' | 'archived'
  source?: 'linkedin' | 'referral' | 'cold_outreach' | 'event' | 'mutual_connection' | 'other'
  relationship_strength?: number
  notes?: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ContactFormData {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  company?: string
  role?: string
  linkedin_url?: string
  category: 'recruiter' | 'hiring_manager' | 'colleague' | 'networking' | 'referral' | 'other'
  status: 'active' | 'inactive' | 'archived'
  source?: 'linkedin' | 'referral' | 'cold_outreach' | 'event' | 'mutual_connection' | 'other'
  relationship_strength?: number
  notes?: string
  tags?: string[]
}

// Contact Interaction types
export interface ContactInteraction {
  id: string
  contact_id: string
  user_id: string
  job_id?: string
  interaction_type: 'email' | 'call' | 'meeting' | 'linkedin_message' | 'note' | 'coffee_chat' | 'referral_request'
  subject?: string
  content?: string
  direction: 'inbound' | 'outbound'
  response_received: boolean
  follow_up_date?: string
  created_at: string
}

export interface ContactInteractionFormData {
  contact_id: string
  job_id?: string
  interaction_type: 'email' | 'call' | 'meeting' | 'linkedin_message' | 'note' | 'coffee_chat' | 'referral_request'
  subject?: string
  content?: string
  direction: 'inbound' | 'outbound'
  response_received?: boolean
  follow_up_date?: string
}

// Contact Job Relationship types
export interface ContactJob {
  id: string
  contact_id: string
  job_id: string
  relationship_type: 'referrer' | 'interviewer' | 'hiring_manager' | 'colleague' | 'decision_maker' | 'other'
  notes?: string
  created_at: string
}

export interface ContactJobFormData {
  contact_id: string
  job_id: string
  relationship_type: 'referrer' | 'interviewer' | 'hiring_manager' | 'colleague' | 'decision_maker' | 'other'
  notes?: string
}

// Interview Types
export interface Interview {
  id: string
  user_id: string
  job_id?: string
  title: string
  interview_type: 'phone' | 'video' | 'onsite' | 'technical' | 'behavioral' | 'final' | 'coffee_chat' | 'other'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show'
  scheduled_date: string
  duration_minutes: number
  location?: string
  meeting_url?: string
  interviewer_name?: string
  interviewer_role?: string
  interviewer_email?: string
  notes?: string
  preparation_notes?: string
  feedback?: string
  outcome?: 'pending' | 'positive' | 'negative' | 'neutral' | 'offer' | 'rejection' | 'next_round'
  created_at: string
  updated_at: string
  jobs?: Job
}

export interface InterviewFormData {
  job_id?: string
  title: string
  interview_type: 'phone' | 'video' | 'onsite' | 'technical' | 'behavioral' | 'final' | 'coffee_chat' | 'other'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show'
  scheduled_date: string
  duration_minutes: number
  location?: string
  meeting_url?: string
  interviewer_name?: string
  interviewer_role?: string
  interviewer_email?: string
  notes?: string
  preparation_notes?: string
  feedback?: string
  outcome?: 'pending' | 'positive' | 'negative' | 'neutral' | 'offer' | 'rejection' | 'next_round'
}

export interface InterviewRound {
  id: string
  interview_id: string
  round_number: number
  round_type: 'phone' | 'video' | 'onsite' | 'technical' | 'behavioral' | 'final' | 'coffee_chat' | 'other'
  scheduled_date: string
  duration_minutes: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show'
  interviewer_name?: string
  interviewer_role?: string
  interviewer_email?: string
  location?: string
  meeting_url?: string
  notes?: string
  feedback?: string
  outcome?: 'pending' | 'positive' | 'negative' | 'neutral' | 'next_round' | 'rejection'
  created_at: string
  updated_at: string
}

export interface InterviewRoundFormData {
  round_number: number
  round_type: 'phone' | 'video' | 'onsite' | 'technical' | 'behavioral' | 'final' | 'coffee_chat' | 'other'
  scheduled_date: string
  duration_minutes: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show'
  interviewer_name?: string
  interviewer_role?: string
  interviewer_email?: string
  location?: string
  meeting_url?: string
  notes?: string
  feedback?: string
  outcome?: 'pending' | 'positive' | 'negative' | 'neutral' | 'next_round' | 'rejection'
}

export interface InterviewQuestion {
  id: string
  user_id: string
  category: 'technical' | 'behavioral' | 'company' | 'role_specific' | 'general' | 'custom'
  question: string
  answer_template?: string
  tags?: string[]
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface InterviewQuestionFormData {
  category: 'technical' | 'behavioral' | 'company' | 'role_specific' | 'general' | 'custom'
  question: string
  answer_template?: string
  tags?: string[]
  is_favorite?: boolean
}

export interface InterviewQuestionResponse {
  id: string
  interview_id: string
  question_id?: string
  question_text: string
  response?: string
  rating?: number
  notes?: string
  created_at: string
}

export interface InterviewQuestionResponseFormData {
  question_id?: string
  question_text: string
  response?: string
  rating?: number
  notes?: string
} 
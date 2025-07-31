-- Create contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  role TEXT,
  linkedin_url TEXT,
  category TEXT NOT NULL DEFAULT 'networking' CHECK (category IN ('recruiter', 'hiring_manager', 'colleague', 'networking', 'referral', 'other')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  source TEXT CHECK (source IN ('linkedin', 'referral', 'cold_outreach', 'event', 'mutual_connection', 'other')),
  relationship_strength INTEGER CHECK (relationship_strength >= 1 AND relationship_strength <= 5),
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for contacts
CREATE INDEX contacts_user_id_idx ON contacts(user_id);
CREATE INDEX contacts_company_idx ON contacts(company);
CREATE INDEX contacts_category_idx ON contacts(category);
CREATE INDEX contacts_status_idx ON contacts(status);
CREATE INDEX contacts_created_at_idx ON contacts(created_at);

-- Create contact interactions table
CREATE TABLE contact_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('email', 'call', 'meeting', 'linkedin_message', 'note', 'coffee_chat', 'referral_request')),
  subject TEXT,
  content TEXT,
  direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
  response_received BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for contact interactions
CREATE INDEX contact_interactions_contact_id_idx ON contact_interactions(contact_id);
CREATE INDEX contact_interactions_user_id_idx ON contact_interactions(user_id);
CREATE INDEX contact_interactions_job_id_idx ON contact_interactions(job_id);
CREATE INDEX contact_interactions_created_at_idx ON contact_interactions(created_at);
CREATE INDEX contact_interactions_follow_up_date_idx ON contact_interactions(follow_up_date);

-- Create contact job relationships table (many-to-many)
CREATE TABLE contact_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('referrer', 'interviewer', 'hiring_manager', 'colleague', 'decision_maker', 'other')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contact_id, job_id)
);

-- Create indexes for contact jobs
CREATE INDEX contact_jobs_contact_id_idx ON contact_jobs(contact_id);
CREATE INDEX contact_jobs_job_id_idx ON contact_jobs(job_id);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contacts
CREATE POLICY "Users can view their own contacts" ON contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts" ON contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" ON contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" ON contacts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for contact_interactions
CREATE POLICY "Users can view their own contact interactions" ON contact_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contact interactions" ON contact_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact interactions" ON contact_interactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contact interactions" ON contact_interactions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for contact_jobs
CREATE POLICY "Users can view their own contact job relationships" ON contact_jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contacts 
      WHERE contacts.id = contact_jobs.contact_id 
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own contact job relationships" ON contact_jobs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM contacts 
      WHERE contacts.id = contact_jobs.contact_id 
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own contact job relationships" ON contact_jobs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM contacts 
      WHERE contacts.id = contact_jobs.contact_id 
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own contact job relationships" ON contact_jobs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM contacts 
      WHERE contacts.id = contact_jobs.contact_id 
      AND contacts.user_id = auth.uid()
    )
  );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for contacts updated_at
CREATE TRIGGER update_contacts_updated_at 
  BEFORE UPDATE ON contacts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 
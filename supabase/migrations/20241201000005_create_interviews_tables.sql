-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  interview_type TEXT NOT NULL CHECK (interview_type IN ('phone', 'video', 'onsite', 'technical', 'behavioral', 'final', 'coffee_chat', 'other')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show')),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_url TEXT,
  interviewer_name TEXT,
  interviewer_role TEXT,
  interviewer_email TEXT,
  notes TEXT,
  preparation_notes TEXT,
  feedback TEXT,
  outcome TEXT CHECK (outcome IN ('pending', 'positive', 'negative', 'neutral', 'offer', 'rejection', 'next_round')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview_rounds table for multi-round interviews
CREATE TABLE IF NOT EXISTS interview_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  round_type TEXT NOT NULL CHECK (round_type IN ('phone', 'video', 'onsite', 'technical', 'behavioral', 'final', 'coffee_chat', 'other')),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled', 'no_show')),
  interviewer_name TEXT,
  interviewer_role TEXT,
  interviewer_email TEXT,
  location TEXT,
  meeting_url TEXT,
  notes TEXT,
  feedback TEXT,
  outcome TEXT CHECK (outcome IN ('pending', 'positive', 'negative', 'neutral', 'next_round', 'rejection')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(interview_id, round_number)
);

-- Create interview_questions table for question bank
CREATE TABLE IF NOT EXISTS interview_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('technical', 'behavioral', 'company', 'role_specific', 'general', 'custom')),
  question TEXT NOT NULL,
  answer_template TEXT,
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview_question_responses table to track responses during interviews
CREATE TABLE IF NOT EXISTS interview_question_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES interview_questions(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  response TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_job_id ON interviews(job_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_date ON interviews(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interview_rounds_interview_id ON interview_rounds(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_user_id ON interview_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_category ON interview_questions(category);
CREATE INDEX IF NOT EXISTS idx_interview_question_responses_interview_id ON interview_question_responses(interview_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interview_rounds_updated_at BEFORE UPDATE ON interview_rounds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interview_questions_updated_at BEFORE UPDATE ON interview_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_question_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for interviews
CREATE POLICY "Users can view their own interviews" ON interviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interviews" ON interviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interviews" ON interviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interviews" ON interviews
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for interview_rounds
CREATE POLICY "Users can view their own interview rounds" ON interview_rounds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM interviews 
      WHERE interviews.id = interview_rounds.interview_id 
      AND interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own interview rounds" ON interview_rounds
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM interviews 
      WHERE interviews.id = interview_rounds.interview_id 
      AND interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own interview rounds" ON interview_rounds
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM interviews 
      WHERE interviews.id = interview_rounds.interview_id 
      AND interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own interview rounds" ON interview_rounds
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM interviews 
      WHERE interviews.id = interview_rounds.interview_id 
      AND interviews.user_id = auth.uid()
    )
  );

-- Create RLS policies for interview_questions
CREATE POLICY "Users can view their own interview questions" ON interview_questions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interview questions" ON interview_questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview questions" ON interview_questions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interview questions" ON interview_questions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for interview_question_responses
CREATE POLICY "Users can view their own interview question responses" ON interview_question_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM interviews 
      WHERE interviews.id = interview_question_responses.interview_id 
      AND interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own interview question responses" ON interview_question_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM interviews 
      WHERE interviews.id = interview_question_responses.interview_id 
      AND interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own interview question responses" ON interview_question_responses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM interviews 
      WHERE interviews.id = interview_question_responses.interview_id 
      AND interviews.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own interview question responses" ON interview_question_responses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM interviews 
      WHERE interviews.id = interview_question_responses.interview_id 
      AND interviews.user_id = auth.uid()
    )
  ); 
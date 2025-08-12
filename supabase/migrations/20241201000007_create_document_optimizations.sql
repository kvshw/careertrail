-- Create document_optimizations table for storing AI optimization results
CREATE TABLE IF NOT EXISTS public.document_optimizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  job_description TEXT NOT NULL,
  optimization_result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_optimizations_document_id ON public.document_optimizations(document_id);
CREATE INDEX IF NOT EXISTS idx_document_optimizations_user_id ON public.document_optimizations(user_id);
CREATE INDEX IF NOT EXISTS idx_document_optimizations_created_at ON public.document_optimizations(created_at DESC);

-- Enable RLS
ALTER TABLE public.document_optimizations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own optimizations" ON public.document_optimizations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own optimizations" ON public.document_optimizations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own optimizations" ON public.document_optimizations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own optimizations" ON public.document_optimizations
  FOR DELETE USING (auth.uid() = user_id);



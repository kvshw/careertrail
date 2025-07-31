import { supabase } from './supabase'
import { Interview, InterviewFormData, InterviewRound, InterviewRoundFormData, InterviewQuestion, InterviewQuestionFormData, InterviewQuestionResponse, InterviewQuestionResponseFormData } from './supabase'

export class InterviewService {
  // Interview CRUD operations
  static async getInterviews(userId: string): Promise<Interview[]> {
    const { data, error } = await supabase
      .from('interviews')
      .select(`
        *,
        jobs (
          id,
          company,
          role,
          status
        )
      `)
      .eq('user_id', userId)
      .order('scheduled_date', { ascending: true })

    if (error) {
      throw new Error(`Error fetching interviews: ${error.message}`)
    }

    return data || []
  }

  static async getInterview(id: string, userId: string): Promise<Interview> {
    const { data, error } = await supabase
      .from('interviews')
      .select(`
        *,
        jobs (
          id,
          company,
          role,
          status
        )
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      throw new Error(`Error fetching interview: ${error.message}`)
    }

    return data
  }

  static async createInterview(interviewData: InterviewFormData, userId: string): Promise<Interview> {
    const { data, error } = await supabase
      .from('interviews')
      .insert([{ ...interviewData, user_id: userId }])
      .select(`
        *,
        jobs (
          id,
          company,
          role,
          status
        )
      `)
      .single()

    if (error) {
      throw new Error(`Error creating interview: ${error.message}`)
    }

    return data
  }

  static async updateInterview(id: string, updates: Partial<InterviewFormData>, userId: string): Promise<Interview> {
    const { data, error } = await supabase
      .from('interviews')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select(`
        *,
        jobs (
          id,
          company,
          role,
          status
        )
      `)
      .single()

    if (error) {
      throw new Error(`Error updating interview: ${error.message}`)
    }

    return data
  }

  static async deleteInterview(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('interviews')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Error deleting interview: ${error.message}`)
    }
  }

  // Interview Rounds operations
  static async getInterviewRounds(interviewId: string, userId: string): Promise<InterviewRound[]> {
    // First verify the interview belongs to the user
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select('id')
      .eq('id', interviewId)
      .eq('user_id', userId)
      .single()

    if (interviewError) {
      throw new Error(`Error verifying interview access: ${interviewError.message}`)
    }

    const { data, error } = await supabase
      .from('interview_rounds')
      .select('*')
      .eq('interview_id', interviewId)
      .order('round_number', { ascending: true })

    if (error) {
      throw new Error(`Error fetching interview rounds: ${error.message}`)
    }

    return data || []
  }

  static async createInterviewRound(roundData: InterviewRoundFormData, interviewId: string, userId: string): Promise<InterviewRound> {
    // First verify the interview belongs to the user
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select('id')
      .eq('id', interviewId)
      .eq('user_id', userId)
      .single()

    if (interviewError) {
      throw new Error(`Error verifying interview access: ${interviewError.message}`)
    }

    const { data, error } = await supabase
      .from('interview_rounds')
      .insert([{ ...roundData, interview_id: interviewId }])
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating interview round: ${error.message}`)
    }

    return data
  }

  static async updateInterviewRound(id: string, updates: Partial<InterviewRoundFormData>, userId: string): Promise<InterviewRound> {
    // First verify the round belongs to a user's interview
    const { data: round, error: roundError } = await supabase
      .from('interview_rounds')
      .select('interview_id')
      .eq('id', id)
      .single()

    if (roundError) {
      throw new Error(`Error verifying round access: ${roundError.message}`)
    }

    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select('id')
      .eq('id', round.interview_id)
      .eq('user_id', userId)
      .single()

    if (interviewError) {
      throw new Error(`Error verifying interview access: ${interviewError.message}`)
    }

    const { data, error } = await supabase
      .from('interview_rounds')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating interview round: ${error.message}`)
    }

    return data
  }

  static async deleteInterviewRound(id: string, userId: string): Promise<void> {
    // First verify the round belongs to a user's interview
    const { data: round, error: roundError } = await supabase
      .from('interview_rounds')
      .select('interview_id')
      .eq('id', id)
      .single()

    if (roundError) {
      throw new Error(`Error verifying round access: ${roundError.message}`)
    }

    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select('id')
      .eq('id', round.interview_id)
      .eq('user_id', userId)
      .single()

    if (interviewError) {
      throw new Error(`Error verifying interview access: ${interviewError.message}`)
    }

    const { error } = await supabase
      .from('interview_rounds')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error deleting interview round: ${error.message}`)
    }
  }

  // Interview Questions operations
  static async getInterviewQuestions(userId: string, category?: string): Promise<InterviewQuestion[]> {
    let query = supabase
      .from('interview_questions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error fetching interview questions: ${error.message}`)
    }

    return data || []
  }

  static async createInterviewQuestion(questionData: InterviewQuestionFormData, userId: string): Promise<InterviewQuestion> {
    const { data, error } = await supabase
      .from('interview_questions')
      .insert([{ ...questionData, user_id: userId }])
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating interview question: ${error.message}`)
    }

    return data
  }

  static async updateInterviewQuestion(id: string, updates: Partial<InterviewQuestionFormData>, userId: string): Promise<InterviewQuestion> {
    const { data, error } = await supabase
      .from('interview_questions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating interview question: ${error.message}`)
    }

    return data
  }

  static async deleteInterviewQuestion(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('interview_questions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Error deleting interview question: ${error.message}`)
    }
  }

  // Interview Question Responses operations
  static async getInterviewQuestionResponses(interviewId: string, userId: string): Promise<InterviewQuestionResponse[]> {
    // First verify the interview belongs to the user
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select('id')
      .eq('id', interviewId)
      .eq('user_id', userId)
      .single()

    if (interviewError) {
      throw new Error(`Error verifying interview access: ${interviewError.message}`)
    }

    const { data, error } = await supabase
      .from('interview_question_responses')
      .select('*')
      .eq('interview_id', interviewId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Error fetching interview question responses: ${error.message}`)
    }

    return data || []
  }

  static async createInterviewQuestionResponse(responseData: InterviewQuestionResponseFormData, interviewId: string, userId: string): Promise<InterviewQuestionResponse> {
    // First verify the interview belongs to the user
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select('id')
      .eq('id', interviewId)
      .eq('user_id', userId)
      .single()

    if (interviewError) {
      throw new Error(`Error verifying interview access: ${interviewError.message}`)
    }

    const { data, error } = await supabase
      .from('interview_question_responses')
      .insert([{ ...responseData, interview_id: interviewId }])
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating interview question response: ${error.message}`)
    }

    return data
  }

  static async updateInterviewQuestionResponse(id: string, updates: Partial<InterviewQuestionResponseFormData>, userId: string): Promise<InterviewQuestionResponse> {
    // First verify the response belongs to a user's interview
    const { data: response, error: responseError } = await supabase
      .from('interview_question_responses')
      .select('interview_id')
      .eq('id', id)
      .single()

    if (responseError) {
      throw new Error(`Error verifying response access: ${responseError.message}`)
    }

    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select('id')
      .eq('id', response.interview_id)
      .eq('user_id', userId)
      .single()

    if (interviewError) {
      throw new Error(`Error verifying interview access: ${interviewError.message}`)
    }

    const { data, error } = await supabase
      .from('interview_question_responses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating interview question response: ${error.message}`)
    }

    return data
  }

  static async deleteInterviewQuestionResponse(id: string, userId: string): Promise<void> {
    // First verify the response belongs to a user's interview
    const { data: response, error: responseError } = await supabase
      .from('interview_question_responses')
      .select('interview_id')
      .eq('id', id)
      .single()

    if (responseError) {
      throw new Error(`Error verifying response access: ${responseError.message}`)
    }

    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .select('id')
      .eq('id', response.interview_id)
      .eq('user_id', userId)
      .single()

    if (interviewError) {
      throw new Error(`Error verifying interview access: ${interviewError.message}`)
    }

    const { error } = await supabase
      .from('interview_question_responses')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error deleting interview question response: ${error.message}`)
    }
  }

  // Utility functions
  static getInterviewTypeIcon(type: Interview['interview_type']): string {
    const icons = {
      phone: '📞',
      video: '📹',
      onsite: '🏢',
      technical: '💻',
      behavioral: '🧠',
      final: '🎯',
      coffee_chat: '☕',
      other: '📋'
    }
    return icons[type] || '📋'
  }

  static getInterviewTypeColor(type: Interview['interview_type']): string {
    const colors = {
      phone: 'bg-blue-100 text-blue-800',
      video: 'bg-purple-100 text-purple-800',
      onsite: 'bg-green-100 text-green-800',
      technical: 'bg-orange-100 text-orange-800',
      behavioral: 'bg-pink-100 text-pink-800',
      final: 'bg-red-100 text-red-800',
      coffee_chat: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  static getStatusColor(status: Interview['status']): string {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rescheduled: 'bg-orange-100 text-orange-800',
      no_show: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  static getOutcomeColor(outcome: Interview['outcome']): string {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-800',
      positive: 'bg-green-100 text-green-800',
      negative: 'bg-red-100 text-red-800',
      neutral: 'bg-yellow-100 text-yellow-800',
      offer: 'bg-emerald-100 text-emerald-800',
      rejection: 'bg-red-100 text-red-800',
      next_round: 'bg-blue-100 text-blue-800'
    }
    return colors[outcome || ''] || 'bg-gray-100 text-gray-800'
  }

  static formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  static formatDateTime(date: string): string {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  static getUpcomingInterviews(interviews: Interview[], days: number = 7): Interview[] {
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    
    return interviews.filter(interview => {
      const interviewDate = new Date(interview.scheduled_date)
      return interviewDate >= now && interviewDate <= futureDate && interview.status === 'scheduled'
    })
  }
} 
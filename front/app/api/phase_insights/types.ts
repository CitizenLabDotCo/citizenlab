export interface PhaseInsightsParticipationMetrics {
  visitors: number;
  participants: number;
  engagement_rate: number;
  // Method-specific metrics
  ideas?: number;
  comments?: number;
  reactions?: number;
  votes?: number;
  submissions?: number;
  votes_per_person?: number;
  completion_rate?: number;
  // Time comparison (for "Last week" deltas)
  visitors_change?: number;
  participants_change?: number;
  ideas_change?: number;
  comments_change?: number;
  reactions_change?: number;
  votes_change?: number;
  submissions_change?: number;
}

export interface DemographicDataPoint {
  key: string;
  label: string;
  count: number;
  percentage: number;
}

export interface PhaseInsightsDemographics {
  gender?: DemographicDataPoint[];
  age?: DemographicDataPoint[];
  areas?: DemographicDataPoint[];
  // Additional custom fields can be added dynamically
  custom_fields?: {
    [field_id: string]: DemographicDataPoint[];
  };
}

export interface TopicDistribution {
  topic: string;
  count: number;
  percentage: number;
}

export interface VotingResultOption {
  option_id: string;
  option_title: string;
  votes: number;
  percentage: number;
}

export interface VotingResults {
  total_votes: number;
  options: VotingResultOption[];
  // Demographic breakdowns
  by_gender?: {
    [option_id: string]: {
      [gender_key: string]: number;
    };
  };
  by_age?: {
    [option_id: string]: {
      [age_range: string]: number;
    };
  };
}

export interface SurveyQuestionResult {
  question_id: string;
  question_title: string;
  question_type: 'multiple_choice' | 'text' | 'number' | 'rating' | 'ranking';
  // For quantitative questions
  aggregated_results?: {
    [option_key: string]: number;
  };
  // For qualitative questions
  ai_summary?: string;
  response_count: number;
}

export interface SurveyInsights {
  total_responses: number;
  completion_rate: number;
  questions: SurveyQuestionResult[];
}

export interface IdeaInsights {
  total_ideas: number;
  total_comments: number;
  total_reactions: number;
  ai_summary?: string;
  topic_distribution?: TopicDistribution[];
  top_ideas?: {
    id: string;
    title: string;
    reactions_count: number;
    comments_count: number;
  }[];
}

export interface ProposalInsights extends IdeaInsights {
  proposals_close_to_threshold?: {
    id: string;
    title: string;
    current_votes: number;
    threshold: number;
    percentage_to_threshold: number;
  }[];
  proposals_approaching_deadline?: {
    id: string;
    title: string;
    deadline: string;
    days_remaining: number;
  }[];
}

export interface CommonGroundInsights {
  total_participants: number;
  statements: {
    statement_id: string;
    statement_text: string;
    agree_percentage: number;
    disagree_percentage: number;
    neutral_percentage: number;
  }[];
  consensus_level?: number;
}

// Union type for method-specific insights
export type MethodSpecificInsights =
  | { method: 'ideation'; data: IdeaInsights }
  | { method: 'proposals'; data: ProposalInsights }
  | { method: 'native_survey' | 'survey'; data: SurveyInsights }
  | { method: 'voting' | 'budgeting'; data: VotingResults }
  | { method: 'common_ground'; data: CommonGroundInsights }
  | { method: 'poll'; data: VotingResults };

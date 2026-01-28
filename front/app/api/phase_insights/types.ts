import { IResolution } from 'components/admin/ResolutionControl';

/**
 * Type for 7-day rolling change values
 * - number: percentage change (e.g., 25.0 means +25%)
 * - null: phase has not yet run for 14 days
 * - 'last_7_days_compared_with_zero': previous 7-day period had zero events (division by zero)
 */
export type SevenDayChange = number | null | 'last_7_days_compared_with_zero';

/**
 * Method-specific metric types
 * These match the backend API response structure from phase insights endpoint
 */
export interface IdeationMetrics {
  ideas_posted: number;
  ideas_posted_7_day_percent_change?: SevenDayChange;
  comments_posted: number;
  comments_posted_7_day_percent_change?: SevenDayChange;
  reactions: number;
  reactions_7_day_percent_change?: SevenDayChange;
}

export interface ProposalsMetrics extends IdeationMetrics {
  reached_threshold: number;
  reached_threshold_7_day_percent_change?: SevenDayChange;
}

interface BaseVotingMetrics {
  voting_method: string;
  voters: number;
  voters_7_day_percent_change?: SevenDayChange;
  associated_ideas: number;
  comments_posted: number;
  comments_posted_7_day_percent_change?: SevenDayChange;
}

export interface VotingMetrics extends BaseVotingMetrics {
  online_votes: number;
  online_votes_7_day_percent_change?: SevenDayChange;
  offline_votes: number;
}

export interface BudgetingMetrics extends BaseVotingMetrics {
  voting_method: 'budgeting';
  online_picks: number;
  online_picks_7_day_percent_change?: SevenDayChange;
  offline_picks: number;
}

export interface SurveyMetrics {
  surveys_submitted: number;
  surveys_submitted_7_day_percent_change?: SevenDayChange;
  completion_rate_as_percent: number;
  completion_rate_7_day_percent_change?: SevenDayChange;
}

export interface PollMetrics {
  responses: number;
  responses_7_day_percent_change?: SevenDayChange;
}

export interface CommonGroundMetrics
  extends Omit<
    IdeationMetrics,
    'comments_posted' | 'comments_posted_7_day_percent_change'
  > {
  associated_ideas: number;
}

export interface VolunteeringMetrics {
  volunteerings: number;
  volunteerings_7_day_percent_change?: SevenDayChange;
}

export interface PhaseInsightsParticipationMetrics {
  visitors: number;
  visitors_7_day_percent_change?: SevenDayChange;
  participants: number;
  participants_7_day_percent_change?: SevenDayChange;
  participation_rate_as_percent: number;
  participation_rate_7_day_percent_change?: SevenDayChange;
  ideation?: IdeationMetrics;
  proposals?: ProposalsMetrics;
  voting?: VotingMetrics;
  budgeting?: BudgetingMetrics;
  native_survey?: SurveyMetrics;
  survey?: SurveyMetrics;
  poll?: PollMetrics;
  common_ground?: CommonGroundMetrics;
  volunteering?: VolunteeringMetrics;
}

export interface DemographicDataPoint {
  key: string;
  label: string;
  count: number;
  percentage: number;
  population_percentage?: number;
}

export interface DemographicField {
  field_id: string;
  field_key: string;
  field_name: string;
  field_code?: string | null;
  data_points: DemographicDataPoint[];
  r_score?: number;
}

export interface PhaseInsightsDemographics {
  fields: DemographicField[];
}

export interface ChartTimeseriesDataPoint {
  participants: number;
  visitors: number;
  date_group: string;
}

export interface ParticipantsAndVisitorsChartData {
  resolution: IResolution;
  timeseries: ChartTimeseriesDataPoint[];
}

export interface DemographicOption {
  title_multiloc: Record<string, string>;
  ordering: number;
}

export interface DemographicFieldBackend {
  id: string;
  key: string;
  code?: string | null;
  input_type: string;
  title_multiloc: Record<string, string>;
  r_score?: number | null;
  series: Record<string, number>;
  options?: Record<string, DemographicOption>;
  reference_distribution?: Record<string, number>;
}

export interface PhaseInsightsAttributes {
  metrics: PhaseInsightsParticipationMetrics;
  demographics: {
    fields: DemographicFieldBackend[];
  };
  participants_and_visitors_chart_data: ParticipantsAndVisitorsChartData;
}

export interface PhaseInsightsData {
  id: string;
  type: 'phase_insights';
  attributes: PhaseInsightsAttributes;
}

export interface IPhaseInsights {
  data: PhaseInsightsData;
}

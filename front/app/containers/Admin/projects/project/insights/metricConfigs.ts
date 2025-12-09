import {
  IdeationMetrics,
  ProposalsMetrics,
  VotingMetrics,
  BudgetingMetrics,
  SurveyMetrics,
  PollMetrics,
  CommonGroundMetrics,
  VolunteeringMetrics,
  SevenDayChange,
} from 'api/phase_insights/types';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

export interface MetricConfig<T = unknown> {
  key: string;
  message: MessageDescriptor;
  getValue: (data: T) => number | string;
  getChange?: (data: T) => SevenDayChange | undefined;
  customSubtext?: (
    data: T,
    formatMessage: (message: MessageDescriptor) => string
  ) => string | undefined;
}

export const METRIC_CONFIGS = {
  ideation: [
    {
      key: 'ideas',
      message: messages.inputs,
      getValue: (d: IdeationMetrics) => d.ideas_posted,
      getChange: (d: IdeationMetrics) => d.ideas_posted_7_day_change,
    },
    {
      key: 'comments',
      message: messages.comments,
      getValue: (d: IdeationMetrics) => d.comments_posted,
      getChange: (d: IdeationMetrics) => d.comments_posted_7_day_change,
    },
    {
      key: 'reactions',
      message: messages.reactions,
      getValue: (d: IdeationMetrics) => d.reactions,
      getChange: (d: IdeationMetrics) => d.reactions_7_day_change,
    },
  ] satisfies MetricConfig<IdeationMetrics>[],
  proposals: [
    {
      key: 'ideas',
      message: messages.inputs,
      getValue: (d: ProposalsMetrics) => d.ideas_posted,
      getChange: (d: ProposalsMetrics) => d.ideas_posted_7_day_change,
    },
    {
      key: 'comments',
      message: messages.comments,
      getValue: (d: ProposalsMetrics) => d.comments_posted,
      getChange: (d: ProposalsMetrics) => d.comments_posted_7_day_change,
    },
    {
      key: 'reactions',
      message: messages.reactions,
      getValue: (d: ProposalsMetrics) => d.reactions,
      getChange: (d: ProposalsMetrics) => d.reactions_7_day_change,
    },
  ] satisfies MetricConfig<ProposalsMetrics>[],
  voting: [] satisfies MetricConfig<VotingMetrics>[],
  budgeting: [] satisfies MetricConfig<BudgetingMetrics>[],
  native_survey: [
    {
      key: 'submissions',
      message: messages.submissions,
      getValue: (d: SurveyMetrics) => d.submitted_surveys,
      getChange: (d: SurveyMetrics) => d.submitted_surveys_7_day_change,
    },
    {
      key: 'completionRate',
      message: messages.completionRate,
      // Backend returns decimal (0.78), multiply by 100 for percentage display
      getValue: (d: SurveyMetrics) =>
        `${(d.completion_rate * 100).toFixed(1)}%`,
      getChange: (d: SurveyMetrics) => d.completion_rate_7_day_change,
    },
  ] satisfies MetricConfig<SurveyMetrics>[],
  survey: [
    {
      key: 'submissions',
      message: messages.submissions,
      getValue: (d: SurveyMetrics) => d.submitted_surveys,
      getChange: (d: SurveyMetrics) => d.submitted_surveys_7_day_change,
    },
    {
      key: 'completionRate',
      message: messages.completionRate,
      // Backend returns decimal (0.78), multiply by 100 for percentage display
      getValue: (d: SurveyMetrics) =>
        `${(d.completion_rate * 100).toFixed(1)}%`,
      getChange: (d: SurveyMetrics) => d.completion_rate_7_day_change,
    },
  ] satisfies MetricConfig<SurveyMetrics>[],
  poll: [
    {
      key: 'responses',
      message: messages.responses,
      getValue: (d: PollMetrics) => d.responses,
      getChange: (d: PollMetrics) => d.responses_7_day_change,
    },
  ] satisfies MetricConfig<PollMetrics>[],
  common_ground: [
    {
      key: 'ideasPosted',
      message: messages.ideasPosted,
      getValue: (d: CommonGroundMetrics) => d.ideas_posted,
      getChange: (d: CommonGroundMetrics) => d.ideas_posted_7_day_change,
    },
    {
      key: 'associatedIdeas',
      message: messages.associatedIdeas,
      getValue: (d: CommonGroundMetrics) => d.associated_ideas,
    },
    {
      key: 'reactions',
      message: messages.reactions,
      getValue: (d: CommonGroundMetrics) => d.reactions,
      getChange: (d: CommonGroundMetrics) => d.reactions_7_day_change,
    },
  ] satisfies MetricConfig<CommonGroundMetrics>[],
  volunteering: [
    {
      key: 'volunteerings',
      message: messages.volunteerings,
      getValue: (d: VolunteeringMetrics) => d.volunteerings,
      getChange: (d: VolunteeringMetrics) => d.volunteerings_7_day_change,
    },
  ] satisfies MetricConfig<VolunteeringMetrics>[],
} as const;

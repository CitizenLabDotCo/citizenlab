import {
  IdeationMetrics,
  ProposalsMetrics,
  VotingMetrics,
  BudgetingMetrics,
  SurveyMetrics,
  PollMetrics,
  CommonGroundMetrics,
  VolunteeringMetrics,
} from 'api/phase_insights/types';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

export interface MetricConfig<T = unknown> {
  key: string;
  message: MessageDescriptor;
  getValue: (data: T) => number | string;
  getChange?: (data: T) => number | undefined;
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
      getChange: (d: IdeationMetrics) => d.ideas_posted_last_7_days,
    },
    {
      key: 'comments',
      message: messages.comments,
      getValue: (d: IdeationMetrics) => d.comments_posted,
      getChange: (d: IdeationMetrics) => d.comments_posted_last_7_days,
    },
    {
      key: 'reactions',
      message: messages.reactions,
      getValue: (d: IdeationMetrics) => d.reactions,
      getChange: (d: IdeationMetrics) => d.reactions_last_7_days,
    },
  ] satisfies MetricConfig<IdeationMetrics>[],
  proposals: [
    {
      key: 'ideas',
      message: messages.inputs,
      getValue: (d: ProposalsMetrics) => d.ideas_posted,
      getChange: (d: ProposalsMetrics) => d.ideas_posted_last_7_days,
    },
    {
      key: 'comments',
      message: messages.comments,
      getValue: (d: ProposalsMetrics) => d.comments_posted,
      getChange: (d: ProposalsMetrics) => d.comments_posted_last_7_days,
    },
    {
      key: 'reactions',
      message: messages.reactions,
      getValue: (d: ProposalsMetrics) => d.reactions,
      getChange: (d: ProposalsMetrics) => d.reactions_last_7_days,
    },
  ] satisfies MetricConfig<ProposalsMetrics>[],
  voting: [] satisfies MetricConfig<VotingMetrics>[],
  budgeting: [] satisfies MetricConfig<BudgetingMetrics>[],
  native_survey: [
    {
      key: 'submissions',
      message: messages.submissions,
      getValue: (d: SurveyMetrics) => d.submitted_surveys,
      getChange: (d: SurveyMetrics) => d.submitted_surveys_last_7_days,
    },
    {
      key: 'completionRate',
      message: messages.completionRate,
      // Backend returns decimal (0.78), multiply by 100 for percentage display
      getValue: (d: SurveyMetrics) =>
        `${(d.completion_rate * 100).toFixed(1)}%`,
    },
  ] satisfies MetricConfig<SurveyMetrics>[],
  survey: [
    {
      key: 'submissions',
      message: messages.submissions,
      getValue: (d: SurveyMetrics) => d.submitted_surveys,
      getChange: (d: SurveyMetrics) => d.submitted_surveys_last_7_days,
    },
    {
      key: 'completionRate',
      message: messages.completionRate,
      // Backend returns decimal (0.78), multiply by 100 for percentage display
      getValue: (d: SurveyMetrics) =>
        `${(d.completion_rate * 100).toFixed(1)}%`,
    },
  ] satisfies MetricConfig<SurveyMetrics>[],
  poll: [
    {
      key: 'responses',
      message: messages.responses,
      getValue: (d: PollMetrics) => d.responses,
      getChange: (d: PollMetrics) => d.responses_last_7_days,
    },
  ] satisfies MetricConfig<PollMetrics>[],
  common_ground: [
    {
      key: 'ideasPosted',
      message: messages.ideasPosted,
      getValue: (d: CommonGroundMetrics) => d.ideas_posted,
      getChange: (d: CommonGroundMetrics) => d.ideas_posted_last_7_days,
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
      getChange: (d: CommonGroundMetrics) => d.reactions_last_7_days,
    },
  ] satisfies MetricConfig<CommonGroundMetrics>[],
  volunteering: [
    {
      key: 'volunteerings',
      message: messages.volunteerings,
      getValue: (d: VolunteeringMetrics) => d.volunteerings,
      getChange: (d: VolunteeringMetrics) => d.volunteerings_last_7_days,
    },
  ] satisfies MetricConfig<VolunteeringMetrics>[],
} as const;

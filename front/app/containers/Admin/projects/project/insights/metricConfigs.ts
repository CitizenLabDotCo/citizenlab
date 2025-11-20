import {
  IdeationMetrics,
  ProposalsMetrics,
  VotingMetrics,
  BudgetingMetrics,
  SurveyMetrics,
  PollMetrics,
  CommonGroundMetrics,
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
      getValue: (d: IdeationMetrics) => d.ideas,
      getChange: (d: IdeationMetrics) => d.ideas_last_7_days,
    },
    {
      key: 'comments',
      message: messages.comments,
      getValue: (d: IdeationMetrics) => d.comments,
      getChange: (d: IdeationMetrics) => d.comments_last_7_days,
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
      getValue: (d: ProposalsMetrics) => d.ideas,
      getChange: (d: ProposalsMetrics) => d.ideas_last_7_days,
    },
    {
      key: 'comments',
      message: messages.comments,
      getValue: (d: ProposalsMetrics) => d.comments,
      getChange: (d: ProposalsMetrics) => d.comments_last_7_days,
    },
    {
      key: 'reactions',
      message: messages.reactions,
      getValue: (d: ProposalsMetrics) => d.reactions,
      getChange: (d: ProposalsMetrics) => d.reactions_last_7_days,
    },
  ] satisfies MetricConfig<ProposalsMetrics>[],
  voting: [
    {
      key: 'votes',
      message: messages.votes,
      getValue: (d: VotingMetrics) => d.votes,
      getChange: (d: VotingMetrics) => d.votes_last_7_days,
    },
    {
      key: 'voters',
      message: messages.voters,
      getValue: (d: VotingMetrics) => d.voters,
    },
    {
      key: 'comments',
      message: messages.comments,
      getValue: (d: VotingMetrics) => d.comments,
      getChange: (d: VotingMetrics) => d.comments_last_7_days,
    },
    {
      key: 'offlineVotes',
      message: messages.offlineVotes,
      getValue: (d: VotingMetrics) => d.offline_votes,
      getChange: (d: VotingMetrics) => d.offline_votes_last_7_days,
    },
  ] satisfies MetricConfig<VotingMetrics>[],
  budgeting: [
    {
      key: 'votes',
      message: messages.votes,
      getValue: (d: BudgetingMetrics) => d.votes,
      getChange: (d: BudgetingMetrics) => d.votes_last_7_days,
    },
    {
      key: 'votesPerPerson',
      message: messages.votesPerPerson,
      getValue: (d: BudgetingMetrics) => d.votes_per_person.toFixed(1),
    },
    {
      key: 'totalVotes',
      message: messages.totalVotes,
      getValue: (d: BudgetingMetrics) => d.total_votes,
      customSubtext: (d: BudgetingMetrics, fm) =>
        `${fm(messages.total)}: ${d.total_votes.toLocaleString()}`,
    },
    {
      key: 'offlineVotes',
      message: messages.offlineVotes,
      getValue: (d: BudgetingMetrics) => d.offline_votes,
      getChange: (d: BudgetingMetrics) => d.offline_votes_last_7_days,
    },
    {
      key: 'comments',
      message: messages.comments,
      getValue: (d: BudgetingMetrics) => d.comments,
      getChange: (d: BudgetingMetrics) => d.comments_last_7_days,
    },
  ] satisfies MetricConfig<BudgetingMetrics>[],
  native_survey: [
    {
      key: 'submissions',
      message: messages.submissions,
      getValue: (d: SurveyMetrics) => d.submissions,
      getChange: (d: SurveyMetrics) => d.submissions_last_7_days,
    },
    {
      key: 'completionRate',
      message: messages.completionRate,
      getValue: (d: SurveyMetrics) => `${d.completion_rate.toFixed(1)}%`,
    },
  ] satisfies MetricConfig<SurveyMetrics>[],
  survey: [
    {
      key: 'submissions',
      message: messages.submissions,
      getValue: (d: SurveyMetrics) => d.submissions,
      getChange: (d: SurveyMetrics) => d.submissions_last_7_days,
    },
    {
      key: 'completionRate',
      message: messages.completionRate,
      getValue: (d: SurveyMetrics) => `${d.completion_rate.toFixed(1)}%`,
    },
  ] satisfies MetricConfig<SurveyMetrics>[],
  poll: [
    {
      key: 'respondents',
      message: messages.respondents,
      getValue: (d: PollMetrics) => d.respondents,
    },
  ] satisfies MetricConfig<PollMetrics>[],
  common_ground: [
    {
      key: 'statements',
      message: messages.statements,
      getValue: (d: CommonGroundMetrics) => d.statements,
    },
    {
      key: 'respondents',
      message: messages.respondents,
      getValue: (d: CommonGroundMetrics) => d.respondents,
    },
    {
      key: 'responses',
      message: messages.responses,
      getValue: (d: CommonGroundMetrics) => d.responses,
    },
    {
      key: 'responsesPerRespondent',
      message: messages.responsesPerRespondent,
      getValue: (d: CommonGroundMetrics) =>
        d.responses_per_respondent.toFixed(1),
    },
    {
      key: 'reactions',
      message: messages.reactions,
      getValue: (d: CommonGroundMetrics) => d.reactions,
      getChange: (d: CommonGroundMetrics) => d.reactions_last_7_days,
    },
  ] satisfies MetricConfig<CommonGroundMetrics>[],
} as const;

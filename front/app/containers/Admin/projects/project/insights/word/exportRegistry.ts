import { ParticipationMethod } from 'api/phases/types';

const INSIGHT_EXPORT_REGISTRY = {
  'participation-metrics': true,
  'participation-timeline': true,
  demographics: true,
  'ai-summary': true,
  'topic-breakdown': true,
  'status-breakdown': true,
  'most-liked-ideas': true,
  'most-liked-proposals': true,
  'vote-results': true,
  'common-ground-results': true,
  'survey-results': true,
} as const;

export type ExportId = keyof typeof INSIGHT_EXPORT_REGISTRY;

export const EXPECTED_COMPONENTS: Partial<
  Record<ParticipationMethod, ExportId[]>
> = {
  ideation: [
    'participation-metrics',
    'participation-timeline',
    'demographics',
    'ai-summary',
    'topic-breakdown',
    'status-breakdown',
    'most-liked-ideas',
  ],
  proposals: [
    'participation-metrics',
    'participation-timeline',
    'demographics',
    'ai-summary',
    'topic-breakdown',
    'status-breakdown',
    'most-liked-proposals',
  ],
  voting: [
    'participation-metrics',
    'participation-timeline',
    'demographics',
    'vote-results',
  ],
  common_ground: [
    'participation-metrics',
    'participation-timeline',
    'demographics',
    'common-ground-results',
  ],
  native_survey: [
    'participation-metrics',
    'participation-timeline',
    'demographics',
    'survey-results',
  ],
  poll: ['participation-metrics', 'participation-timeline', 'demographics'],
  volunteering: [
    'participation-metrics',
    'participation-timeline',
    'demographics',
  ],
  document_annotation: [
    'participation-metrics',
    'participation-timeline',
    'demographics',
  ],
};

const DEFAULT_COMPONENTS: ExportId[] = [
  'participation-metrics',
  'participation-timeline',
  'demographics',
];

export const getExpectedComponents = (
  participationMethod?: ParticipationMethod
): ExportId[] => {
  if (!participationMethod) {
    return DEFAULT_COMPONENTS;
  }
  return EXPECTED_COMPONENTS[participationMethod] || DEFAULT_COMPONENTS;
};

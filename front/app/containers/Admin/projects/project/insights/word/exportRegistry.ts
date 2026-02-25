import { ParticipationMethod } from 'api/phases/types';

export type ExportType = 'image' | 'data' | 'hybrid';

export interface ExportableComponent {
  id: string;
  displayName: string;
  exportType: ExportType;
}

export const INSIGHT_EXPORT_REGISTRY: Record<string, ExportableComponent> = {
  'participation-metrics': {
    id: 'participation-metrics',
    displayName: 'Participation Metrics',
    exportType: 'data',
  },
  'participation-timeline': {
    id: 'participation-timeline',
    displayName: 'Participation Over Time',
    exportType: 'image',
  },
  demographics: {
    id: 'demographics',
    displayName: 'Demographics',
    exportType: 'hybrid',
  },
  'ai-summary': {
    id: 'ai-summary',
    displayName: 'AI Summary',
    exportType: 'hybrid',
  },
  'topic-breakdown': {
    id: 'topic-breakdown',
    displayName: 'Topic Breakdown',
    exportType: 'hybrid',
  },
  'status-breakdown': {
    id: 'status-breakdown',
    displayName: 'Status Breakdown',
    exportType: 'hybrid',
  },
  'most-liked-ideas': {
    id: 'most-liked-ideas',
    displayName: 'Most Liked Ideas',
    exportType: 'hybrid',
  },
  'most-liked-proposals': {
    id: 'most-liked-proposals',
    displayName: 'Most Liked Proposals',
    exportType: 'hybrid',
  },
  'vote-results': {
    id: 'vote-results',
    displayName: 'Vote Results',
    exportType: 'data',
  },
  'common-ground-results': {
    id: 'common-ground-results',
    displayName: 'Common Ground Statements',
    exportType: 'image',
  },
  'survey-results': {
    id: 'survey-results',
    displayName: 'Survey Results',
    exportType: 'hybrid',
  },
};

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

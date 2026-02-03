import { ParticipationMethod } from 'api/phases/types';

// Export types for insight components
export type ExportType = 'image' | 'data' | 'hybrid';

// Component definition for exportable insights
export interface ExportableComponent {
  id: string;
  displayName: string;
  exportType: ExportType;
}

// Registry of all exportable insight components
export const INSIGHT_EXPORT_REGISTRY = {
  // Universal components (all participation methods)
  'participation-metrics': {
    id: 'participation-metrics',
    displayName: 'Participation Metrics',
    exportType: 'data' as const,
  },
  'participation-timeline': {
    id: 'participation-timeline',
    displayName: 'Participation Over Time',
    exportType: 'image' as const,
  },
  demographics: {
    id: 'demographics',
    displayName: 'Demographics',
    exportType: 'hybrid' as const, // Image for charts, fallback to data tables
  },

  // Ideation/Proposals components
  'ai-summary': {
    id: 'ai-summary',
    displayName: 'AI Summary',
    exportType: 'hybrid' as const, // Text data + visual container
  },
  'topic-breakdown': {
    id: 'topic-breakdown',
    displayName: 'Topic Breakdown',
    exportType: 'hybrid' as const, // Data tables + visual charts
  },
  'status-breakdown': {
    id: 'status-breakdown',
    displayName: 'Status Breakdown',
    exportType: 'hybrid' as const,
  },
  'most-liked-ideas': {
    id: 'most-liked-ideas',
    displayName: 'Most Liked Ideas',
    exportType: 'hybrid' as const,
  },
  'most-liked-proposals': {
    id: 'most-liked-proposals',
    displayName: 'Most Liked Proposals',
    exportType: 'hybrid' as const,
  },

  // Voting components
  'vote-results': {
    id: 'vote-results',
    displayName: 'Vote Results',
    exportType: 'image' as const,
  },

  // Common Ground components
  'common-ground-results': {
    id: 'common-ground-results',
    displayName: 'Common Ground Statements',
    exportType: 'image' as const,
  },

  // Survey components
  'survey-results': {
    id: 'survey-results',
    displayName: 'Survey Results',
    exportType: 'hybrid' as const,
  },
} satisfies Record<string, ExportableComponent>;

export type ExportId = keyof typeof INSIGHT_EXPORT_REGISTRY;

// Expected components per participation method
// This ensures TypeScript catches any typos in export IDs
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

// Helper to get expected components for a participation method
export const getExpectedComponents = (
  participationMethod?: ParticipationMethod
): ExportId[] => {
  if (!participationMethod) {
    return ['participation-metrics', 'participation-timeline', 'demographics'];
  }
  return (
    EXPECTED_COMPONENTS[participationMethod] || [
      'participation-metrics',
      'participation-timeline',
      'demographics',
    ]
  );
};

// Helper to check if a component should be captured as an image
export const shouldCaptureAsImage = (exportId: ExportId): boolean => {
  const config = INSIGHT_EXPORT_REGISTRY[exportId];
  return config.exportType === 'image' || config.exportType === 'hybrid';
};

export const USE_DUMMY_DATA: boolean = true;

import {
  PhaseInsightsParticipationMetrics,
  PhaseInsightsDemographics,
} from './types';

export const getDummyParticipationMetrics = (
  participationMethod: string
): PhaseInsightsParticipationMetrics => {
  const baseMetrics: PhaseInsightsParticipationMetrics = {
    visitors: 128442,
    participants: 2750,
    engagement_rate: 2.1,
    visitors_change: 8394,
    participants_change: 1283,
  };

  switch (participationMethod) {
    case 'ideation':
    case 'proposals':
      return {
        ...baseMetrics,
        ideas: 682,
        comments: 2394,
        reactions: 18293,
        ideas_change: 12,
        comments_change: 192,
        reactions_change: 8384,
      };

    case 'native_survey':
    case 'survey':
      return {
        ...baseMetrics,
        submissions: 682,
        completion_rate: 78.5,
        submissions_change: 12,
      };

    case 'voting':
    case 'budgeting':
      return {
        ...baseMetrics,
        votes: 10394,
        votes_per_person: 3.8,
        votes_change: 3291,
      };

    case 'poll':
      return {
        ...baseMetrics,
        votes: 5429,
        votes_change: 834,
      };

    case 'common_ground':
      return baseMetrics;

    default:
      return baseMetrics;
  }
};

export const getDummyDemographics = (): PhaseInsightsDemographics => {
  return {
    gender: [
      { key: 'male', label: 'Men', count: 680, percentage: 36 },
      { key: 'female', label: 'Women', count: 830, percentage: 44 },
      { key: 'non_binary', label: 'Non binary', count: 50, percentage: 3 },
      { key: 'unspecified', label: 'Unspecified', count: 320, percentage: 17 },
    ],
    age: [
      { key: '0-19', label: '0-19', count: 80, percentage: 4 },
      { key: '20-29', label: '20-29', count: 160, percentage: 8 },
      { key: '30-39', label: '30-39', count: 530, percentage: 28 },
      { key: '40-49', label: '40-49', count: 580, percentage: 31 },
      { key: '50-59', label: '50-59', count: 310, percentage: 16 },
      { key: '60+', label: '+60', count: 240, percentage: 13 },
    ],
    areas: [
      { key: 'area_1', label: 'Sants', count: 780, percentage: 41 },
      {
        key: 'area_2',
        label: 'Sagrada Familia',
        count: 430,
        percentage: 23,
      },
      {
        key: 'area_3',
        label: 'Gothic Quarter',
        count: 350,
        percentage: 18,
      },
      {
        key: 'area_4',
        label: 'La Barceloneta',
        count: 180,
        percentage: 9,
      },
      { key: 'area_5', label: 'El Poblenou', count: 130, percentage: 7 },
      { key: 'area_6', label: 'El Raval', count: 70, percentage: 4 },
      { key: 'area_7', label: 'Gràcia', count: 60, percentage: 3 },
    ],
  };
};

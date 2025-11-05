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
    fields: [
      {
        field_id: 'birthyear',
        field_key: 'birthyear',
        field_name: 'Year of birth',
        field_code: 'birthyear',
        r_score: 45,
        data_points: [
          {
            key: '0-15',
            label: '0-15',
            count: 55,
            percentage: 2,
            population_percentage: 12,
          },
          {
            key: '16-24',
            label: '16-24',
            count: 165,
            percentage: 6,
            population_percentage: 16,
          },
          {
            key: '25-34',
            label: '25-34',
            count: 770,
            percentage: 28,
            population_percentage: 21,
          },
          {
            key: '35-44',
            label: '35-44',
            count: 853,
            percentage: 31,
            population_percentage: 24,
          },
          {
            key: '45-55',
            label: '45-55',
            count: 715,
            percentage: 26,
            population_percentage: 16,
          },
          {
            key: '56+',
            label: '56+',
            count: 495,
            percentage: 18,
            population_percentage: 6,
          },
        ],
      },
      {
        field_id: 'gender',
        field_key: 'gender',
        field_name: 'Gender',
        field_code: 'gender',
        r_score: 45,
        data_points: [
          {
            key: 'male',
            label: 'Men',
            count: 680,
            percentage: 36,
            population_percentage: 48,
          },
          {
            key: 'female',
            label: 'Women',
            count: 830,
            percentage: 44,
            population_percentage: 50,
          },
          {
            key: 'non_binary',
            label: 'Non binary',
            count: 50,
            percentage: 3,
            population_percentage: 1,
          },
          {
            key: 'unspecified',
            label: 'Unspecified',
            count: 320,
            percentage: 17,
            population_percentage: 1,
          },
        ],
      },
      {
        field_id: 'domicile',
        field_key: 'domicile',
        field_name: 'Where are you from?',
        field_code: 'domicile',
        r_score: 45,
        data_points: [
          {
            key: 'sants',
            label: 'Sants',
            count: 1155,
            percentage: 42,
            population_percentage: 12,
          },
          {
            key: 'sagrada_familia',
            label: 'Sagrada Familia',
            count: 660,
            percentage: 24,
            population_percentage: 16,
          },
          {
            key: 'gothic_quarter',
            label: 'Gothic Quarter',
            count: 578,
            percentage: 21,
            population_percentage: 21,
          },
          {
            key: 'la_barceloneta',
            label: 'La Barceloneta',
            count: 495,
            percentage: 18,
            population_percentage: 24,
          },
          {
            key: 'el_poblenou',
            label: 'El Poblenou',
            count: 440,
            percentage: 16,
            population_percentage: 16,
          },
          {
            key: 'el_raval',
            label: 'El Raval',
            count: 358,
            percentage: 13,
            population_percentage: 6,
          },
          {
            key: 'montjuic',
            label: 'Montjuic',
            count: 165,
            percentage: 6,
            population_percentage: 6,
          },
          {
            key: 'sant_andreu',
            label: 'Sant Andreu del Palomar',
            count: 55,
            percentage: 2,
            population_percentage: 6,
          },
          {
            key: 'vila_de_gracia',
            label: 'Vila de Gracia',
            count: 55,
            percentage: 2,
            population_percentage: 6,
          },
          {
            key: 'el_born',
            label: 'El Born',
            count: 55,
            percentage: 2,
            population_percentage: 6,
          },
          {
            key: 'others',
            label: 'Others',
            count: 220,
            percentage: 8,
            population_percentage: 6,
          },
        ],
      },
      {
        field_id: 'race',
        field_key: 'race',
        field_name: 'Race',
        field_code: null,
        r_score: 45,
        data_points: [
          {
            key: 'mixed',
            label: 'Mixed or multiple',
            count: 55,
            percentage: 2,
            population_percentage: 12,
          },
          {
            key: 'black',
            label: 'Black, Black British',
            count: 165,
            percentage: 6,
            population_percentage: 16,
          },
          {
            key: 'asian',
            label: 'Asian or Asian British',
            count: 770,
            percentage: 28,
            population_percentage: 21,
          },
          {
            key: 'white',
            label: 'White',
            count: 853,
            percentage: 31,
            population_percentage: 24,
          },
          {
            key: 'other',
            label: 'Other ethnic group',
            count: 853,
            percentage: 31,
            population_percentage: 24,
          },
        ],
      },
    ],
  };
};

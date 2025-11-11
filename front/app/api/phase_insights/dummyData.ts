/**
 * Toggle for using dummy data during development
 * Set to false when backend endpoints are ready
 */
export const USE_DUMMY_DATA: boolean = true;

import {
  IPhaseInsightsParticipationMetrics,
  IPhaseInsightsDemographics,
  PhaseInsightsParticipationMetrics,
} from './types';

/**
 * NOTE: Dummy data returns full JSONAPI structure to match real API
 * Components will transform demographics using transformDemographicsResponse()
 */

export const getDummyParticipationMetrics = (
  participationMethod: string
): IPhaseInsightsParticipationMetrics => {
  const baseMetrics: PhaseInsightsParticipationMetrics = {
    visitors: 128442,
    participants: 2750,
    engagement_rate: 2.1,
    visitors_change: 8394,
    participants_change: 1283,
  };

  let attributes: PhaseInsightsParticipationMetrics;

  switch (participationMethod) {
    case 'ideation':
    case 'proposals':
      attributes = {
        ...baseMetrics,
        ideas: 682,
        comments: 2394,
        reactions: 18293,
        ideas_change: 12,
        comments_change: 192,
        reactions_change: 8384,
      };
      break;

    case 'native_survey':
    case 'survey':
      attributes = {
        ...baseMetrics,
        submissions: 682,
        completion_rate: 78.5,
        submissions_change: 12,
      };
      break;

    case 'voting':
    case 'budgeting':
      attributes = {
        ...baseMetrics,
        votes: 10394,
        votes_per_person: 3.8,
        votes_change: 3291,
      };
      break;

    case 'poll':
      attributes = {
        ...baseMetrics,
        votes: 5429,
        votes_change: 834,
      };
      break;

    default:
      attributes = baseMetrics;
  }

  // Return full JSONAPI structure
  return {
    data: {
      id: 'dummy-phase-id',
      type: 'phase_participation_metrics',
      attributes,
    },
  };
};

/**
 * Returns dummy demographics data in full JSONAPI format with series/options
 * This matches what the real API will return
 */
export const getDummyDemographics = (): IPhaseInsightsDemographics => {
  return {
    data: {
      id: 'dummy-phase-id',
      type: 'phase_demographics',
      attributes: {
        fields: [
          {
            field_id: 'gender',
            field_key: 'gender',
            field_name_multiloc: {
              en: 'Gender',
              fr: 'Genre',
              nl: 'Geslacht',
            },
            field_code: 'gender',
            r_score: 45,
            series: {
              male: 680,
              female: 830,
              non_binary: 50,
              unspecified: 320,
            },
            options: {
              male: {
                title_multiloc: { en: 'Men', fr: 'Hommes', nl: 'Mannen' },
                ordering: 0,
              },
              female: {
                title_multiloc: { en: 'Women', fr: 'Femmes', nl: 'Vrouwen' },
                ordering: 1,
              },
              non_binary: {
                title_multiloc: {
                  en: 'Non binary',
                  fr: 'Non-binaire',
                  nl: 'Non-binair',
                },
                ordering: 2,
              },
              unspecified: {
                title_multiloc: {
                  en: 'Unspecified',
                  fr: 'Non spécifié',
                  nl: 'Niet gespecificeerd',
                },
                ordering: 3,
              },
            },
            population_distribution: {
              male: 1200,
              female: 1250,
              non_binary: 25,
              unspecified: 25,
            },
          },
          {
            field_id: 'birthyear',
            field_key: 'birthyear',
            field_name_multiloc: {
              en: 'Year of birth',
              fr: 'Année de naissance',
              nl: 'Geboortejaar',
            },
            field_code: 'birthyear',
            r_score: 62,
            series: {
              '0-15': 55,
              '16-24': 165,
              '25-34': 770,
              '35-44': 853,
              '45-55': 715,
              '56+': 495,
            },
            options: {
              '0-15': {
                title_multiloc: { en: '0-15', fr: '0-15', nl: '0-15' },
                ordering: 0,
              },
              '16-24': {
                title_multiloc: { en: '16-24', fr: '16-24', nl: '16-24' },
                ordering: 1,
              },
              '25-34': {
                title_multiloc: { en: '25-34', fr: '25-34', nl: '25-34' },
                ordering: 2,
              },
              '35-44': {
                title_multiloc: { en: '35-44', fr: '35-44', nl: '35-44' },
                ordering: 3,
              },
              '45-55': {
                title_multiloc: { en: '45-55', fr: '45-55', nl: '45-55' },
                ordering: 4,
              },
              '56+': {
                title_multiloc: { en: '56+', fr: '56+', nl: '56+' },
                ordering: 5,
              },
            },
            population_distribution: {
              '0-15': 300,
              '16-24': 400,
              '25-34': 525,
              '35-44': 600,
              '45-55': 400,
              '56+': 150,
            },
          },
          {
            field_id: 'domicile',
            field_key: 'domicile',
            field_name_multiloc: {
              en: 'Where are you from?',
              fr: "D'où venez-vous?",
              nl: 'Waar kom je vandaan?',
            },
            field_code: 'domicile',
            r_score: 38,
            series: {
              sants: 1155,
              sagrada_familia: 660,
              gothic_quarter: 578,
              la_barceloneta: 495,
              el_poblenou: 440,
              el_raval: 358,
              montjuic: 165,
              sant_andreu: 55,
              vila_de_gracia: 55,
              el_born: 55,
              others: 220,
            },
            options: {
              sants: {
                title_multiloc: { en: 'Sants', fr: 'Sants', nl: 'Sants' },
                ordering: 0,
              },
              sagrada_familia: {
                title_multiloc: {
                  en: 'Sagrada Familia',
                  fr: 'Sagrada Familia',
                  nl: 'Sagrada Familia',
                },
                ordering: 1,
              },
              gothic_quarter: {
                title_multiloc: {
                  en: 'Gothic Quarter',
                  fr: 'Quartier Gothique',
                  nl: 'Gotische Wijk',
                },
                ordering: 2,
              },
              la_barceloneta: {
                title_multiloc: {
                  en: 'La Barceloneta',
                  fr: 'La Barceloneta',
                  nl: 'La Barceloneta',
                },
                ordering: 3,
              },
              el_poblenou: {
                title_multiloc: {
                  en: 'El Poblenou',
                  fr: 'El Poblenou',
                  nl: 'El Poblenou',
                },
                ordering: 4,
              },
              el_raval: {
                title_multiloc: {
                  en: 'El Raval',
                  fr: 'El Raval',
                  nl: 'El Raval',
                },
                ordering: 5,
              },
              montjuic: {
                title_multiloc: {
                  en: 'Montjuic',
                  fr: 'Montjuic',
                  nl: 'Montjuic',
                },
                ordering: 6,
              },
              sant_andreu: {
                title_multiloc: {
                  en: 'Sant Andreu del Palomar',
                  fr: 'Sant Andreu del Palomar',
                  nl: 'Sant Andreu del Palomar',
                },
                ordering: 7,
              },
              vila_de_gracia: {
                title_multiloc: {
                  en: 'Vila de Gracia',
                  fr: 'Vila de Gracia',
                  nl: 'Vila de Gracia',
                },
                ordering: 8,
              },
              el_born: {
                title_multiloc: { en: 'El Born', fr: 'El Born', nl: 'El Born' },
                ordering: 9,
              },
              others: {
                title_multiloc: {
                  en: 'Others',
                  fr: 'Autres',
                  nl: 'Anderen',
                },
                ordering: 10,
              },
            },
            population_distribution: {
              sants: 300,
              sagrada_familia: 400,
              gothic_quarter: 525,
              la_barceloneta: 600,
              el_poblenou: 400,
              el_raval: 150,
              montjuic: 150,
              sant_andreu: 150,
              vila_de_gracia: 150,
              el_born: 150,
              others: 150,
            },
          },
          {
            field_id: 'race',
            field_key: 'race',
            field_name_multiloc: {
              en: 'Race',
              fr: 'Race',
              nl: 'Ras',
            },
            field_code: null,
            r_score: 52,
            series: {
              mixed: 55,
              black: 165,
              asian: 770,
              white: 853,
              other: 853,
            },
            options: {
              mixed: {
                title_multiloc: {
                  en: 'Mixed or multiple',
                  fr: 'Mixte ou multiple',
                  nl: 'Gemengd of meerdere',
                },
                ordering: 0,
              },
              black: {
                title_multiloc: {
                  en: 'Black, Black British',
                  fr: 'Noir, Britannique Noir',
                  nl: 'Zwart, Zwart-Brits',
                },
                ordering: 1,
              },
              asian: {
                title_multiloc: {
                  en: 'Asian or Asian British',
                  fr: 'Asiatique ou Britannique Asiatique',
                  nl: 'Aziatisch of Aziatisch-Brits',
                },
                ordering: 2,
              },
              white: {
                title_multiloc: {
                  en: 'White',
                  fr: 'Blanc',
                  nl: 'Blank',
                },
                ordering: 3,
              },
              other: {
                title_multiloc: {
                  en: 'Other ethnic group',
                  fr: 'Autre groupe ethnique',
                  nl: 'Andere etnische groep',
                },
                ordering: 4,
              },
            },
            population_distribution: {
              mixed: 300,
              black: 400,
              asian: 525,
              white: 600,
              other: 400,
            },
          },
        ],
      },
    },
  };
};

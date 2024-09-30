import { SupportedLocale } from 'typings';

import { IUpdatedPhaseProperties } from 'api/phases/types';

import validate from './validate';

describe('validate', () => {
  it('should work', () => {
    const formData: IUpdatedPhaseProperties = {
      poll_anonymous: false,
      survey_embed_url: null,
      survey_service: null,
      document_annotation_embed_url: null,
      title_multiloc: {
        'nl-BE': 'Iedereen kan stemmen op de mooiste foto of locatie',
      },
      start_at: '2024-11-01',
      end_at: '2024-12-20',
      // created_at: "2024-08-29T14:22:12.260Z",
      // updated_at: "2024-09-03T11:57:23.901Z",
      // ideas_count: 0,
      campaigns_settings: {
        project_phase_started: true,
      },
      participation_method: 'voting',
      submission_enabled: true,
      commenting_enabled: true,
      reacting_enabled: true,
      reacting_like_method: 'limited',
      reacting_like_limited_max: null,
      reacting_dislike_enabled: true,
      reacting_dislike_method: 'unlimited',
      reacting_dislike_limited_max: null,
      allow_anonymous_participation: false,
      presentation_mode: 'card',
      ideas_order: 'random',
      input_term: 'idea',
      prescreening_enabled: false,
      voting_method: 'single_voting',
      voting_max_total: 1,
      voting_min_total: 0,
      voting_max_votes_per_idea: 1,
      // baskets_count: 0,
      // votes_count: 0,
      voting_term_singular_multiloc: {
        'nl-BE': 'stem',
      },
      voting_term_plural_multiloc: {
        'nl-BE': 'stemmen',
      },
      description_multiloc: {
        'nl-BE':
          '<p>Alle ingediende foto\'s van "verborgen parels" in Boom worden hier getoond.</p><p>Je kan nu 3 stemmen uitbrengen op jouw favoriete foto.</p><p>De 10 foto\'s met de meeste stemmen worden tentoongesteld in de bibliotheek.</p><p>jgerwogj</p>',
      },
      // previous_phase_end_at_updated: false,
      // report_public: null,
      // custom_form_persisted: false
    };

    const formatMessage = () => 'some message';

    const locales: SupportedLocale[] = ['nl-BE'];

    const result = validate(formData, { data: [] }, formatMessage, locales);

    expect(result.isValidated).toBe(true);
  });
});

import { IPhaseData, IUpdatedPhaseProperties } from 'api/phases/types';

import validate from './validate';

const formatMessage = () => 'some message';

const makePhase = (
  id: string,
  start_at: string,
  end_at: string | null
): IPhaseData => ({
  id,
  type: 'phase',
  attributes: { start_at, end_at } as IPhaseData['attributes'],
  relationships: {} as IPhaseData['relationships'],
});

const baseFormData: IUpdatedPhaseProperties = {
  poll_anonymous: false,
  survey_embed_url: null,
  survey_service: null,
  document_annotation_embed_url: null,
  title_multiloc: { 'nl-BE': 'Title' },
  start_at: '2024-01-01',
  end_at: null,
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
  prescreening_mode: null,
  voting_method: 'single_voting',
  voting_max_total: 1,
  voting_min_total: 0,
  voting_max_votes_per_idea: 1,
  vote_term: 'vote',
  description_multiloc: { 'nl-BE': '<p>Desc</p>' },
};

describe('validate', () => {
  it('validates successfully with valid data and no existing phases', () => {
    const formData = {
      ...baseFormData,
      start_at: '2024-11-01',
      end_at: '2024-12-20',
    };

    const result = validate(formData, { data: [] }, formatMessage);

    expect(result.isValidated).toBe(true);
  });

  it('allows changing start date to earlier when editing last phase with no end date', () => {
    const lastPhaseId = 'last-phase-id';
    const phases = {
      data: [
        makePhase('first-phase-id', '2024-01-15', '2024-02-01'),
        makePhase(lastPhaseId, '2024-06-01', null),
      ],
    };

    const result = validate(baseFormData, phases, formatMessage, lastPhaseId);

    expect(result.isValidated).toBe(true);
    expect(result.errors.phaseDateError).toBeUndefined();
  });

  it('requires end date when editing non-last phase with start before another phase and no end date', () => {
    const firstPhaseId = 'first-phase-id';
    const phases = {
      data: [
        makePhase(firstPhaseId, '2024-01-15', '2024-02-01'),
        makePhase('last-phase-id', '2024-06-01', null),
      ],
    };

    const result = validate(baseFormData, phases, formatMessage, firstPhaseId);

    expect(result.isValidated).toBe(false);
    expect(result.errors.phaseDateError).toBeDefined();
  });

  it('allows changing start date to earlier when editing the only phase with no end date', () => {
    const onlyPhaseId = 'only-phase-id';
    const phases = {
      data: [makePhase(onlyPhaseId, '2024-06-01', null)],
    };

    const result = validate(baseFormData, phases, formatMessage, onlyPhaseId);

    expect(result.isValidated).toBe(true);
    expect(result.errors.phaseDateError).toBeUndefined();
  });
});

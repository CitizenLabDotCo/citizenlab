import { IPhase, IPhases } from 'api/phases/types';
import moment from 'moment';
import 'moment-timezone';
import { getPreviousPhase, getMinAllowedPhaseDate } from './utils';

export const phasesDataMockDataWithoutId = {
  type: 'phase',
  attributes: {
    allow_anonymous_participation: false,
    title_multiloc: { en: 'A Mock Information phase' },
    description_multiloc: { en: 'For testing purposes' },
    start_at: 'today',
    end_at: 'one week from now',
    created_at: 'yesterday',
    updated_at: 'yesterday but later',
    posting_enabled: false,
    commenting_enabled: false,
    reacting_enabled: false,
    reacting_like_limited_max: 0,
    reacting_dislike_enabled: false,
    reacting_dislike_limited_max: 0,
    participation_method: 'information',
    reacting_like_method: 'limited',
    reacting_dislike_method: 'limited',
    input_term: 'idea',
    presentation_mode: 'card',
    ideas_count: 3,
    campaigns_settings: { project_phase_started: true },
  },
  relationships: {
    permissions: {
      data: [],
    },
    project: {
      data: {
        id: 'projectId',
        type: 'project',
      },
    },
    user_basket: {
      data: null,
    },
  },
};

const testDateStr = '2020-06-15T01:00:00Z';

describe('getPreviousPhase', () => {
  it('should return the last phase when currentPhase is undefined', () => {
    const lastPhase = { id: '3', ...phasesDataMockDataWithoutId };
    const phases = {
      data: [
        { id: '1', ...phasesDataMockDataWithoutId },
        { id: '2', ...phasesDataMockDataWithoutId },
        lastPhase,
      ],
    } as IPhases;
    const currentPhase = undefined;
    const result = getPreviousPhase(phases, currentPhase);
    expect(result).toEqual(lastPhase);
  });

  it('should return the previous phase when currentPhase is an existing phase', () => {
    const firstPhase = { id: '1', ...phasesDataMockDataWithoutId };
    const phases = {
      data: [
        firstPhase,
        { id: '2', ...phasesDataMockDataWithoutId },
        { id: '3', ...phasesDataMockDataWithoutId },
      ],
    } as IPhases;
    const currentPhase = {
      data: { id: '2', ...phasesDataMockDataWithoutId },
    } as IPhase;
    const result = getPreviousPhase(phases, currentPhase);
    expect(result).toEqual(firstPhase);
  });

  it('should return undefined when there is no phase before the currentPhase', () => {
    const phases = {
      data: [{ id: '1', ...phasesDataMockDataWithoutId }],
    } as IPhases;
    const currentPhase = {
      data: { id: '1', ...phasesDataMockDataWithoutId },
    } as IPhase;
    const result = getPreviousPhase(phases, currentPhase);
    expect(result).toBeUndefined();
  });
});

describe('getMinAllowedPhaseDate', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(testDateStr));
    moment.tz.setDefault('America/Santiago');
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should return undefined when previousPhase is undefined', () => {
    const phases = {
      data: [
        { id: '1', ...phasesDataMockDataWithoutId },
        { id: '2', ...phasesDataMockDataWithoutId },
      ],
    } as IPhases;
    const currentPhase = {
      data: { id: '3', ...phasesDataMockDataWithoutId },
    } as IPhase;
    const result = getMinAllowedPhaseDate(phases, currentPhase);
    expect(result).toBeUndefined();
  });

  it('should calculate the date with 2 days added when previousPhase has a start date but no end date', () => {
    const phases = {
      data: [
        { id: '1', ...phasesDataMockDataWithoutId },
        { id: '2', ...phasesDataMockDataWithoutId },
      ],
    } as IPhases;
    phases.data[0].attributes.start_at = '2023-10-20';
    phases.data[0].attributes.end_at = null;
    const currentPhase = {
      data: { id: '2', ...phasesDataMockDataWithoutId },
    } as IPhase;
    const result = getMinAllowedPhaseDate(phases, currentPhase);
    expect(moment('2023-10-22').isSame(result)).toEqual(true);
  });

  it('should calculate the date with 1 day added when previousPhase has an end date', () => {
    const phases = {
      data: [
        { id: '1', ...phasesDataMockDataWithoutId },
        { id: '2', ...phasesDataMockDataWithoutId },
      ],
    } as IPhases;
    phases.data[0].attributes.start_at = '2023-10-20';
    phases.data[0].attributes.end_at = '2023-10-22';
    phases.data[1].attributes.start_at = '2023-10-24';
    phases.data[1].attributes.start_at = '2023-10-25';

    const currentPhase = {
      data: { id: '2', ...phasesDataMockDataWithoutId },
    } as IPhase;
    const result = getMinAllowedPhaseDate(phases, currentPhase);
    expect(moment('2023-10-23').isSame(result)).toEqual(true);
  });
});

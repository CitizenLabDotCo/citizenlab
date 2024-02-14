import { IPhase, IPhaseData, IPhases } from 'api/phases/types';
import moment from 'moment';
import 'moment-timezone';
import { getPreviousPhase, getExcludedDates } from './utils';

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
    votes_count: 0,
    baskets_count: 0,
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

describe('getExcludedDates function', () => {
  it('should block dates between start and end dates of a phase', () => {
    const phases = [
      {
        attributes: {
          start_at: '2023-11-01',
          end_at: '2023-11-03',
        },
      },
    ] as IPhaseData[];

    const blockedDates = getExcludedDates(phases);

    const expectedDates = [
      moment('2023-11-01'),
      moment('2023-11-02'),
      moment('2023-11-03'),
    ];

    blockedDates.forEach((date, index) => {
      expect(date.isSame(expectedDates[index])).toEqual(true);
    });
  });

  it('should block only the start date of a phase with no end date', () => {
    const phases = [
      {
        attributes: {
          start_at: '2023-11-01',
          end_at: null,
        },
      },
    ] as IPhaseData[];

    const blockedDates = getExcludedDates(phases);

    const expectedDates = [moment('2023-11-01')];

    blockedDates.forEach((date, index) => {
      expect(date.isSame(expectedDates[index])).toEqual(true);
    });
  });

  it('should handle multiple phases with different start and end dates', () => {
    const phases: IPhaseData[] = [
      {
        attributes: {
          start_at: '2023-11-01',
          end_at: '2023-11-03',
        },
      },
      {
        attributes: {
          start_at: '2023-11-05',
          end_at: '2023-11-07',
        },
      },
    ] as IPhaseData[];

    const blockedDates = getExcludedDates(phases);

    const expectedDates = [
      moment('2023-11-01'),
      moment('2023-11-02'),
      moment('2023-11-03'),
      moment('2023-11-05'),
      moment('2023-11-06'),
      moment('2023-11-07'),
    ];

    blockedDates.forEach((date, index) => {
      expect(date.isSame(expectedDates[index])).toEqual(true);
    });
  });
});

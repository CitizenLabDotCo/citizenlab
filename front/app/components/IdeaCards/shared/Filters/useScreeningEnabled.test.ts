import { mockPhaseIdeationData } from 'api/phases/__mocks__/_mockServer';
import {
  IPhase,
  ParticipationMethod,
  PrescreeningMode,
} from 'api/phases/types';

import { renderHook } from 'utils/testUtils/rtl';

import useScreeningEnabled from './useScreeningEnabled';

let mockEnabledFeatures: string[] = [];

jest.mock('hooks/useFeatureFlag', () =>
  jest.fn(({ name }: { name: string }) => mockEnabledFeatures.includes(name))
);

const phase = (
  participation_method: ParticipationMethod,
  prescreening_mode: PrescreeningMode | null
): IPhase => ({
  data: {
    ...mockPhaseIdeationData,
    attributes: {
      ...mockPhaseIdeationData.attributes,
      participation_method,
      prescreening_mode: prescreening_mode ?? undefined,
    },
  },
});

describe('useScreeningEnabled', () => {
  beforeEach(() => {
    mockEnabledFeatures = [];
  });

  it('is false without a phase', () => {
    const { result } = renderHook(() => useScreeningEnabled(undefined));
    expect(result.current).toBe(false);
  });

  it('is false when no prescreening_mode is configured, even with the feature on', () => {
    mockEnabledFeatures = ['prescreening_ideation', 'prescreening'];
    const { result } = renderHook(() =>
      useScreeningEnabled(phase('ideation', null))
    );
    expect(result.current).toBe(false);
  });

  describe('an ideation phase (gated on prescreening_ideation)', () => {
    it('is true when the feature is enabled', () => {
      mockEnabledFeatures = ['prescreening_ideation'];
      const { result } = renderHook(() =>
        useScreeningEnabled(phase('ideation', 'all'))
      );
      expect(result.current).toBe(true);
    });

    // A phase can carry a prescreening_mode on a platform without the feature: tenant
    // templates and project copies bring the value across from platforms that have it.
    // The back-end ignores it there, so the UI must not offer screening either.
    it('is false when the feature is disabled, even though a mode is configured', () => {
      const { result } = renderHook(() =>
        useScreeningEnabled(phase('ideation', 'all'))
      );
      expect(result.current).toBe(false);
    });

    it('is not gated on the proposals feature', () => {
      mockEnabledFeatures = ['prescreening'];
      const { result } = renderHook(() =>
        useScreeningEnabled(phase('ideation', 'all'))
      );
      expect(result.current).toBe(false);
    });
  });

  describe('a proposals phase (gated on prescreening)', () => {
    it('is true when the feature is enabled', () => {
      mockEnabledFeatures = ['prescreening'];
      const { result } = renderHook(() =>
        useScreeningEnabled(phase('proposals', 'all'))
      );
      expect(result.current).toBe(true);
    });

    it('is false when the feature is disabled, even though a mode is configured', () => {
      const { result } = renderHook(() =>
        useScreeningEnabled(phase('proposals', 'all'))
      );
      expect(result.current).toBe(false);
    });

    it('is not gated on the ideation feature', () => {
      mockEnabledFeatures = ['prescreening_ideation'];
      const { result } = renderHook(() =>
        useScreeningEnabled(phase('proposals', 'all'))
      );
      expect(result.current).toBe(false);
    });
  });

  it('applies the same gating to the flagged_only mode', () => {
    const { result: disabled } = renderHook(() =>
      useScreeningEnabled(phase('ideation', 'flagged_only'))
    );
    expect(disabled.current).toBe(false);

    mockEnabledFeatures = ['prescreening_ideation'];
    const { result: enabled } = renderHook(() =>
      useScreeningEnabled(phase('ideation', 'flagged_only'))
    );
    expect(enabled.current).toBe(true);
  });
});

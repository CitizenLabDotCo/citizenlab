import React, { ReactNode } from 'react';

import { act, renderHook } from 'utils/testUtils/rtl';

import {
  PhasePreviewDraftProvider,
  usePhasePreviewDraft,
  usePhasePreviewPublisher,
} from './DraftContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <PhasePreviewDraftProvider>{children}</PhasePreviewDraftProvider>
);

describe('phase preview drafts', () => {
  it('combines independent editor changes without leaking across phases', () => {
    const { result, rerender } = renderHook(
      ({ selected }) => ({
        build: usePhasePreviewPublisher('build', 'phase-a'),
        settings: usePhasePreviewPublisher('settings', 'phase-a'),
        draft: usePhasePreviewDraft(selected),
      }),
      { wrapper, initialProps: { selected: 'phase-a' } }
    );
    act(() =>
      result.current.build({ title_multiloc: { en: 'Unsaved title' } })
    );
    act(() => result.current.settings({ voting_max_total: 10 }));
    expect(result.current.draft).toEqual({
      title_multiloc: { en: 'Unsaved title' },
      voting_max_total: 10,
    });
    rerender({ selected: 'phase-b' });
    expect(result.current.draft).toEqual({});
  });

  it('clears fields and removes an editor’s patch when its phase changes', () => {
    const { result, rerender } = renderHook(
      ({ phaseId }) => ({
        publish: usePhasePreviewPublisher('build', phaseId),
        draft: usePhasePreviewDraft('phase-a'),
      }),
      { wrapper, initialProps: { phaseId: 'phase-a' } }
    );
    act(() => result.current.publish({ title_multiloc: { en: 'Draft' } }));
    act(() => result.current.publish({ title_multiloc: {} }));
    expect(result.current.draft).toEqual({ title_multiloc: {} });
    rerender({ phaseId: 'phase-b' });
    expect(result.current.draft).toEqual({});
  });
});

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
      result.current.build.publish({ title_multiloc: { en: 'Unsaved title' } })
    );
    act(() => result.current.settings.publish({ voting_max_total: 10 }));
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
        editor: usePhasePreviewPublisher('build', phaseId),
        draft: usePhasePreviewDraft('phase-a'),
      }),
      { wrapper, initialProps: { phaseId: 'phase-a' } }
    );
    act(() =>
      result.current.editor.publish({ title_multiloc: { en: 'Draft' } })
    );
    act(() => result.current.editor.publish({ title_multiloc: {} }));
    expect(result.current.draft).toEqual({ title_multiloc: {} });
    rerender({ phaseId: 'phase-b' });
    expect(result.current.draft).toEqual({});
  });

  it('shows the saved phase again once an editor clears its patch', () => {
    const { result } = renderHook(
      () => ({
        build: usePhasePreviewPublisher('build', 'phase-a'),
        settings: usePhasePreviewPublisher('settings', 'phase-a'),
        draft: usePhasePreviewDraft('phase-a'),
      }),
      { wrapper }
    );
    act(() => result.current.build.publish({ start_at: '2026-12-01' }));
    act(() => result.current.settings.publish({ voting_max_total: 10 }));
    act(() => result.current.build.clear());
    expect(result.current.draft).toEqual({ voting_max_total: 10 });
  });
});

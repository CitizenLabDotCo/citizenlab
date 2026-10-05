import React, { ReactNode } from 'react';

import { act, renderHook } from 'utils/testUtils/rtl';

import {
  PhaseSaveProvider,
  SaveReason,
  usePhaseSave,
  useRegisterPhaseSaver,
} from './PhaseSaveContext';

type Saver = { dirty: boolean; save: (reason: SaveReason) => Promise<void> };

const wrapper = ({ children }: { children: ReactNode }) => (
  <PhaseSaveProvider>{children}</PhaseSaveProvider>
);

const clean: Saver = { dirty: false, save: () => Promise.resolve() };

type Panels = { build?: Saver; settings?: Saver };

const renderPanels = (panels: Panels) =>
  renderHook(
    ({ build = clean, settings = clean }: Panels) => {
      useRegisterPhaseSaver('build', build);
      useRegisterPhaseSaver('settings', settings);
      return usePhaseSave();
    },
    { wrapper, initialProps: panels }
  );

describe('PhaseSaveContext', () => {
  it('is dirty while any panel has changes', () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderPanels({
      build: { dirty: false, save },
      settings: { dirty: false, save },
    });

    expect(result.current?.dirty).toBe(false);

    rerender({
      build: { dirty: true, save },
      settings: { dirty: false, save },
    });
    expect(result.current?.dirty).toBe(true);

    rerender({
      build: { dirty: false, save },
      settings: { dirty: false, save },
    });
    expect(result.current?.dirty).toBe(false);
  });

  it('saves only the panels with changes, passing the reason on', async () => {
    const saveBuild = jest.fn().mockResolvedValue(undefined);
    const saveSettings = jest.fn().mockResolvedValue(undefined);
    const { result } = renderPanels({
      build: { dirty: true, save: saveBuild },
      settings: { dirty: false, save: saveSettings },
    });

    let saved: boolean | undefined;
    await act(async () => {
      saved = await result.current?.saveAll('button');
    });

    expect(saved).toBe(true);
    expect(saveBuild).toHaveBeenCalledWith('button');
    expect(saveSettings).not.toHaveBeenCalled();
  });

  it('reports a failure when one of the panels fails to save', async () => {
    const { result } = renderPanels({
      build: { dirty: true, save: jest.fn().mockResolvedValue(undefined) },
      settings: {
        dirty: true,
        save: jest.fn().mockRejectedValue(new Error('invalid')),
      },
    });

    let saved: boolean | undefined;
    await act(async () => {
      saved = await result.current?.saveAll('leave');
    });

    expect(saved).toBe(false);
    expect(result.current?.saving).toBe(false);
  });

  it('drops every change and bumps the revision on discard', () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const { result } = renderPanels({ build: { dirty: true, save } });

    expect(result.current?.dirty).toBe(true);
    expect(result.current?.revision).toBe(0);

    act(() => {
      result.current?.discardAll();
    });

    expect(result.current?.dirty).toBe(false);
    expect(result.current?.revision).toBe(1);
  });
});

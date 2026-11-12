import React from 'react';

import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { project1 } from 'api/projects/__mocks__/_mockServer';

import { act, renderHook } from 'utils/testUtils/rtl';

import { PREVIEW_FRAME_NAME, PreviewSnapshot } from './types';

const snapshot: PreviewSnapshot = {
  project: project1,
  phase: phasesData[0],
  draft: {},
  lifecycle: 'open',
};

const editor = { postMessage: jest.fn() };

const sendSnapshot = (next: PreviewSnapshot) => {
  const event = new MessageEvent('message', {
    origin: window.location.origin,
    data: { type: 'phase-preview-snapshot', snapshot: next },
  });
  Object.defineProperty(event, 'source', { value: editor });
  window.dispatchEvent(event);
};

// A fresh module copy, since the frame check runs once at import. It shares the
// test's React so its hook can render.
const loadRuntime = () => {
  let runtime: typeof import('./runtime') | undefined;
  jest.isolateModules(() => {
    jest.doMock('react', () => React);
    runtime = jest.requireActual<typeof import('./runtime')>('./runtime');
  });
  if (!runtime) throw new Error('runtime did not load');
  return runtime;
};

const loadInFrame = () => {
  window.name = PREVIEW_FRAME_NAME;
  Object.defineProperty(window, 'parent', {
    configurable: true,
    value: editor,
  });

  const runtime = loadRuntime();
  runtime.installPhasePreview();
  return runtime;
};

const originalFetch = window.fetch;

afterEach(() => {
  window.name = '';
  Object.defineProperty(window, 'parent', {
    configurable: true,
    value: window,
  });
  window.fetch = originalFetch;
  document
    .querySelectorAll('meta[http-equiv="Content-Security-Policy"]')
    .forEach((meta) => meta.remove());
});

it('stays inactive outside the preview frame', () => {
  const runtime = loadRuntime();
  runtime.installPhasePreview();

  expect(runtime.isPhasePreviewFrame()).toBe(false);
  expect(runtime.phasePreviewReady()).toBeUndefined();
  expect(window.fetch).toBe(originalFetch);
});

it('holds requests until the first snapshot and re-renders on updates', async () => {
  const network = jest.fn(
    async () =>
      new Response('{}', { headers: { 'Content-Type': 'text/plain' } })
  );
  window.fetch = network;
  const runtime = loadInFrame();

  const early = window.fetch('/web_api/v1/app_configuration');
  await Promise.resolve();
  expect(network).not.toHaveBeenCalled();
  expect(editor.postMessage).toHaveBeenCalledWith(
    { type: 'phase-preview-ready' },
    window.location.origin
  );

  sendSnapshot(snapshot);
  await runtime.phasePreviewReady();
  await early;
  expect(network).toHaveBeenCalledTimes(1);

  const { result } = renderHook(() => runtime.usePhasePreview());
  expect(result.current?.lifecycle).toBe('open');

  act(() => sendSnapshot({ ...snapshot, lifecycle: 'ended' }));
  expect(result.current?.lifecycle).toBe('ended');
});

it('allows map workers and video embeds, but no same-origin frames', () => {
  loadInFrame();

  const policy =
    document
      .querySelector('meta[http-equiv="Content-Security-Policy"]')
      ?.getAttribute('content') ?? '';
  const frameSrc = policy
    .split('; ')
    .find((directive) => directive.startsWith('frame-src'));

  expect(policy).toContain("worker-src 'self' blob:");
  expect(frameSrc).toContain('https://www.youtube.com');
  expect(frameSrc).not.toContain("'self'");
});

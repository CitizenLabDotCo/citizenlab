import { useSyncExternalStore } from 'react';

import { isEqual } from 'lodash-es';

import causesKeys from 'api/causes/keys';
import commonGroundResultsKeys from 'api/common_ground/keys/commonGroundResultsKeys';
import ideaFeedKeys from 'api/idea_feed/keys';
import ideaMarkersKeys from 'api/idea_markers/keys';
import ideasKeys from 'api/ideas/keys';
import ideaFilterCountsKeys from 'api/ideas_filter_counts/keys';
import phasesKeys from 'api/phases/keys';
import pollResponsesKeys from 'api/poll_responses/keys';
import projectsKeys from 'api/projects/keys';

import { queryClient } from 'utils/cl-react-query/queryClient';

import { getPreviewActionSettings } from './lifecycle';
import { PreviewSession } from './session';
import { isolatePreviewStorage } from './storage';
import {
  JsonObject,
  object,
  PREVIEW_FRAME_NAME,
  PreviewSnapshot,
  isPreviewSnapshot,
} from './types';

// Mirrors the video hosts the back end allows in sanitized descriptions.
const VIDEO_EMBED_SOURCES = [
  'https://www.youtube.com',
  'https://youtube.com',
  'https://youtu.be',
  'https://player.vimeo.com',
  'https://wistia.com',
  'https://*.wistia.com',
  'https://wi.st',
  'https://*.wi.st',
  'https://www.dailymotion.com',
  'https://dailymotion.com',
  'https://media.videotool.dk',
  'https://www.dreambroker.com',
  'https://dreambroker.com',
  'https://www.videoask.com',
  'https://videoask.com',
].join(' ');

let session: PreviewSession | undefined;
let ready: Promise<void> | undefined;
const listeners = new Set<() => void>();

const isPreviewFrame =
  window.name === PREVIEW_FRAME_NAME && window.parent !== window;

// True from the first line of app code, before the editor has sent a snapshot.
export const isPhasePreviewFrame = () => isPreviewFrame;

export const getPhasePreview = () => session?.snapshot;

// Resolves once the first snapshot is in place. Undefined outside the preview.
export const phasePreviewReady = () => ready;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// Components read the snapshot through this hook so lifecycle and draft
// changes re-render them, even when no query data changes.
export const usePhasePreview = () =>
  useSyncExternalStore(subscribe, getPhasePreview);

const jsonResponse = (body: JsonObject, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const createPreviewFetch =
  (
    preview: PreviewSession,
    originalFetch: typeof fetch,
    origin: string,
    onBlocked: () => void
  ): typeof fetch =>
  async (input, init) => {
    const url = new URL(
      input instanceof Request ? input.url : String(input),
      origin
    );
    const method = (
      init?.method ?? (input instanceof Request ? input.method : 'GET')
    ).toUpperCase();
    const apiPrefix = '/web_api/v1';
    const isApi =
      url.origin === origin && url.pathname.startsWith(`${apiPrefix}/`);
    const path = url.pathname.slice(apiPrefix.length);

    if (method !== 'GET' && method !== 'HEAD') {
      if (isApi) {
        const bodyText =
          typeof init?.body === 'string'
            ? init.body
            : input instanceof Request
            ? await input.clone().text()
            : '{}';
        try {
          const body = object(JSON.parse(bodyText || '{}'));
          const response = preview.write(path, method, body);
          if (response) return jsonResponse(response);
        } catch {
          // Malformed or unsupported bodies must never fall through to the network.
        }
      }

      onBlocked();
      return jsonResponse(
        { errors: { base: [{ error: 'preview_write_blocked' }] } },
        422
      );
    }

    if (isApi) {
      if (
        (path === '/events' && url.searchParams.has('attendee_id')) ||
        /^\/users\/[^/]+\/events$/.test(path)
      ) {
        return jsonResponse(preview.attendingEvents());
      }

      const local = preview.read(path, url.searchParams);
      if (local) return jsonResponse(local);

      // Draft project inputs are readable to the manager, but public list hooks
      // otherwise filter them out before the preview can display them.
      if (url.searchParams.get('phase') === preview.phaseId) {
        url.searchParams.delete('project_publication_status');
      }
    }

    const showParticipation = preview.snapshot.showParticipation;
    const response = await originalFetch(
      input instanceof Request ? new Request(url, input) : url,
      init
    );
    if (isApi && showParticipation !== preview.snapshot.showParticipation) {
      const local = preview.read(path, url.searchParams);
      if (local) return jsonResponse(local);
    }

    if (
      isApi &&
      path === `/phases/${preview.phaseId}/progress` &&
      (response.ok || preview.snapshot.lifecycle)
    ) {
      // Load one page at a time so large phases do not inflate the iframe's memory.
      const statementsUrl = new URL(`${apiPrefix}/ideas`, origin);
      statementsUrl.searchParams.set('phase', preview.phaseId);
      statementsUrl.searchParams.set('page[size]', '20');
      statementsUrl.searchParams.set(
        'page[number]',
        String(preview.statementPage)
      );
      statementsUrl.searchParams.set('sort', '-new');

      const statements = await originalFetch(statementsUrl, init);
      // Without statements, fall back to the real progress response.
      if (statements.ok) {
        preview.setStatements(await statements.json());
        if (preview.snapshot.lifecycle) {
          return jsonResponse(
            preview.transform({
              data: {
                id: preview.phaseId,
                type: 'common_ground_progress',
                attributes: {
                  num_ideas: preview.snapshot.phase.attributes.ideas_count,
                },
              },
            })
          );
        }
      }
    }

    if (
      !isApi ||
      !response.ok ||
      !response.headers.get('content-type')?.includes('json')
    ) {
      return response;
    }

    const data: JsonObject = await response.json();
    const transformed = preview.transform(data, path + url.search);
    return jsonResponse(transformed);
  };

// Called synchronously before any other app module runs (see ./install.ts),
// so no request leaves the frame before the write barrier is in place.
export const installPhasePreview = () => {
  if (!isPreviewFrame || ready) return;

  isolatePreviewStorage();

  const originalFetch = window.fetch.bind(window);
  const blocked = () =>
    window.parent.postMessage(
      { type: 'phase-preview-blocked' },
      window.location.origin
    );

  let resolveReady = () => {};
  ready = new Promise<void>((resolve) => {
    resolveReady = resolve;
  });

  // Requests made before the first snapshot wait for the preview fetch.
  window.fetch = async (input, init) => {
    await ready;
    return window.fetch(input, init);
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    async = true,
    username?: string | null,
    password?: string | null
  ) {
    if (!['GET', 'HEAD'].includes(method.toUpperCase())) {
      blocked();
      throw new Error('Writes are disabled in preview');
    }
    return originalOpen.call(this, method, url, async, username, password);
  };
  navigator.sendBeacon = () => false;
  window.open = () => {
    blocked();
    return null;
  };

  // Same-origin frames would load the app without these patches, so frames are
  // limited to the video hosts the back end allows in descriptions. Map workers
  // load their scripts from the ArcGIS CDN.
  const policy = document.createElement('meta');
  policy.httpEquiv = 'Content-Security-Policy';
  policy.content = [
    "form-action 'none'",
    `frame-src ${VIDEO_EMBED_SOURCES}`,
    "object-src 'none'",
    "worker-src 'self' blob:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://js.arcgis.com",
  ].join('; ');
  document.head.appendChild(policy);

  document.addEventListener(
    'click',
    (event) => {
      const target =
        event.target instanceof Element ? event.target.closest('a') : null;
      if (!target) return;
      const url = new URL(target.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        /\/(admin|sign-out|sign-in|sign-up)(\/|$)/.test(url.pathname) ||
        target.hasAttribute('download')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        blocked();
      } else if (target.target) {
        target.target = '_self';
      }
    },
    true
  );

  window.addEventListener('message', (event: MessageEvent) => {
    if (
      event.origin !== window.location.origin ||
      event.source !== window.parent ||
      event.data?.type !== 'phase-preview-snapshot'
    ) {
      return;
    }
    // This protocol accepts snapshots only from the embedding same-origin editor.
    const snapshot: unknown = event.data.snapshot;
    if (!isPreviewSnapshot(snapshot)) return;

    if (!session) {
      session = new PreviewSession(snapshot);
      window.fetch = createPreviewFetch(
        session,
        originalFetch,
        window.location.origin,
        blocked
      );
      resolveReady();
      return;
    }

    const previous = session.snapshot;
    if (!session.updateSnapshot(snapshot)) return;

    listeners.forEach((listener) => listener());
    refreshPreviewQueries(previous, snapshot, session.phaseId);
  });

  window.parent.postMessage(
    { type: 'phase-preview-ready' },
    window.location.origin
  );
};

// Refresh phase data without remounting forms or clearing local answers.
const refreshPreviewQueries = (
  previous: PreviewSnapshot,
  next: PreviewSnapshot,
  phaseId: string
) => {
  const lifecycleChanged = previous.lifecycle !== next.lifecycle;
  const participationChanged =
    previous.showParticipation !== next.showParticipation;
  const settingsChanged = !isEqual(
    getPreviewActionSettings(previous),
    getPreviewActionSettings(next)
  );

  void queryClient.invalidateQueries({
    queryKey: phasesKeys.item({ phaseId }),
  });
  void queryClient.invalidateQueries({
    queryKey: phasesKeys.list({ projectId: next.project.id }),
  });
  if (lifecycleChanged || participationChanged || settingsChanged) {
    // Option cards cache their own action descriptors, independently of the
    // phase. Re-read them when their settings or lifecycle change.
    void queryClient.invalidateQueries({ queryKey: ideasKeys.all() });
  }
  if (participationChanged) {
    for (const queryKey of [
      causesKeys.all(),
      commonGroundResultsKeys.all(),
      ideaFeedKeys.all(),
      ideaMarkersKeys.all(),
      ideaFilterCountsKeys.items(),
      pollResponsesKeys.all(),
      projectsKeys.all(),
    ]) {
      void queryClient.invalidateQueries({ queryKey });
    }
  }
};

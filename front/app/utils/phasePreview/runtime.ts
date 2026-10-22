import phasesKeys from 'api/phases/keys';

import { queryClient } from 'utils/cl-react-query/queryClient';

import { PreviewSession } from './session';
import { isolatePreviewStorage } from './storage';
import {
  JsonObject,
  object,
  PREVIEW_FRAME_NAME,
  isPreviewSnapshot,
} from './types';

let session: PreviewSession | undefined;

export const getPhasePreview = () => session?.snapshot;

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

      const local = preview.read(path);
      if (local) return jsonResponse(local);

      // Draft project inputs are readable to the manager, but public list hooks
      // otherwise filter them out before the preview can display them.
      if (url.searchParams.get('phase') === preview.phaseId) {
        url.searchParams.delete('project_publication_status');
      }
    }

    const response = await originalFetch(
      input instanceof Request ? new Request(url, input) : url,
      init
    );
    if (
      !isApi ||
      !response.ok ||
      !response.headers.get('content-type')?.includes('json')
    ) {
      return response;
    }

    if (path === `/phases/${preview.phaseId}/progress`) {
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
      if (!statements.ok) return statements;
      preview.setStatements(await statements.json());
    }

    const data: JsonObject = await response.json();
    const transformed = preview.transform(data, path + url.search);
    return jsonResponse(transformed);
  };

export const initializePhasePreview = async () => {
  if (window.name !== PREVIEW_FRAME_NAME || window.parent === window) return;

  // Install the write barrier before importing any application modules. It stays
  // active during route changes and is reinstalled before app startup on reload.
  isolatePreviewStorage();

  const originalFetch = window.fetch.bind(window);
  window.fetch = async () =>
    jsonResponse({ errors: { base: [{ error: 'preview_not_ready' }] } }, 423);
  const blocked = () =>
    window.parent.postMessage(
      { type: 'phase-preview-blocked' },
      window.location.origin
    );
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

  const policy = document.createElement('meta');
  policy.httpEquiv = 'Content-Security-Policy';
  policy.content =
    "form-action 'none'; frame-src 'none'; object-src 'none'; worker-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:";
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

  await new Promise<void>((resolve) => {
    const receive = (event: MessageEvent) => {
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

      if (session) {
        if (session.updateSnapshot(snapshot)) {
          // Refresh phase data without remounting forms or clearing local answers.
          void queryClient.invalidateQueries({
            queryKey: phasesKeys.item({ phaseId: session.phaseId }),
          });
          void queryClient.invalidateQueries({
            queryKey: phasesKeys.list({ projectId: snapshot.project.id }),
          });
        }
        return;
      }

      session = new PreviewSession(snapshot);
      window.fetch = createPreviewFetch(
        session,
        originalFetch,
        window.location.origin,
        blocked
      );
      resolve();
    };
    window.addEventListener('message', receive);
    window.parent.postMessage(
      { type: 'phase-preview-ready' },
      window.location.origin
    );
  });
};

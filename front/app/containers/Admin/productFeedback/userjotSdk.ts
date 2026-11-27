const SDK_URL = 'https://cdn.userjot.com/sdk/v2/uj.js';

export interface UserjotIdentity {
  id: string;
  signature: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  companies?: { id: string; name: string; domain?: string }[];
}

interface UserjotEmbedController {
  navigate: (path: string) => void;
  destroy: () => void;
}

interface UserjotSdk {
  init: (
    projectId: string,
    options: { onReady?: () => void; onError?: (error: Error) => void }
  ) => void;
  identify: (identity: UserjotIdentity | null) => void;
  embed: (options: {
    container: HTMLElement;
    path?: string;
    theme?: 'auto' | 'light' | 'dark';
    onError?: (error: Error) => void;
  }) => UserjotEmbedController | undefined;
  destroy: () => void;
}

declare global {
  interface Window {
    uj?: UserjotSdk;
    $ujq?: unknown[][];
  }
}

// Same as UserJot's loader snippet: calls made before the SDK script has
// loaded are queued in window.$ujq, which the SDK replays once it's ready.
const queue =
  (method: keyof UserjotSdk) =>
  (...args: unknown[]) => {
    window.$ujq?.push([method, ...args]);
    return undefined;
  };

export const loadUserjotSdk = (): UserjotSdk => {
  if (window.uj) return window.uj;

  window.$ujq = window.$ujq ?? [];
  const sdk: UserjotSdk = {
    init: queue('init'),
    identify: queue('identify'),
    embed: queue('embed'),
    destroy: queue('destroy'),
  };
  window.uj = sdk;

  const script = document.createElement('script');
  script.src = SDK_URL;
  script.type = 'module';
  script.async = true;
  document.head.appendChild(script);

  return sdk;
};

import { BlockManifest, BlockMessages } from 'api/custom_blocks/types';

import { Metrics } from './measure';

export type RunTarget =
  | {
      kind: 'block';
      bundle: string;
      manifest: BlockManifest;
      messages: BlockMessages;
      config?: Record<string, unknown>;
    }
  | { kind: 'layout'; craftjs_json: unknown };

export interface HarnessRequest {
  target: RunTarget;
  locale: string;
  layoutId: string;
  token: string;
}

export interface HarnessFacts {
  mounted: boolean;
  boundaryError: { message: string; stack?: string } | null;
  metrics: Metrics;
  a11y: {
    violations: { id: string; impact: string | null; help: string }[];
  };
}

declare global {
  interface Window {
    /** Installed by this route; the check service calls it from outside the page. */
    __blockHarness?: {
      run(request: HarnessRequest): Promise<HarnessFacts>;
    };
    /** Injected by the check service before it runs the harness. */
    axe?: {
      run(selector: string): Promise<{
        violations: { id: string; impact?: string | null; help: string }[];
      }>;
    };
  }
}

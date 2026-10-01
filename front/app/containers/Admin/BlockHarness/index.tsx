import React, { useEffect, useRef, useState } from 'react';

import { SerializedNodes } from '@craftjs/core';
import { useQueryClient } from '@tanstack/react-query';
import { SupportedLocale } from 'typings';

import useFeatureFlag from 'hooks/useFeatureFlag';

import BlockDataProvider from 'components/admin/ContentBuilder/CustomBlocks/runtime/BlockDataContext';
import {
  DRAFT_BLOCK_ID,
  setDraftBlock,
} from 'components/admin/ContentBuilder/CustomBlocks/runtime/draftBlock';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';

import Editor from '../reporting/components/ReportBuilder/Editor';
import { ReportContextProvider } from '../reporting/context/ReportContext';

import measure, { Metrics } from './measure';
import settle from './settle';
import { HarnessFacts, HarnessRequest, RunTarget } from './typings';

// The A4 content width a report is laid out for. ResponsiveContainer measures its
// parent, so a chart checked at any other width is not the chart the reader sees.
const HARNESS_WIDTH = '794px';

const oneNodeLayout = (target: Extract<RunTarget, { kind: 'block' }>) =>
  ({
    ROOT: {
      type: 'div',
      isCanvas: true,
      props: { id: 'e2e-content-builder-frame' },
      custom: {},
      hidden: false,
      nodes: ['harnessblk'],
      linkedNodes: {},
      displayName: 'div',
    },
    harnessblk: {
      type: { resolvedName: 'CustomBlock' },
      isCanvas: false,
      props: { blockId: DRAFT_BLOCK_ID, config: target.config ?? {} },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      nodes: [],
      linkedNodes: {},
      displayName: 'CustomBlock',
    },
  } as unknown as SerializedNodes);

interface MountState {
  layout: SerializedNodes;
  locale: SupportedLocale;
  layoutId: string;
  token: string;
}

/**
 * Mounts one block, or a whole report, in the real front-end runtime so the check
 * service can see what it does.
 *
 * The runtime is the bundle. A renderer of its own inside the check service would
 * be a second app that drifts from this one on the first component library upgrade;
 * driving this one from outside means the agent's browser and the admin's browser
 * load the same code.
 *
 * The page reports facts and never judges them: it executes generated code, and
 * generated code can patch `console.error` or swallow its own errors. The verdicts
 * are the service's, out of reach.
 */
const BlockHarness = () => {
  const enabled = useFeatureFlag({ name: 'llm_reporting' });
  const queryClient = useQueryClient();
  const [mount, setMount] = useState<MountState | null>(null);
  const resolveRef = useRef<((facts: HarnessFacts) => void) | null>(null);
  const errorRef = useRef<HarnessFacts['boundaryError']>(null);

  useEffect(() => {
    if (!enabled) return;

    window.__blockHarness = {
      run: (request: HarnessRequest) =>
        new Promise<HarnessFacts>((resolve) => {
          errorRef.current = null;
          resolveRef.current = resolve;

          if (request.target.kind === 'block') {
            setDraftBlock({
              bundle: request.target.bundle,
              manifest: request.target.manifest,
              messages: request.target.messages,
            });
          }

          setMount({
            layout:
              request.target.kind === 'block'
                ? oneNodeLayout(request.target)
                : (request.target.craftjs_json as SerializedNodes),
            locale: request.locale as SupportedLocale,
            layoutId: request.layoutId,
            token: request.token,
          });
        }),
    };

    return () => {
      delete window.__blockHarness;
      setDraftBlock(null);
    };
  }, [enabled]);

  // Reporting happens after the render the mount caused, not during it.
  useEffect(() => {
    if (!mount || !resolveRef.current) return;

    let live = true;
    const report = async () => {
      await settle(queryClient);
      if (!live) return;

      const metrics: Metrics = measure('#harness-root');
      const violations = await runAxe();

      resolveRef.current?.({
        mounted: errorRef.current === null,
        boundaryError: errorRef.current,
        metrics,
        a11y: { violations },
      });
      resolveRef.current = null;
    };

    report();

    return () => {
      live = false;
    };
  }, [mount, queryClient]);

  if (!enabled) return null;

  return (
    <div
      id="harness-root"
      style={{ width: HARNESS_WIDTH, background: '#fff' }}
      data-testid="harness-root"
    >
      {mount && (
        <ReportContextProvider width="pdf" contentBuilderLocale={mount.locale}>
          <BlockDataProvider
            layoutId={mount.layoutId}
            reportingToken={mount.token}
          >
            <HarnessBoundary
              onError={(error) => {
                errorRef.current = {
                  message: error.message,
                  stack: error.stack,
                };
              }}
            >
              <Editor isPreview>
                <ContentBuilderFrame editorData={mount.layout} />
              </Editor>
            </HarnessBoundary>
          </BlockDataProvider>
        </ReportContextProvider>
      )}
    </div>
  );
};

// axe is injected into the page by the check service rather than bundled here: it
// is a checking dependency, and it has no business in the app every reader loads.
const runAxe = async (): Promise<HarnessFacts['a11y']['violations']> => {
  const axe = window.axe;
  if (!axe) return [];

  try {
    const results = await axe.run('#harness-root');
    return results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact ?? null,
      help: violation.help,
    }));
  } catch {
    return [];
  }
};

interface BoundaryProps {
  onError: (error: Error) => void;
  children: React.ReactNode;
}

class HarnessBoundary extends React.Component<BoundaryProps> {
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    return this.props.children;
  }
}

export default BlockHarness;

import { ComponentType, useEffect, useState } from 'react';

import { customBlockBundleUrl } from 'api/custom_blocks/types';

import { getDraftBlock, isDraft } from './draftBlock';
import { loadBlockModule, loadBlockModuleFromSource } from './loadBlockModule';
import { BlockProps } from './types';

interface Params {
  blockId?: string;
  version?: number;
}

interface LoadedBlock {
  component: ComponentType<BlockProps> | null;
  failed: boolean;
}

/**
 * Imports a version's compiled bundle and hands back its component.
 *
 * The bundle is built before the version is written, so this is a plain import:
 * no compile step, no pending state, nothing to repair here. The endpoint serves
 * it with immutable cache headers, which is what makes it cheap on every later
 * render.
 *
 * Not a TanStack Query hook, unlike the rest of our fetching: the bundle has to
 * arrive as an ES module so that its `gv-sdk` import resolves through the shim to
 * the app's own React. That is a module-graph operation, not a request whose body
 * we hold, which is also why the cache for it lives in `loadBlockModule`.
 */
const useLoadedBlock = ({ blockId, version }: Params): LoadedBlock => {
  const [component, setComponent] = useState<ComponentType<BlockProps> | null>(
    null
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!blockId) return;

    const draft = isDraft(blockId) ? getDraftBlock() : null;
    if (!draft && !version) return;

    let live = true;
    setFailed(false);

    const loading = draft
      ? loadBlockModuleFromSource(draft.bundle)
      : loadBlockModule(customBlockBundleUrl(blockId, version as number));

    loading
      .then((module) => {
        if (live) setComponent(() => module.default);
      })
      .catch(() => {
        if (live) setFailed(true);
      });

    return () => {
      live = false;
    };
  }, [blockId, version]);

  return { component, failed };
};

export default useLoadedBlock;

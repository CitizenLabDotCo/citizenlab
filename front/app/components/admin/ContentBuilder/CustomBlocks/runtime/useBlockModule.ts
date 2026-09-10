import { ComponentType, useEffect, useState } from 'react';

import { customBlockBundleUrl } from 'api/custom_blocks/types';
import useCompileCustomBlockVersion from 'api/custom_blocks/useCompileCustomBlockVersion';
import useCustomBlockVersions from 'api/custom_blocks/useCustomBlockVersions';

import { compileAndCheckBlockSource } from '../compiler';

import { loadBlockModule, loadBlockModuleFromCode } from './loadBlockModule';
import { BlockProps } from './types';

interface Params {
  blockId?: string;
  version?: number;
  // A version the background composer wrote has source but no bundle yet.
  pending: boolean;
}

// Resolves a block's React component, compiling it first when the version is
// still pending.
//
// The backend has no JavaScript toolchain, so a block composed in the background
// arrives as source. The first admin to open the report compiles it here and
// posts the bundle back, and every later render imports that bundle instead.
const useBlockModule = ({ blockId, version, pending }: Params) => {
  const [component, setComponent] = useState<ComponentType<BlockProps> | null>(
    null
  );
  const [failed, setFailed] = useState(false);

  // The source lives on the version, which only the admin endpoint serves.
  const { data: versions } = useCustomBlockVersions(blockId, {
    enabled: pending,
  });
  const { mutate: storeCompiled } = useCompileCustomBlockVersion();

  useEffect(() => {
    if (!blockId || !version) return;
    let live = true;
    setFailed(false);

    if (!pending) {
      loadBlockModule(customBlockBundleUrl(blockId, version))
        .then((mod) => {
          if (live) setComponent(() => mod.default);
        })
        .catch(() => {
          if (live) setFailed(true);
        });

      return () => {
        live = false;
      };
    }

    const source = versions?.data.find(
      (candidate) => candidate.attributes.number === version
    )?.attributes.source;
    // Still loading the versions; the next render tries again.
    if (source === undefined) return;

    compileAndCheckBlockSource(source)
      .then(async (result) => {
        if (
          !result.ok ||
          result.code === null ||
          result.lintErrors.length > 0
        ) {
          if (live) setFailed(true);
          storeCompiled({
            blockId,
            number: version,
            bundle: '',
            compileState: 'failed',
          });
          return;
        }

        const mod = await loadBlockModuleFromCode(result.code);
        if (live) setComponent(() => mod.default);
        // Render first, persist after: the admin should not wait on the write.
        storeCompiled({
          blockId,
          number: version,
          bundle: result.code,
          compileState: 'compiled',
        });
      })
      .catch(() => {
        if (live) setFailed(true);
      });

    return () => {
      live = false;
    };
  }, [blockId, version, pending, versions, storeCompiled]);

  return { component, failed };
};

export default useBlockModule;

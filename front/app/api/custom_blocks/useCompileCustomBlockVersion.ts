import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customBlocksKeys from './keys';
import { ICustomBlockVersion } from './types';

type CompileParams = {
  blockId: string;
  number: number;
  bundle: string;
  compileState: 'compiled' | 'failed';
};

// Fills in the compiled bundle of a version the background composer left pending.
// The backend has no JavaScript toolchain, so compiling happens here, once, when
// the report is first opened.
const compileVersion = ({
  blockId,
  number,
  bundle,
  compileState,
}: CompileParams) =>
  fetcher<ICustomBlockVersion>({
    path: `/custom_blocks/${blockId}/versions/${number}/compile`,
    action: 'patch',
    body: { version: { bundle, compile_state: compileState } },
  });

const useCompileCustomBlockVersion = () => {
  const queryClient = useQueryClient();

  return useMutation<ICustomBlockVersion, CLErrors, CompileParams>({
    mutationFn: compileVersion,
    onSuccess: (_data, { blockId }) => {
      queryClient.invalidateQueries({
        queryKey: customBlocksKeys.item({ id: blockId }),
      });
      queryClient.invalidateQueries({
        queryKey: customBlocksKeys.list({ versionsOf: blockId }),
      });
    },
  });
};

export default useCompileCustomBlockVersion;

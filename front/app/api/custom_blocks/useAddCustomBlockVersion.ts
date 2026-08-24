import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customBlocksKeys from './keys';
import { IAddCustomBlockVersion, ICustomBlockVersion } from './types';

const addCustomBlockVersion = ({
  customBlockId,
  source,
  bundle,
  manifest,
  messages,
  ai_session_id,
}: IAddCustomBlockVersion) =>
  fetcher<ICustomBlockVersion>({
    path: `/custom_blocks/${customBlockId}/versions`,
    action: 'post',
    body: { version: { source, bundle, manifest, messages, ai_session_id } },
  });

const useAddCustomBlockVersion = () => {
  const queryClient = useQueryClient();
  return useMutation<ICustomBlockVersion, CLErrors, IAddCustomBlockVersion>({
    mutationFn: addCustomBlockVersion,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: customBlocksKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: customBlocksKeys.item({ id: variables.customBlockId }),
      });
    },
  });
};

export default useAddCustomBlockVersion;

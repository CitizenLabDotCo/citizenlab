import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customBlocksKeys from './keys';
import { ICustomBlock, IUpdateCustomBlock } from './types';

const updateCustomBlock = ({ id, ...requestBody }: IUpdateCustomBlock) =>
  fetcher<ICustomBlock>({
    path: `/custom_blocks/${id}`,
    action: 'patch',
    body: { custom_block: requestBody },
  });

const useUpdateCustomBlock = () => {
  const queryClient = useQueryClient();
  return useMutation<ICustomBlock, CLErrors, IUpdateCustomBlock>({
    mutationFn: updateCustomBlock,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: customBlocksKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: customBlocksKeys.item({ id: variables.id }),
      });
    },
  });
};

export default useUpdateCustomBlock;

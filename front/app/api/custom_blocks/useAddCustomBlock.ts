import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customBlocksKeys from './keys';
import { IAddCustomBlock, ICustomBlock } from './types';

const addCustomBlock = ({ title_multiloc }: IAddCustomBlock) =>
  fetcher<ICustomBlock>({
    path: '/custom_blocks',
    action: 'post',
    body: { custom_block: { title_multiloc } },
  });

const useAddCustomBlock = () => {
  const queryClient = useQueryClient();
  return useMutation<ICustomBlock, CLErrors, IAddCustomBlock>({
    mutationFn: addCustomBlock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customBlocksKeys.lists() });
    },
  });
};

export default useAddCustomBlock;

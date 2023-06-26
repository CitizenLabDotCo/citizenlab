import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectKeys from './keys';
import { IProject } from './types';

type IQrCode = {
  id: string;
  remove?: boolean;
};

const qrCode = ({ id, remove }: IQrCode) =>
  fetcher<IProject>({
    path: `/projects/${id}/qr_code`,
    action: 'patch',
    body: remove ? { remove: true } : {},
  });

const useQrCode = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation<IProject, CLErrors, IQrCode>({
    mutationFn: qrCode,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.item({ id: projectId }),
      });
    },
  });
};

export default useQrCode;

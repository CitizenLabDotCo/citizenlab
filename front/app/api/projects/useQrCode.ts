import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectKeys from './keys';
import { IProject } from '../../services/projects';

type IQrCode = {
  id: string;
};

const qrCode = ({ id }: IQrCode) =>
  fetcher<IProject>({
    path: `/projects/${id}/qrcode`,
    action: 'patch',
    body: {},
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

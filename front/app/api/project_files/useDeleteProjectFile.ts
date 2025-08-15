import { useMutation } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

const deleteProjectFile = ({
  projectId,
  fileId,
}: {
  projectId: string;
  fileId: string;
}) =>
  fetcher({
    path: `/projects/${projectId}/files/${fileId}`,
    action: 'delete',
  });

const useDeleteProjectFile = () => {
  return useMutation({
    mutationFn: deleteProjectFile,
  });
};

export default useDeleteProjectFile;

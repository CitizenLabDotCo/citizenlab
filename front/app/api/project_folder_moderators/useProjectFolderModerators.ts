import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectFolderModeratorsKeys from './keys';
import { ProjectFolderModeratorsKeys, ProjectForderParams } from './types';
import { IUsers } from 'services/users';

const fetchProjectForlderModerators = ({
  projectFolderId,
}: ProjectForderParams) => {
  return fetcher<IUsers>({
    path: `/project_folders/${projectFolderId}/moderators`,
    action: 'get',
  });
};

const useProjectFolderModerators = ({
  projectFolderId,
}: ProjectForderParams) => {
  return useQuery<IUsers, CLErrors, IUsers, ProjectFolderModeratorsKeys>({
    queryKey: projectFolderModeratorsKeys.list({ projectFolderId }),
    queryFn: () => fetchProjectForlderModerators({ projectFolderId }),
  });
};

export default useProjectFolderModerators;

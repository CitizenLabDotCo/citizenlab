import { memo } from 'react';
import { useProjectFolderModerators } from 'modules/project_folders/hooks';
import { IUserData } from 'services/users';

export interface IGetModeratorHook {
  folderModerators: IUserData[] | Error | null | undefined;
  isFolderModerator: (authUser: IUserData) => boolean;
  isNotFolderModerator: (authUser: IUserData) => boolean;
}

type children = (renderProps: IGetModeratorHook) => JSX.Element | null;

interface Props {
  children?: children;
  projectFolderId: string;
}

const GetProjectFolderModerators = memo<Props>(
  ({ projectFolderId, children }) => {
    const hook = useProjectFolderModerators(projectFolderId);

    return (children as children)(hook);
  }
);

export default GetProjectFolderModerators;

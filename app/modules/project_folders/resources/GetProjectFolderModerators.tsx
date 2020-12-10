import { memo } from 'react';
import { useProjectFolderModerators } from 'modules/project_folders/hooks';
import { IUsers, IUserData } from 'services/users';

export interface IGetModeratorHook {
  moderators: IUsers | Error | null | undefined;
  isModerator: (authUser: IUserData) => boolean;
  isNotModerator: (authUser: IUserData) => boolean;
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

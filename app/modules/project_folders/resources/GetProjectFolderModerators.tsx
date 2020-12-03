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
}

const GetProjectFolderModerators = memo<Props>(({ children }) => {
  const hook = useProjectFolderModerators();

  return (children as children)(hook);
});

export default GetProjectFolderModerators;

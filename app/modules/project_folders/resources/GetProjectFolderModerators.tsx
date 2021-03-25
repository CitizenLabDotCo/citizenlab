import { memo } from 'react';
import { useProjectFolderModerators } from 'modules/project_folders/hooks';
import { IUserData } from 'services/users';

type GetProjectFolderModeratorsChildProps =
  | IUserData[]
  | Error
  | null
  | undefined;

type children = (
  renderProps: GetProjectFolderModeratorsChildProps
) => JSX.Element | null;

interface Props {
  children?: children;
  projectFolderId: string;
}

const GetProjectFolderModerators = memo<Props>(
  ({ projectFolderId, children }) => {
    const folderModerators = useProjectFolderModerators(projectFolderId);

    return (children as children)(folderModerators);
  }
);

export default GetProjectFolderModerators;

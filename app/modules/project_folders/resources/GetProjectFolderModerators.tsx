import React from 'react';
import { useProjectFolderModerators } from 'modules/project_folders/hooks';

export interface IGetProjectFolderModerators {
  moderators: IUsers;
}

type children = (
  renderProps: IGetProjectFolderModerators
) => JSX.Element | null;

export default function GetProjectFolderModerators<Props>(children) {
  const childProps = useProjectFolderModerators();

  return (children as children)(childProps);
}

import React, { memo } from 'react';
import clHistory from 'utils/cl-router/history';
import { Button } from '@citizenlab/cl2-component-library';
import useProjectFolderById from 'api/project_folders/useProjectFolderById';
import useLocalize from 'hooks/useLocalize';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  projectFolderId: string;
  className?: string;
}

const GoBackButton = memo(({ projectFolderId, className }: Props) => {
  const { data: projectFolder } = useProjectFolderById(projectFolderId);
  const localize = useLocalize();

  const onGoBack = (event: React.MouseEvent) => {
    event.preventDefault();

    if (!isNilOrError(projectFolder)) {
      clHistory.push(`/folders/${projectFolder.data.attributes.slug}`);
    }
  };

  if (!isNilOrError(projectFolder) && projectFolder.data) {
    return (
      <Button
        className={className}
        icon="arrow-left-circle"
        onClick={onGoBack}
        buttonStyle="text"
        iconSize="26px"
        padding="0"
        whiteSpace="wrap"
        textDecorationHover="underline"
      >
        {localize(projectFolder.data.attributes.title_multiloc)}
      </Button>
    );
  }

  return null;
});

export default GoBackButton;

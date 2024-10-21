import React, { memo } from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

interface Props {
  projectFolderId: string;
  className?: string;
}

const GoBackButton = memo(({ projectFolderId, className }: Props) => {
  const { data: projectFolder } = useProjectFolderById(projectFolderId);
  const { formatMessage } = useIntl();
  const onGoBack = (event: React.MouseEvent) => {
    event.preventDefault();

    if (!isNilOrError(projectFolder)) {
      clHistory.push(`/folders/${projectFolder.data.attributes.slug}`);
    }
  };

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
        {formatMessage(messages.backToFolder)}
      </Button>
    );
  }

  return null;
});

export default GoBackButton;

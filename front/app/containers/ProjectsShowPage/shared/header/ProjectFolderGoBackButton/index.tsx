import React, { memo } from 'react';
import clHistory from 'utils/cl-router/history';
import { Button } from '@citizenlab/cl2-component-library';
import useProjectFolder from 'hooks/useProjectFolder';
import useLocalize from 'hooks/useLocalize';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  projectFolderId: string;
  className?: string;
}

const GoBackButton = memo(({ projectFolderId, className }: Props) => {
  const projectFolder = useProjectFolder({ projectFolderId });
  const localize = useLocalize();

  const onGoBack = (event: React.MouseEvent) => {
    event.preventDefault();

    if (!isNilOrError(projectFolder)) {
      clHistory.push(`/folders/${projectFolder.attributes.slug}`);
    }
  };

  if (!isNilOrError(projectFolder)) {
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
        {localize(projectFolder.attributes.title_multiloc)}
      </Button>
    );
  }

  return null;
});

export default GoBackButton;

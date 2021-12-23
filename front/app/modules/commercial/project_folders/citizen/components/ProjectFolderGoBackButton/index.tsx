import React, { memo } from 'react';
import clHistory from 'utils/cl-router/history';
import { Button } from '@citizenlab/cl2-component-library';
import useProjectFolder from '../../../hooks/useProjectFolder';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  projectFolderId: string;
  className?: string;
}

const GoBackButton = memo(({ projectFolderId, className }: Props) => {
  const projectFolder = useProjectFolder({ projectFolderId });
  const locale = useLocale();
  const localize = useLocalize();

  const onGoBack = (event: React.MouseEvent) => {
    event.preventDefault();

    if (!isNilOrError(projectFolder)) {
      clHistory.push(`/folders/${projectFolder.attributes.slug}`);
    }
  };

  if (!isNilOrError(projectFolder) && !isNilOrError(locale)) {
    return (
      <Button
        className={className}
        locale={locale}
        icon="circle-arrow-left"
        onClick={onGoBack}
        buttonStyle="text"
        iconSize="26px"
        padding="0"
        textDecorationHover="underline"
      >
        {localize(projectFolder.attributes.title_multiloc)}
      </Button>
    );
  }

  return null;
});

export default GoBackButton;

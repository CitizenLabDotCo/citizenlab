import React, { memo } from 'react';
import clHistory from 'utils/cl-router/history';
import { Button } from '@citizenlab/cl2-component-library';
import useProject from 'hooks/useProject';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';
import { isNilOrError } from 'utils/helperUtils';
import eventEmitter from 'utils/eventEmitter';

interface Props {
  projectId: string;
  className?: string;
  insideModal: boolean;
}

const GoBackButton = memo(({ projectId, className, insideModal }: Props) => {
  const project = useProject({ projectId });
  const locale = useLocale();
  const localize = useLocalize();

  const onGoBack = (event: React.MouseEvent) => {
    event.preventDefault();

    if (insideModal) {
      eventEmitter.emit('closeIdeaModal');
    } else if (!isNilOrError(project)) {
      clHistory.push(`/projects/${project.attributes.slug}`);
    } else {
      clHistory.push('/');
    }
  };

  if (!isNilOrError(project) && !isNilOrError(locale)) {
    return (
      <Button
        className={className}
        id="e2e-idea-other-link"
        locale={locale}
        icon="circle-arrow-left"
        onClick={onGoBack}
        buttonStyle="text"
        iconSize="26px"
        padding="0"
        textDecorationHover="underline"
      >
        {localize(project.attributes.title_multiloc)}
      </Button>
    );
  }

  return null;
});

export default GoBackButton;

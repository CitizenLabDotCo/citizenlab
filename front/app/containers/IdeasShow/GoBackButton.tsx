import React, { memo } from 'react';
import clHistory from 'utils/cl-router/history';
import {
  Button,
  useWindowSize,
  viewportWidths,
  Box,
} from '@citizenlab/cl2-component-library';
import useProject from 'hooks/useProject';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';
import { isNilOrError } from 'utils/helperUtils';
import eventEmitter from 'utils/eventEmitter';
import { ScreenReaderOnly } from 'utils/a11y';

interface Props {
  projectId: string;
  className?: string;
  insideModal: boolean;
}

const GoBackButton = memo(({ projectId, className, insideModal }: Props) => {
  const project = useProject({ projectId });
  const locale = useLocale();
  const { windowWidth } = useWindowSize();
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

  const showButtonText = windowWidth <= viewportWidths.smallTablet;

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
        <Box display={showButtonText ? 'none' : 'block'} aria-hidden>
          {localize(project.attributes.title_multiloc)}
        </Box>
        <ScreenReaderOnly>
          {localize(project.attributes.title_multiloc)}
        </ScreenReaderOnly>
      </Button>
    );
  }

  return null;
});

export default GoBackButton;

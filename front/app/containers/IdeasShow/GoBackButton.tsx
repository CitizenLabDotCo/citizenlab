import React, { memo } from 'react';

// components
import { Button, useBreakpoint, Box } from '@citizenlab/cl2-component-library';

// hooks
import useProjectById from 'api/projects/useProjectById';
import useLocalize from 'hooks/useLocalize';

// utils
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import eventEmitter from 'utils/eventEmitter';
import { ScreenReaderOnly } from 'utils/a11y';

interface Props {
  projectId: string;
  className?: string;
  insideModal: boolean;
  deselectIdeaOnMap?: () => void;
}

const GoBackButton = memo(
  ({ projectId, className, insideModal, deselectIdeaOnMap }: Props) => {
    const { data: project } = useProjectById(projectId);
    const localize = useLocalize();
    const isSmallerThanPhone = useBreakpoint('phone');

    const projectExists = !!project;
    const deselectIdeaCallbackExists = !isNilOrError(deselectIdeaOnMap);

    const onGoBack = (event: React.MouseEvent) => {
      event.preventDefault();
      if (insideModal) {
        eventEmitter.emit('closeIdeaModal');
        return;
      }

      if (projectExists) {
        // if deselectIdeaOnMap exists, use it to return to map idea list
        if (deselectIdeaCallbackExists) {
          deselectIdeaOnMap();
          return;
        }
        // if deselectIdeaOnMap is not present, link back to main project
        clHistory.push(`/projects/${project.data.attributes.slug}`);
        return;
      }

      clHistory.push('/');
    };

    if (!isNilOrError(project)) {
      return (
        <Button
          className={className}
          id="e2e-idea-other-link"
          icon="arrow-left-circle"
          onClick={onGoBack}
          buttonStyle="text"
          iconSize="26px"
          padding="0"
          textDecorationHover="underline"
          whiteSpace="normal"
        >
          <Box
            as="span"
            display={isSmallerThanPhone ? 'none' : 'block'}
            aria-hidden
          >
            {localize(project.data.attributes.title_multiloc)}
          </Box>
          <ScreenReaderOnly>
            {localize(project.data.attributes.title_multiloc)}
          </ScreenReaderOnly>
        </Button>
      );
    }

    return null;
  }
);

export default GoBackButton;

import React, { memo } from 'react';

// components
import { Button, useBreakpoint, Box } from '@citizenlab/cl2-component-library';

// hooks
import useProject from 'hooks/useProject';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

// utils
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import eventEmitter from 'utils/eventEmitter';
import { ScreenReaderOnly } from 'utils/a11y';

// i18n
import messages from './messages';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

interface Props {
  projectId: string;
  className?: string;
  insideModal: boolean;
  deselectIdeaOnMap?: () => void;
}

const GoBackButton = memo(
  ({
    projectId,
    className,
    insideModal,
    deselectIdeaOnMap,
  }: Props & InjectedIntlProps) => {
    const project = useProject({ projectId });
    const locale = useLocale();
    const isSmallTablet = useBreakpoint('smallTablet');
    const localize = useLocalize();

    const projectExists = !isNilOrError(project);
    const deselectIdeaCallbackExists = !isNilOrError(deselectIdeaOnMap);

    // a "back to ideas" message when returning to the list of ideas (e.g. on map)
    // or a generic "go back message" when returning to the project main page
    const buttonMessage =
      projectExists && deselectIdeaCallbackExists
        ? messages.backToIdeas
        : messages.goBack;

    const onGoBack = (event: React.MouseEvent) => {
      event.preventDefault();

      if (insideModal) {
        eventEmitter.emit('closeIdeaModal');
      } else if (projectExists && deselectIdeaCallbackExists) {
        // if deselectIdeaOnMap is present, call it to switch view on the map overlay
        deselectIdeaOnMap();
      } else if (projectExists) {
        // if deselectIdeaOnMap is not present, link back to main project
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
          <Box as="span" display={isSmallTablet ? 'none' : 'block'} aria-hidden>
            <FormattedMessage {...buttonMessage} />
          </Box>
          <ScreenReaderOnly>
            {localize(project.attributes.title_multiloc)}
          </ScreenReaderOnly>
        </Button>
      );
    }

    return null;
  }
);

export default injectIntl(GoBackButton);

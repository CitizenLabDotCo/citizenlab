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
  deselectIdea?: () => void;
}

const GoBackButton = memo(
  ({
    projectId,
    className,
    insideModal,
    deselectIdea,
  }: Props & InjectedIntlProps) => {
    const project = useProject({ projectId });
    const locale = useLocale();
    const isSmallTablet = useBreakpoint('smallTablet');
    const localize = useLocalize();

    // if the deselectIdea callback is present, we should just call that and switch the view
    // if it's not present, we need to navigate back to the project page via link
    const shouldReturnToProjectPage: boolean =
      !isNilOrError(project) && isNilOrError(deselectIdea);
    const buttonMessage = shouldReturnToProjectPage
      ? messages.goBack
      : messages.backToIdeas;

    const onGoBack = (event: React.MouseEvent) => {
      event.preventDefault();

      if (insideModal) {
        eventEmitter.emit('closeIdeaModal');
      } else if (!isNilOrError(project) && !isNilOrError(deselectIdea)) {
        deselectIdea();
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
          <Box as="span" display={isSmallTablet ? 'none' : 'block'} aria-hidden>
            <FormattedMessage {...buttonMessage} /> go back button
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

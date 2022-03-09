import React, { memo } from 'react';
import clHistory from 'utils/cl-router/history';
import { Button, useBreakpoint, Box } from '@citizenlab/cl2-component-library';

// hooks
import useProject from 'hooks/useProject';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

// utils
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

    const onGoBack = (event: React.MouseEvent) => {
      event.preventDefault();
      if (insideModal) {
        eventEmitter.emit('closeIdeaModal');
      } else if (!isNilOrError(project) && deselectIdea) {
        deselectIdea();
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
            <FormattedMessage {...messages.backToIdeasList} />
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

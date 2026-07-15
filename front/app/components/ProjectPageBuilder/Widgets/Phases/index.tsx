import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { UserComponent } from '@craftjs/core';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import InputFeedSection from '../InputFeed';
import messages from '../messages';
import {
  SectionBackgroundChoice,
  useDefaultSectionBackground,
} from '../SectionBackground';
import SectionBackgroundSetting from '../SectionBackgroundSetting';
import TimelineSection from '../Timeline';
import useWidgetProjectId from '../useWidgetProjectId';

// Lets the docked CTA bar find phases sections on the page (see CTABar).
export const PHASES_WIDGET_SELECTOR = '[data-project-page-phases]';

type Props = {
  sectionBackground?: SectionBackgroundChoice;
};

const PhasesWidget: UserComponent<Props> = ({ sectionBackground }) => {
  const defaultBackground = useDefaultSectionBackground();
  const colored = (sectionBackground ?? defaultBackground) === 'colored';

  return (
    <div data-project-page-phases="">
      <TimelineSection colored={colored} />
      <InputFeedSection colored={colored} />
    </div>
  );
};

const PhasesSettings = () => {
  const projectId = useWidgetProjectId();

  const projectEditorLink = projectId ? (
    <Link
      to="/admin/projects/$projectId/phases"
      params={{ projectId }}
      target="_blank"
    >
      <FormattedMessage {...messages.projectEditorLinkText} />
    </Link>
  ) : (
    <FormattedMessage {...messages.projectEditorLinkText} />
  );

  return (
    <Box my="20px" display="flex" flexDirection="column" gap="12px">
      <SectionBackgroundSetting />
      <Text m="0px" color="textSecondary" fontSize="s">
        <FormattedMessage
          {...messages.timelineManagedNote}
          values={{ projectEditorLink }}
        />
      </Text>
      <Text m="0px" color="textSecondary" fontSize="s">
        <FormattedMessage
          {...messages.inputFeedManagedNote}
          values={{ projectEditorLink }}
        />
      </Text>
    </Box>
  );
};

PhasesWidget.craft = {
  related: {
    settings: PhasesSettings,
  },
  custom: {
    title: messages.phasesWidgetTitle,
    noPointerEvents: true,
  },
};

export default PhasesWidget;

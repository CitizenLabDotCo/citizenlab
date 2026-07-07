import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { UserComponent } from '@craftjs/core';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import InputFeedSection from '../InputFeed';
import messages from '../messages';
import TimelineSection from '../Timeline';
import useWidgetProjectId from '../useWidgetProjectId';

// The phases module: the timeline (heading + navigation + tabs) with the
// active phase's participation content directly beneath it. They are one
// widget because the timeline's arrows and tabs drive what the content shows —
// splitting them would let admins place them apart and break that correlation.
const PhasesWidget: UserComponent = () => (
  <>
    <TimelineSection />
    <InputFeedSection />
  </>
);

// Nothing is edited inline; the settings panel points admins to the project
// editor, where phases and their participation methods are configured.
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
  rules: {
    canDrag: () => false,
  },
  custom: {
    title: messages.phasesWidgetTitle,
    locked: true,
    noPointerEvents: true,
  },
};

export default PhasesWidget;

import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useWidgetProjectId from 'components/admin/ContentBuilder/useWidgetProjectId';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from '../messages';
import SectionBackgroundSetting from '../SectionBackgroundSetting';

const EventsSettings = () => {
  const projectId = useWidgetProjectId();

  return (
    <Box my="20px">
      <SectionBackgroundSetting defaultValue="white" />
      <Text color="textSecondary" fontSize="s">
        <FormattedMessage
          {...messages.eventsManagedNote}
          values={{
            eventsLink: projectId ? (
              <Link
                to="/admin/projects/$projectId/events"
                params={{ projectId }}
                target="_blank"
              >
                <FormattedMessage {...messages.eventsLinkText} />
              </Link>
            ) : (
              <FormattedMessage {...messages.eventsLinkText} />
            ),
          }}
        />
      </Text>
    </Box>
  );
};

export default EventsSettings;

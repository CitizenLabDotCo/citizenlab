import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import { format, isSameDay, isThisYear } from 'date-fns';

import useEvents from 'api/events/useEvents';

import useLocalize from 'hooks/useLocalize';

import {
  Connector,
  PhaseDot,
  Row,
  formatDateRange,
} from 'containers/Admin/projects/project/projectPage/phaseRowUtils';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { useParams } from 'utils/router';

import messages from './messages';

// Events often span several years, so the year is shown unless it's this one.
const formatDay = (date: Date) =>
  format(date, isThisYear(date) ? 'd MMM' : 'd MMM yyyy');

const formatEventDate = (startAt: string, endAt: string) => {
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (isSameDay(start, end)) return formatDay(start);
  if (isThisYear(start) && isThisYear(end)) {
    return formatDateRange(startAt, endAt);
  }
  return `${formatDay(start)} – ${formatDay(end)}`;
};

interface Props {
  projectId: string;
}

const TimelineEvents = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { id: selectedEventId } = useParams({ strict: false });
  const { data: events } = useEvents({
    projectIds: [projectId],
    pageSize: 1000,
    sort: '-start_at',
  });

  if (!events) return null;

  return (
    <Box p="12px" borderTop={`1px solid ${colors.grey200}`}>
      <Link to="/admin/projects/$projectId/events" params={{ projectId }}>
        <Text
          m="0 0 8px 0"
          px="10px"
          fontSize="s"
          fontWeight="bold"
          color="textPrimary"
        >
          {formatMessage(messages.eventsSection)}
        </Text>
      </Link>

      <Box display="flex" flexDirection="column">
        {events.data.map((event, index) => {
          const { start_at, end_at, title_multiloc } = event.attributes;
          const status = pastPresentOrFuture([start_at, end_at]);

          return (
            <Link
              key={event.id}
              to="/admin/projects/$projectId/events/$id"
              params={{ projectId, id: event.id }}
            >
              <Row selected={event.id === selectedEventId}>
                {events.data.length > 1 && (
                  <Connector
                    isFirst={index === 0}
                    isLast={index === events.data.length - 1}
                  />
                )}
                <PhaseDot status={status} />
                <Box flexGrow={1} pb="4px">
                  <Text
                    as="span"
                    m="0"
                    fontSize="s"
                    color={status === 'past' ? 'textSecondary' : 'textPrimary'}
                  >
                    {localize(title_multiloc)}
                  </Text>
                  <Text m="2px 0 0 0" fontSize="xs" color="textSecondary">
                    {formatEventDate(start_at, end_at)}
                  </Text>
                </Box>
              </Row>
            </Link>
          );
        })}
      </Box>

      <Box display="flex" mt="4px">
        <ButtonWithLink
          to="/admin/projects/$projectId/events/new"
          params={{ projectId }}
          buttonStyle="text"
          size="s"
          icon="plus"
          width="auto"
        >
          {formatMessage(messages.newEvent)}
        </ButtonWithLink>
      </Box>
    </Box>
  );
};

export default TimelineEvents;

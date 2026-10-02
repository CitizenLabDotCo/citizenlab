import React from 'react';

import {
  Box,
  Icon,
  Text,
  Title,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { format, isSameDay, isThisYear } from 'date-fns';

import useEvents from 'api/events/useEvents';

import useLocalize from 'hooks/useLocalize';

import {
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
    <Box>
      <Box px="8px" mb="12px">
        <Link to="/admin/projects/$projectId/events" params={{ projectId }}>
          <Title variant="h4" fontSize="s" fontWeight="semi-bold" m="0">
            {formatMessage(messages.eventsSection)}
          </Title>
        </Link>
      </Box>

      <Box display="flex" flexDirection="column">
        {events.data.map((event) => {
          const { start_at, end_at, title_multiloc } = event.attributes;
          const status = pastPresentOrFuture([start_at, end_at]);

          return (
            <Link
              key={event.id}
              to="/admin/projects/$projectId/events/$id"
              params={{ projectId, id: event.id }}
            >
              <Row selected={event.id === selectedEventId}>
                <Box flexGrow={1} pb="4px">
                  <Box display="flex" alignItems="center" gap="10px">
                    <Icon
                      name="calendar"
                      width="16px"
                      height="16px"
                      fill={
                        status === 'past' ? colors.coolGrey500 : colors.primary
                      }
                    />
                    <Text
                      as="span"
                      m="0"
                      fontSize="s"
                      color={
                        status === 'past' ? 'textSecondary' : 'textPrimary'
                      }
                    >
                      {localize(title_multiloc)}
                    </Text>
                  </Box>
                  {/* 26px = 16px icon + 10px gap, so the date lines up with the title */}
                  <Text m="2px 0 0 26px" fontSize="xs" color="textSecondary">
                    {formatEventDate(start_at, end_at)}
                  </Text>
                </Box>
              </Row>
            </Link>
          );
        })}
      </Box>

      <Box display="flex">
        <ButtonWithLink
          to="/admin/projects/$projectId/events/new"
          params={{ projectId }}
          buttonStyle="bo-text"
          height="32px"
          padding="0 8px"
          fontSize={`${fontSizes.xs}px`}
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

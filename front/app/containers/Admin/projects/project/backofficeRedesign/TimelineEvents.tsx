import React from 'react';

import { Box, Tooltip, bo } from '@citizenlab/cl2-component-library';
import { Locale, format, isSameDay, isThisYear } from 'date-fns';

import useEvents from 'api/events/useEvents';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import {
  EventRow,
  STATUS_LABELS,
  SectionLabel,
  StepMeta,
  StepTitle,
  formatDateRange,
} from 'containers/Admin/projects/project/projectPage/phaseRowUtils';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { useParams } from 'utils/router';

import messages from './messages';

// Events often span several years, so the year is shown unless it's this one.
const formatDay = (date: Date, locale: Locale) =>
  format(date, isThisYear(date) ? 'd MMM' : 'd MMM yyyy', { locale });

const formatEventDate = (startAt: string, endAt: string, locale: Locale) => {
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (isSameDay(start, end)) return formatDay(start, locale);
  if (isThisYear(start) && isThisYear(end)) {
    return formatDateRange(startAt, endAt, locale);
  }
  return `${formatDay(start, locale)} – ${formatDay(end, locale)}`;
};

interface Props {
  projectId: string;
}

const TimelineEvents = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const dateLocale = getLocale(useLocale());
  const { id: selectedEventId } = useParams({ strict: false });
  const { data: events } = useEvents({
    projectIds: [projectId],
    pageSize: 1000,
    sort: '-start_at',
  });

  if (!events) return null;

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        pl="10px"
        mb="4px"
      >
        <Box as="h4" m="0">
          <SectionLabel as="span">
            {formatMessage(messages.eventsSection)}
          </SectionLabel>
        </Box>
        <Tooltip
          content={formatMessage(messages.newEvent)}
          theme="dark"
          placement="bottom"
          appendTo={() => document.body}
        >
          <ButtonWithLink
            to="/admin/projects/$projectId/events/new"
            params={{ projectId }}
            buttonStyle="bo-text"
            icon="plus"
            width="32px"
            height="32px"
            padding="0"
            ariaLabel={formatMessage(messages.newEvent)}
          />
        </Tooltip>
      </Box>

      {/* Inset 2px so the text lines up with the section label. */}
      <Box display="flex" flexDirection="column" mx="2px">
        {events.data.map((event) => {
          const { start_at, end_at, title_multiloc } = event.attributes;
          const status = pastPresentOrFuture([start_at, end_at]);

          return (
            <Link
              key={event.id}
              to="/admin/projects/$projectId/events/$id"
              params={{ projectId, id: event.id }}
            >
              <EventRow selected={event.id === selectedEventId}>
                <StepTitle style={{ color: bo.colors.textHeadingStrong }}>
                  {localize(title_multiloc)}
                </StepTitle>
                <StepMeta m="0" color="textSecondary">
                  {formatMessage(STATUS_LABELS[status])} ·{' '}
                  {formatEventDate(start_at, end_at, dateLocale)}
                </StepMeta>
              </EventRow>
            </Link>
          );
        })}
      </Box>
    </Box>
  );
};

export default TimelineEvents;

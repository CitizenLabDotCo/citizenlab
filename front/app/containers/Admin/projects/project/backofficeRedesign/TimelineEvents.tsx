import React from 'react';

import { Locale, format, isSameDay, isThisYear } from 'date-fns';
import { router } from 'routes';

import useEvents from 'api/events/useEvents';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import {
  STATUS_LABELS,
  formatDateRange,
} from 'containers/Admin/projects/project/projectPage/phaseRowUtils';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';

import IconButton from 'design-system/IconButton';
import PanelGroupHeader from 'design-system/PanelGroupHeader';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { useParams } from 'utils/router';

import messages from './messages';
import styles from './TimelineEvents.module.css';

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
  const locale = useLocale();
  const dateLocale = getLocale(locale);
  const { id: selectedEventId } = useParams({ strict: false });
  const { data: events } = useEvents({
    projectIds: [projectId],
    pageSize: 1000,
    sort: '-start_at',
  });

  if (!events) return null;

  return (
    <div>
      <div className={styles.header}>
        <PanelGroupHeader
          context="rail"
          level={4}
          label={formatMessage(messages.eventsSection)}
          action={
            <IconButton
              icon="plus-16"
              aria-label={formatMessage(messages.newEvent)}
              onPress={() =>
                router.navigate({
                  to: '/$locale/admin/projects/$projectId/events/new',
                  params: { locale, projectId },
                })
              }
            />
          }
        />
      </div>

      <div className={styles.events}>
        {events.data.map((event) => {
          const { start_at, end_at, title_multiloc } = event.attributes;
          const status = pastPresentOrFuture([start_at, end_at]);

          return (
            <Link
              key={event.id}
              to="/admin/projects/$projectId/events/$id"
              params={{ projectId, id: event.id }}
              className={styles.eventRow}
              data-selected={event.id === selectedEventId || undefined}
            >
              <span className={styles.eventTitle}>
                {localize(title_multiloc)}
              </span>
              <span className={styles.eventMeta}>
                {formatMessage(STATUS_LABELS[status])} ·{' '}
                {formatEventDate(start_at, end_at, dateLocale)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineEvents;

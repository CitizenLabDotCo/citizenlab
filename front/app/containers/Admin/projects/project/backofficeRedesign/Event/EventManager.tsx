import React, { useState } from 'react';

import saveAs from 'file-saver';

import Banner from 'design-system/Banner';
import Disclosure from 'design-system/Disclosure';
import Link from 'design-system/Link';
import Menu, { MenuItem } from 'design-system/Menu';
import Spinner from 'design-system/Spinner';
import StatRow from 'design-system/StatRow';
import Text from 'design-system/Text';

import { AttendanceSort, InputParameters } from 'api/event_attendance/types';
import useEventAttendances from 'api/event_attendance/useEventAttendances';
import { IEventData } from 'api/events/types';
import { exportEventAttendees } from 'api/events/util';

import useLocalize from 'hooks/useLocalize';

import eventMessages from 'components/admin/EventAttendance/messages';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { requestBlob } from 'utils/requestBlob';

import FilterMenu from '../InputManager/FilterMenu';
import FilterChips from '../InputManager/FilterMenu/FilterChips';
import { FilterCategory } from '../InputManager/FilterMenu/useFilterCategories';
import SearchToggle from '../InputManager/SearchToggle';
import EmptyState from '../Phase/EmptyState';
import ListLoadError from '../Phase/ListLoadError';
import ManageLayout from '../Phase/ManageLayout';

import styles from './EventManager.module.css';
import EventRegistrantTable from './EventRegistrantTable';
import messages from './messages';
import 'design-system/tokens.css';

interface Props {
  event?: IEventData;
}

const EventManager = ({ event }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>();
  const [sort, setSort] = useState<AttendanceSort>('-created_at');
  const [registered, setRegistered] = useState<InputParameters['registered']>();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);
  const {
    data: attendances,
    isLoading,
    isError,
    isPlaceholderData,
    refetch,
  } = useEventAttendances(event?.id, {
    search,
    sort,
    registered,
    'page[number]': page,
    'page[size]': 20,
  });
  const total = attendances?.meta.total ?? 0;
  const unfilteredTotal = attendances?.meta.unfiltered_total ?? 0;
  const hasFilters = !!search || !!registered;

  const clearFilters = () => {
    setSearch(undefined);
    setRegistered(undefined);
    setPage(1);
  };
  const category: FilterCategory = {
    key: 'signedUp',
    label: formatMessage(messages.registered),
    icon: 'calendar-16',
    options: [
      { value: 'this_week', label: formatMessage(messages.thisWeek) },
      { value: 'earlier', label: formatMessage(messages.earlier) },
    ],
    selected: registered ? [registered] : [],
    multiple: false,
    isActive: !!registered,
    toggle: (value) => {
      if (value !== 'this_week' && value !== 'earlier') return;
      setRegistered(registered === value ? undefined : value);
      setPage(1);
    },
    clear: () => {
      setRegistered(undefined);
      setPage(1);
    },
  };
  const exportRegistrants = async () => {
    if (!event) return;
    setExporting(true);
    setExportError(false);
    try {
      const blob = await requestBlob(
        exportEventAttendees(event.id),
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      saveAs(
        blob,
        `registrants-${localize(event.attributes.title_multiloc)}.xlsx`
      );
    } catch {
      setExportError(true);
    } finally {
      setExporting(false);
    }
  };

  return (
    <ManageLayout
      side={
        <div className={styles.side}>
          {event?.attributes.maximum_attendees != null && attendances && (
            <div className={styles.stats}>
              <StatRow
                label={formatMessage(messages.spotsLeft)}
                value={
                  <>
                    {Math.max(
                      0,
                      event.attributes.maximum_attendees - unfilteredTotal
                    )}{' '}
                    <Text as="span" variant="small" tone="secondary">
                      {formatMessage(messages.spotsTotal, {
                        total: event.attributes.maximum_attendees,
                      })}
                    </Text>
                  </>
                }
              />
            </div>
          )}
          {event && unfilteredTotal > 0 && (
            <Disclosure
              header="menu"
              title={formatMessage(messages.exportRegistrants)}
              isDisabled={exporting}
              menu={
                <Menu aria-label={formatMessage(messages.exportRegistrants)}>
                  <MenuItem icon="download-16" onAction={exportRegistrants}>
                    {formatMessage(messages.exportAllRegistrants)}
                  </MenuItem>
                </Menu>
              }
            />
          )}
          {exportError && (
            <Text variant="small" tone="danger" role="alert">
              {formatMessage(messages.registrantsExportError)}
            </Text>
          )}
          <div role="note">
            <Banner tone="neutral">
              <FormattedMessage
                {...eventMessages.eventAttendanceExportText}
                values={{
                  userTabLink: (
                    <Link href="/admin/users">
                      {formatMessage(eventMessages.usersTabLinkText)}
                    </Link>
                  ),
                  supportArticleLink: (
                    <Link
                      href={formatMessage(
                        eventMessages.attendanceSupportArticleLink2
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {formatMessage(
                        eventMessages.attendanceSupportArticleLinkText
                      )}
                    </Link>
                  ),
                }}
              />
            </Banner>
          </div>
          {event?.attributes.using_url && (
            <Text variant="small" tone="secondary">
              {formatMessage(messages.externalRegistrations)}
            </Text>
          )}
        </div>
      }
    >
      <div className={styles.toolbar}>
        <Text variant="title" tone="primary">
          {(!event || attendances) &&
            formatMessage(messages.registrantCount, { count: total })}
        </Text>
        <div className={styles.display}>
          <SearchToggle
            label={formatMessage(messages.searchRegistrants)}
            searchTerm={search}
            onChange={(value) => {
              setSearch(value || undefined);
              setPage(1);
            }}
            resultCount={total}
          />
          <FilterMenu categories={[category]} onClearAll={clearFilters} />
        </div>
      </div>
      <FilterChips categories={[category]} onClearAll={clearFilters} />
      {isError ? (
        <ListLoadError
          message={formatMessage(messages.registrantsLoadError)}
          retryLabel={formatMessage(messages.retryRegistrants)}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className={styles.loading}>
          <Spinner />
        </div>
      ) : !attendances?.data.length ? (
        <EmptyState
          size="large"
          title={formatMessage(
            hasFilters ? messages.noMatchingRegistrants : messages.noRegistrants
          )}
          description={
            hasFilters
              ? undefined
              : formatMessage(messages.noRegistrantsDescription)
          }
        />
      ) : (
        <div className={isPlaceholderData ? styles.dimmed : undefined}>
          <EventRegistrantTable
            attendances={attendances}
            sort={sort}
            onSort={(value) => {
              setSort(value);
              setPage(1);
            }}
            page={page}
            onPageChange={setPage}
          />
        </div>
      )}
    </ManageLayout>
  );
};

export default EventManager;

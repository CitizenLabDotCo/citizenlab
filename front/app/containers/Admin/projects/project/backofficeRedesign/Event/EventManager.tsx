import React, { useState } from 'react';

import {
  Box,
  Button,
  Icon,
  Spinner,
  Text,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';
import saveAs from 'file-saver';

import { AttendanceSort, InputParameters } from 'api/event_attendance/types';
import useEventAttendances from 'api/event_attendance/useEventAttendances';
import { IEventData } from 'api/events/types';
import { exportEventAttendees } from 'api/events/util';

import useLocalize from 'hooks/useLocalize';

import eventMessages from 'components/admin/EventAttendance/messages';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { requestBlob } from 'utils/requestBlob';

import FilterMenu from '../InputManager/FilterMenu';
import FilterChips from '../InputManager/FilterMenu/FilterChips';
import { FilterCategory } from '../InputManager/FilterMenu/useFilterCategories';
import SearchToggle from '../InputManager/SearchToggle';
import EmptyState from '../Phase/EmptyState';
import ManageLayout from '../Phase/ManageLayout';

import EventRegistrantTable from './EventRegistrantTable';
import messages from './messages';

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
    icon: 'calendar',
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
        <Box
          flexGrow={1}
          p="24px"
          background={colors.white}
          borderRadius={bo.panelBorderRadius}
          display="flex"
          flexDirection="column"
          gap="16px"
        >
          {event?.attributes.maximum_attendees != null && attendances && (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap="8px"
            >
              <Text variant="boLabel" m="0">
                {formatMessage(messages.spotsLeft)}
              </Text>
              <Text variant="boLabel" m="0">
                {formatMessage(messages.remainingSpots, {
                  remaining: Math.max(
                    0,
                    event.attributes.maximum_attendees - unfilteredTotal
                  ),
                  total: event.attributes.maximum_attendees,
                })}
              </Text>
            </Box>
          )}
          {event && unfilteredTotal > 0 && (
            <Button
              buttonStyle="bo-secondary"
              type="button"
              width="100%"
              justify="space-between"
              icon="download"
              iconPos="right"
              processing={exporting}
              onClick={exportRegistrants}
            >
              {formatMessage(messages.exportRegistrants)}
            </Button>
          )}
          {exportError && (
            <Text variant="boHelper" m="0" color="red600" role="alert">
              {formatMessage(messages.registrantsExportError)}
            </Text>
          )}
          <Box
            p="16px"
            background={colors.grey100}
            borderRadius={bo.borderRadius}
            role="note"
            display="flex"
            gap="8px"
          >
            <Box flex="0 0 16px" mt="2px">
              <Icon
                name="info-outline"
                width="16px"
                fill={colors.coolGrey500}
              />
            </Box>
            <Text variant="boHelper" m="0">
              <FormattedMessage
                {...eventMessages.eventAttendanceExportText}
                values={{
                  userTabLink: (
                    <Link to="/admin/users">
                      {formatMessage(eventMessages.usersTabLinkText)}
                    </Link>
                  ),
                  supportArticleLink: (
                    <a
                      href={formatMessage(
                        eventMessages.attendanceSupportArticleLink2
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {formatMessage(
                        eventMessages.attendanceSupportArticleLinkText
                      )}
                    </a>
                  ),
                }}
              />
            </Text>
          </Box>
          {event?.attributes.using_url && (
            <Text variant="boHelper" m="0">
              {formatMessage(messages.externalRegistrations)}
            </Text>
          )}
        </Box>
      }
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap="12px"
        minHeight="40px"
        mb="12px"
      >
        <Text variant="boSection" fontSize="l" m="0">
          {(!event || attendances) &&
            formatMessage(messages.registrantCount, { count: total })}
        </Text>
        <Box display="flex" alignItems="center" gap="8px">
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
        </Box>
      </Box>
      <FilterChips categories={[category]} onClearAll={clearFilters} />
      {isError ? (
        <Box role="alert">
          <Text variant="boHelper">
            {formatMessage(messages.registrantsLoadError)}
          </Text>
          <Button buttonStyle="bo-secondary" onClick={() => refetch()}>
            {formatMessage(messages.retryRegistrants)}
          </Button>
        </Box>
      ) : isLoading ? (
        <Box display="flex" justifyContent="center" py="80px">
          <Spinner />
        </Box>
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
        <Box opacity={isPlaceholderData ? 0.4 : 1}>
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
        </Box>
      )}
    </ManageLayout>
  );
};

export default EventManager;

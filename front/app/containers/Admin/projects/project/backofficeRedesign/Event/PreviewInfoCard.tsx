import React from 'react';

import {
  Box,
  Button,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { format, isSameDay } from 'date-fns';
import moment from 'moment-timezone';
import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { toPlatformWallClock } from 'containers/Admin/projects/_shared/events/useEventDateTimes';

import calendarMessages from 'components/AddEventToCalendarButton/messages';
import { getLocale } from 'components/admin/DatePickers/_shared/locales';
import eventCardMessages from 'components/EventCards/messages';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import PreviewDateBlock from './PreviewDateBlock';
import PreviewInfoRow from './PreviewInfoRow';

interface Props {
  startAt: string;
  endAt: string;
  attendeesCount: number;
  address1?: string | null;
  address2Multiloc?: Multiloc;
  hasLocationPoint: boolean;
  onlineLink?: string | null;
  buttonText: string;
  showButtonIcon: boolean;
}

// Mirrors the information card of the event page on mobile.
const PreviewInfoCard = ({
  startAt,
  endAt,
  attendeesCount,
  address1,
  address2Multiloc,
  hasLocationPoint,
  onlineLink,
  buttonText,
  showButtonIcon,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const theme = useTheme();
  const locale = useLocale();
  const dateLocale = getLocale(locale);
  const { data: appConfig } = useAppConfiguration();
  const platformTimezone =
    appConfig?.data.attributes.settings.core.timezone ?? '';
  // Shows the dates as the platform's wall clock, like the event page does.
  const startAtDate = toPlatformWallClock(startAt, platformTimezone);
  const endAtDate = toPlatformWallClock(endAt, platformTimezone);
  const timezoneLabel = platformTimezone
    ? moment.tz(startAt, platformTimezone).format('z')
    : '';

  const time = (date: Date) => format(date, 'p', { locale: dateLocale });
  const longDate = (date: Date) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date);
  const withTimezone = (text: string) =>
    timezoneLabel ? `${text} ${timezoneLabel}` : text;
  const dateBlock = (date: Date) => ({
    day: format(date, 'dd', { locale: dateLocale }),
    month: format(date, 'MMM', { locale: dateLocale }),
  });

  const multiDay = !isSameDay(startAtDate, endAtDate);
  const isPast = new Date(endAt) < new Date();
  const dateLine = multiDay
    ? withTimezone(
        `${longDate(startAtDate)} ${time(startAtDate)} - ${longDate(
          endAtDate
        )} ${time(endAtDate)}`
      )
    : withTimezone(
        `${longDate(startAtDate)} • ${time(startAtDate)} - ${time(endAtDate)}`
      );

  const commaIndex = address1?.indexOf(',') ?? -1;
  const locationName =
    address1 && hasLocationPoint && commaIndex > 0
      ? address1.slice(0, commaIndex)
      : address1;
  const addressDetails = localize(address2Multiloc);

  return (
    <Box
      p="20px"
      borderRadius={stylingConsts.borderRadius}
      background={colors.background}
    >
      <Box p="8px" background={colors.white}>
        <Box
          display="flex"
          flexDirection="column"
          gap="16px"
          px="20px"
          py="12px"
        >
          <Box display="flex" justifyContent="center">
            <PreviewDateBlock
              {...dateBlock(startAtDate)}
              time={
                multiDay
                  ? withTimezone(time(startAtDate))
                  : withTimezone(`${time(startAtDate)} - ${time(endAtDate)}`)
              }
            />
            {multiDay && (
              <>
                <Box mx="16px" my="auto">
                  <Text m="0" fontWeight="bold" fontSize="xxl">
                    {theme.isRtl ? '←' : '→'}
                  </Text>
                </Box>
                <PreviewDateBlock
                  {...dateBlock(endAtDate)}
                  time={withTimezone(time(endAtDate))}
                />
              </>
            )}
          </Box>

          {!isPast && (
            <Box mt="12px" pointerEvents="none">
              <Button
                bgColor={theme.colors.tenantPrimary}
                width="100%"
                icon={showButtonIcon ? 'plus-circle' : undefined}
                iconSize="20px"
                tabIndex={-1}
              >
                {buttonText}
              </Button>
            </Box>
          )}

          {attendeesCount > 0 && (
            <PreviewInfoRow icon="user">
              <Text my="4px" fontSize="s" color="coolGrey600">
                {formatMessage(eventCardMessages.registrantCount, {
                  attendeesCount,
                })}
              </Text>
            </PreviewInfoRow>
          )}
          <Box borderBottom={`1px solid ${colors.divider}`} />

          <Box pb="16px" borderBottom={`1px solid ${colors.divider}`}>
            <PreviewInfoRow icon="position" empty={!address1}>
              <Text
                my="4px"
                fontSize="s"
                color={address1 ? 'coolGrey600' : 'coolGrey300'}
                textDecoration={hasLocationPoint ? 'underline' : undefined}
              >
                {locationName || formatMessage(messages.previewLocation)}
              </Text>
              {address1 && addressDetails && (
                <Text my="4px" fontSize="s" color="coolGrey600">
                  {addressDetails}
                </Text>
              )}
            </PreviewInfoRow>
          </Box>

          {onlineLink && (
            <Box pb="16px" borderBottom={`1px solid ${colors.divider}`}>
              <PreviewInfoRow icon="link">
                <Text
                  my="4px"
                  fontSize="s"
                  color="coolGrey600"
                  textDecoration="underline"
                >
                  {formatMessage(messages.linkToOnlineEvent)}
                </Text>
              </PreviewInfoRow>
            </Box>
          )}

          <PreviewInfoRow icon="calendar">
            <Text my="4px" fontSize="s" color="coolGrey600">
              {dateLine}
            </Text>
            <Text
              m="0"
              fontSize="s"
              color="tenantPrimary"
              textDecoration="underline"
            >
              {formatMessage(calendarMessages.addToCalendar)}
            </Text>
          </PreviewInfoRow>
        </Box>
      </Box>
    </Box>
  );
};

export default PreviewInfoCard;

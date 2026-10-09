import React, { ReactNode } from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { format, isSameDay } from 'date-fns';
import { Multiloc } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { toPlatformWallClock } from 'containers/Admin/projects/project/events/useEventDateTimes';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';
import eventCardMessages from 'components/EventCards/messages';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface RowProps {
  icon: IconNames;
  empty?: boolean;
  children: ReactNode;
}

const Row = ({ icon, empty = false, children }: RowProps) => (
  <Box
    display="flex"
    gap="10px"
    alignItems="flex-start"
    pt="10px"
    borderTop={`1px solid ${colors.divider}`}
  >
    <Icon
      name={icon}
      width="16px"
      height="16px"
      fill={empty ? colors.coolGrey300 : colors.coolGrey600}
    />
    <Text m="0" fontSize="s" color={empty ? 'coolGrey300' : 'coolGrey600'}>
      {children}
    </Text>
  </Box>
);

interface Props {
  startAt: string;
  endAt: string;
  attendeesCount: number;
  address1?: string | null;
  address2Multiloc?: Multiloc;
  onlineLink?: string | null;
}

const PreviewInfoCard = ({
  startAt,
  endAt,
  attendeesCount,
  address1,
  address2Multiloc,
  onlineLink,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const dateLocale = getLocale(useLocale());
  const { data: appConfig } = useAppConfiguration();
  const platformTimezone =
    appConfig?.data.attributes.settings.core.timezone ?? '';
  // Shows the dates as the platform's wall clock, like the event page does.
  const startAtDate = toPlatformWallClock(startAt, platformTimezone);
  const endAtDate = toPlatformWallClock(endAt, platformTimezone);

  const time = (date: Date) => format(date, 'p', { locale: dateLocale });
  const sameDay = isSameDay(startAtDate, endAtDate);
  const timeRange = sameDay
    ? `${time(startAtDate)} - ${time(endAtDate)}`
    : `${time(startAtDate)} - ${format(endAtDate, 'PP p', {
        locale: dateLocale,
      })}`;
  const addressDetails = localize(address2Multiloc);

  return (
    <Box p="16px" borderRadius="4px" background={colors.background}>
      <Box
        display="flex"
        flexDirection="column"
        gap="10px"
        p="16px"
        background={colors.white}
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <Text m="0" fontSize="xxxl" fontWeight="bold" color="textPrimary">
            {format(startAtDate, 'd', { locale: dateLocale })}
          </Text>
          <Text m="0" fontSize="s" color="coolGrey600">
            {format(startAtDate, 'MMM', { locale: dateLocale })}
          </Text>
          <Text m="4px 0 0" fontWeight="semi-bold" color="textPrimary">
            {timeRange}
          </Text>
        </Box>
        <Row icon="user">
          {formatMessage(eventCardMessages.registrantCount, {
            attendeesCount,
          })}
        </Row>
        {onlineLink && (
          <Row icon="globe">{formatMessage(messages.onlineEvent)}</Row>
        )}
        <Row icon="position" empty={!address1}>
          {address1 || formatMessage(messages.addLocation)}
          {address1 && addressDetails && (
            <Box as="span" display="block">
              {addressDetails}
            </Box>
          )}
        </Row>
        <Row icon="calendar">
          {format(startAtDate, 'PPP', { locale: dateLocale })} · {timeRange}
        </Row>
      </Box>
    </Box>
  );
};

export default PreviewInfoCard;

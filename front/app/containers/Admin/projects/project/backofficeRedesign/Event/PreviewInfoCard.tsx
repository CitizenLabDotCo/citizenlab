import React from 'react';

// The preview copies the citizen event page and keeps its button icon.
import { format, isSameDay } from 'date-fns';
import moment from 'moment-timezone';
import { Multiloc } from 'typings';

import { Icon } from '@citizenlab/cl2-component-library';

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
import styles from './PreviewInfoCard.module.css';
import PreviewInfoRow from './PreviewInfoRow';
import 'design-system/tokens.css';

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
  const locale = useLocale();
  // The same rule the app uses to pick its right-to-left theme.
  const isRtl = locale.startsWith('ar');
  const dateLocale = getLocale(locale);
  const { data: appConfig } = useAppConfiguration();
  const platformTimezone =
    appConfig?.data.attributes.settings.core.timezone ?? '';
  const tenantColor =
    appConfig?.data.attributes.settings.core.color_main ?? undefined;
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
    <div className={styles.card}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.dates}>
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
                <div className={styles.arrow}>
                  <p className={styles.arrowText}>{isRtl ? '←' : '→'}</p>
                </div>
                <PreviewDateBlock
                  {...dateBlock(endAtDate)}
                  time={withTimezone(time(endAtDate))}
                />
              </>
            )}
          </div>

          {!isPast && (
            <div
              className={styles.button}
              style={{ backgroundColor: tenantColor }}
            >
              {showButtonIcon && (
                <Icon
                  name="plus-circle"
                  width="20px"
                  height="20px"
                  fill="currentColor"
                />
              )}
              <span>{buttonText}</span>
            </div>
          )}

          {attendeesCount > 0 && (
            <PreviewInfoRow icon="user">
              <p className={styles.infoText}>
                {formatMessage(eventCardMessages.registrantCount, {
                  attendeesCount,
                })}
              </p>
            </PreviewInfoRow>
          )}
          <div className={styles.divider} />

          <div className={styles.section}>
            <PreviewInfoRow icon="position" empty={!address1}>
              <p
                className={[
                  address1 ? styles.infoText : styles.infoTextEmpty,
                  hasLocationPoint ? styles.underline : '',
                ].join(' ')}
              >
                {locationName || formatMessage(messages.previewLocation)}
              </p>
              {address1 && addressDetails && (
                <p className={styles.infoText}>{addressDetails}</p>
              )}
            </PreviewInfoRow>
          </div>

          {onlineLink && (
            <div className={styles.section}>
              <PreviewInfoRow icon="link">
                <p className={`${styles.infoText} ${styles.underline}`}>
                  {formatMessage(messages.linkToOnlineEvent)}
                </p>
              </PreviewInfoRow>
            </div>
          )}

          <PreviewInfoRow icon="calendar">
            <p className={styles.infoText}>{dateLine}</p>
            <p
              className={`${styles.calendarLink} ${styles.underline}`}
              style={{ color: tenantColor }}
            >
              {formatMessage(calendarMessages.addToCalendar)}
            </p>
          </PreviewInfoRow>
        </div>
      </div>
    </div>
  );
};

export default PreviewInfoCard;

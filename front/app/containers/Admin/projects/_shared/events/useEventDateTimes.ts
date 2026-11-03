import { Dispatch, SetStateAction } from 'react';

import moment from 'moment-timezone';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IEventProperties } from 'api/events/types';

// Pickers operate on JS Dates in the *browser* tz. To make them display
// wall-clock values in the platform tz, we project the stored UTC instant
// into the platform tz and rebuild a Date whose browser-tz components
// match those platform-tz wall-clock values.
export const toPlatformWallClock = (iso: string, platformTimezone: string) => {
  if (!platformTimezone) return new Date(iso);
  const m = moment.tz(iso, platformTimezone);
  return new Date(m.year(), m.month(), m.date(), m.hour(), m.minute());
};

interface Options {
  startAt: string;
  endAt: string;
  setAttributeDiff: Dispatch<SetStateAction<IEventProperties>>;
}

// An event's dates are picked as wall-clock values in the platform timezone,
// whatever the admin's own timezone is.
const useEventDateTimes = ({ startAt, endAt, setAttributeDiff }: Options) => {
  const { data: appConfig } = useAppConfiguration();
  const platformTimezone =
    appConfig?.data.attributes.settings.core.timezone ?? '';

  // Inverse of toPlatformWallClock: treat the picker Date's wall-clock components
  // as platform-tz values and return the corresponding UTC ISO string.
  const fromPickerDate = (date: Date) => {
    if (!platformTimezone) return date.toISOString();
    return moment
      .tz(
        {
          year: date.getFullYear(),
          month: date.getMonth(),
          day: date.getDate(),
          hour: date.getHours(),
          minute: date.getMinutes(),
          second: 0,
        },
        platformTimezone
      )
      .utc()
      .toISOString();
  };

  const startAtDate = toPlatformWallClock(startAt, platformTimezone);
  const endAtDate = toPlatformWallClock(endAt, platformTimezone);
  const now = platformTimezone ? moment().tz(platformTimezone) : moment();
  const tenantTimeNow = new Date(
    now.year(),
    now.month(),
    now.date(),
    now.hour(),
    now.minute()
  );

  const updateStartAt = (date: Date) => {
    // Preserve real (UTC) duration so DST transitions don't stretch/shrink the event
    const currentDurationMs = moment.utc(endAt).diff(moment.utc(startAt));

    const newStartIso = fromPickerDate(date);
    const newEndIso = moment
      .utc(newStartIso)
      .add(currentDurationMs, 'ms')
      .toISOString();

    setAttributeDiff((prev) => ({
      ...prev,
      start_at: newStartIso,
      end_at: newEndIso,
    }));
  };

  const updateEndAt = (date: Date) => {
    const newEndIso = fromPickerDate(date);
    const newEndUtc = moment.utc(newEndIso);
    const oldStartUtc = moment.utc(startAt);

    let newStartIso = startAt;
    if (newEndUtc.isBefore(oldStartUtc)) {
      const currentDurationMs = moment.utc(endAt).diff(oldStartUtc);
      newStartIso = newEndUtc
        .clone()
        .subtract(currentDurationMs, 'ms')
        .toISOString();
    }

    setAttributeDiff((prev) => ({
      ...prev,
      start_at: newStartIso,
      end_at: newEndIso,
    }));
  };

  return {
    platformTimezone,
    startAtDate,
    endAtDate,
    tenantTimeNow,
    updateStartAt,
    updateEndAt,
  };
};

export default useEventDateTimes;

import React from 'react';

// components
import { EventDay, EventMonth } from './styling';

// hooks
import useLocale from 'hooks/useLocale';

// utils
import { showDotAfterDay } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  day?: string;
  month?: string | null;
}

export default ({ day, month }: Props) => {
  const locale = useLocale();
  const addDotToDay = !isNilOrError(locale) && showDotAfterDay(locale);

  if (locale === 'en') {
    return (
      <>
        {month && <EventMonth>{month}</EventMonth>}
        <EventDay>{day}</EventDay>
      </>
    );
  }

  return (
    <>
      <EventDay>
        {day}
        {addDotToDay ? '.' : ''}
      </EventDay>
      {month && <EventMonth>{month}</EventMonth>}
    </>
  );
};

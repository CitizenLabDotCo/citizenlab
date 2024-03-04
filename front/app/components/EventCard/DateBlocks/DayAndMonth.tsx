import React from 'react';

import { showDotAfterDay } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';

import useLocale from 'hooks/useLocale';

import { EventDay, EventMonth } from './styling';

interface Props {
  day?: string;
  month?: string | null;
}

const DayAndMonth = ({ day, month }: Props) => {
  const locale = useLocale();
  const addDotAfterDay = !isNilOrError(locale) && showDotAfterDay(locale);

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
        {addDotAfterDay ? '.' : ''}
      </EventDay>
      {month && <EventMonth>{month}</EventMonth>}
    </>
  );
};

export default DayAndMonth;

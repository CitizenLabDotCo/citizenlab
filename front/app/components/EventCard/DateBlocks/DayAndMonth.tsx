import React from 'react';

// components
import { EventDay, EventMonth } from './styling';

// hooks
import useLocale from 'hooks/useLocale';

interface Props {
  day?: string;
  month?: string | null;
}

export default ({ day, month }: Props) => {
  const locale = useLocale();

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
      <EventDay>{day}</EventDay>
      {month && <EventMonth>{month}</EventMonth>}
    </>
  );
};

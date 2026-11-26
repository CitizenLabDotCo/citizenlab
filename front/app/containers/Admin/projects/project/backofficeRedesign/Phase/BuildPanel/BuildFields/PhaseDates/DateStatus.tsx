import React from 'react';

import { differenceInCalendarDays } from 'date-fns';

import Icon from 'design-system/Icon';

import { useIntl } from 'utils/cl-intl';

import styles from './DateStatus.module.css';
import messages from './messages';
import 'design-system/tokens.css';

interface Props {
  // The phase's days in the platform's time zone; the end is its last moment.
  from: Date;
  to: Date | undefined;
  now: Date;
}

type State = 'notStarted' | 'live' | 'finished';

// Where the dates put the phase today: not started, live or finished, and how
// far from the next change.
const DateStatus = ({ from, to, now }: Props) => {
  const { formatMessage } = useIntl();

  const state: State =
    now < from ? 'notStarted' : !to || now <= to ? 'live' : 'finished';

  const detail = () => {
    if (state === 'notStarted') {
      const days = differenceInCalendarDays(from, now);
      return days === 0
        ? formatMessage(messages.startsToday)
        : formatMessage(messages.startsIn, { days });
    }
    if (state === 'live') {
      if (!to) return formatMessage(messages.openEnded);
      const days = differenceInCalendarDays(to, now);
      return days === 0
        ? formatMessage(messages.endsToday)
        : formatMessage(messages.daysLeft, { days });
    }
    const days = differenceInCalendarDays(now, to ?? now);
    return days === 0
      ? formatMessage(messages.endedToday)
      : formatMessage(messages.daysAgo, { days });
  };

  return (
    <div className={`${styles.status} ${styles[state]}`} role="status">
      {state === 'live' ? (
        <span className={styles.dot} aria-hidden />
      ) : (
        <Icon
          name={state === 'finished' ? 'check-14' : 'clock-16'}
          className={styles.icon}
        />
      )}
      <span className={styles.label}>
        {formatMessage(
          state === 'notStarted'
            ? messages.notStarted
            : state === 'live'
            ? messages.live
            : messages.finished
        )}
      </span>
      <span className={styles.detail}>{detail()}</span>
    </div>
  );
};

export default DateStatus;

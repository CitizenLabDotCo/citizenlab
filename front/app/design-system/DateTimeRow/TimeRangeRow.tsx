import React, { useId } from 'react';

import { Time } from '@internationalized/date';
import { Group, TimeField as AriaTimeField } from 'react-aria-components';

import DateSegments from '../DateField/DateSegments';
import { FieldError, fieldStyles } from '../Field';
import Icon from '../Icon';

import styles from './DateTimeRow.module.css';
import '../tokens.css';

type TimeProps = {
  'aria-label': string;
  value: Time | null;
  onChange: (value: Time | null) => void;
};

type Props = {
  'aria-label': string;
  start: TimeProps;
  end: TimeProps;
  // The error belongs to the end time, the one that can come too early.
  errorMessage?: string;
};

// The time line of the library's Date and time row: start → end in one box.
const TimeRangeRow = ({
  'aria-label': ariaLabel,
  start,
  end,
  errorMessage,
}: Props) => {
  const errorId = useId();

  return (
    <div className={`${styles.field} ${fieldStyles.control}`}>
      <Group
        className={styles.frame}
        aria-label={ariaLabel}
        isInvalid={!!errorMessage}
      >
        <Icon name="clock-16" className={styles.icon} />
        <AriaTimeField<Time>
          className={styles.startTime}
          aria-label={start['aria-label']}
          value={start.value}
          onChange={start.onChange}
        >
          <DateSegments className={styles.segments} />
        </AriaTimeField>
        <Icon name="arrow-right-16" className={styles.icon} />
        <AriaTimeField<Time>
          className={styles.time}
          aria-label={end['aria-label']}
          value={end.value}
          onChange={end.onChange}
          isInvalid={!!errorMessage}
          aria-describedby={errorMessage ? errorId : undefined}
        >
          <DateSegments className={styles.segments} />
        </AriaTimeField>
      </Group>
      <FieldError id={errorId}>{errorMessage}</FieldError>
    </div>
  );
};

export default TimeRangeRow;

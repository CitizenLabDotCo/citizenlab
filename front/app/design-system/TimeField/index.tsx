import React, { ReactNode } from 'react';

import { Time } from '@internationalized/date';
import { TimeField as AriaTimeField } from 'react-aria-components';

import dateInputStyles from '../DateField/DateInput.module.css';
import DateSegments from '../DateField/DateSegments';
import { FieldHelp, FieldLabel, fieldStyles } from '../Field';
import '../tokens.css';

import styles from './TimeField.module.css';

type Props = {
  label: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  size?: 36 | 32;
  value: Time | null;
  onChange: (value: Time | null) => void;
  minValue?: Time;
  maxValue?: Time;
  isInvalid?: boolean;
  isDisabled?: boolean;
};

const TimeField = ({
  label,
  description,
  errorMessage,
  size = 36,
  value,
  onChange,
  minValue,
  maxValue,
  isInvalid,
  isDisabled,
}: Props) => (
  <AriaTimeField<Time>
    className={dateInputStyles.field}
    value={value}
    onChange={onChange}
    minValue={minValue}
    maxValue={maxValue}
    hourCycle={24}
    isInvalid={isInvalid}
    isDisabled={isDisabled}
  >
    <FieldLabel>{label}</FieldLabel>
    <div className={fieldStyles.control}>
      <DateSegments
        className={`${styles.input} ${dateInputStyles[`size${size}`]}`}
      />
      <FieldHelp description={description} errorMessage={errorMessage} />
    </div>
  </AriaTimeField>
);

export default TimeField;

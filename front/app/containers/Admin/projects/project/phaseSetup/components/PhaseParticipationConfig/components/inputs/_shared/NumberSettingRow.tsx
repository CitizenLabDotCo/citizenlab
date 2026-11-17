import React from 'react';

import NumberField from 'design-system/NumberField';

import styles from './NumberSettingRow.module.css';
import 'design-system/tokens.css';

interface Props {
  id: string;
  label: string;
  value: number | null | undefined;
  min: number;
  errorMessage?: string;
  onChange: (value: string) => void;
}

const NumberSettingRow = ({
  id,
  label,
  value,
  min,
  errorMessage,
  onChange,
}: Props) => (
  <div className={styles.row}>
    <NumberField
      id={id}
      label={label}
      size={32}
      // NaN is how React Aria shows an empty field and keeps it controlled.
      value={typeof value === 'number' ? value : NaN}
      minValue={min}
      onChange={(number) => onChange(Number.isNaN(number) ? '' : `${number}`)}
      isInvalid={!!errorMessage}
      errorMessage={errorMessage}
    />
  </div>
);

export default NumberSettingRow;

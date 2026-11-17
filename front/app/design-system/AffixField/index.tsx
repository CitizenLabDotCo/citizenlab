import React, { ReactNode } from 'react';

import {
  Group,
  Input,
  TextField as AriaTextField,
} from 'react-aria-components';

import { FieldHelp, FieldLabel, fieldStyles } from '../Field';
import inputStyles from '../TextField/input.module.css';

import styles from './AffixField.module.css';
import '../tokens.css';

type AffixFieldProps = {
  // The fixed text inside the box. It is not part of the value.
  prefix: string;
  label: ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  description?: ReactNode;
  errorMessage?: ReactNode;
  isInvalid?: boolean;
};

const AffixField = ({
  prefix,
  label,
  value,
  onChange,
  description,
  errorMessage,
  isInvalid,
}: AffixFieldProps) => (
  <AriaTextField
    className={inputStyles.field}
    value={value}
    onChange={onChange}
    isInvalid={isInvalid}
  >
    <FieldLabel>{label}</FieldLabel>
    <div className={fieldStyles.control}>
      <Group className={`${styles.prefixGroup} ${inputStyles.size36}`}>
        <span className={styles.affix}>{prefix}</span>
        <Input className={styles.input} />
      </Group>
      <FieldHelp description={description} errorMessage={errorMessage} />
    </div>
  </AriaTextField>
);

export default AffixField;

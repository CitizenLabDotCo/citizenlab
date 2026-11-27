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
  // The fixed text before the value. It is not part of the value.
  prefix: string;
  // Outside: the prefix stands before the box, as the project URL in settings.
  prefixPlacement?: 'inside' | 'outside';
  label: ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  labelTooltip?: string;
  description?: ReactNode;
  errorMessage?: ReactNode;
  isInvalid?: boolean;
};

const AffixField = ({
  prefix,
  prefixPlacement = 'inside',
  label,
  value,
  onChange,
  labelTooltip,
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
    <FieldLabel tooltip={labelTooltip}>{label}</FieldLabel>
    <div className={fieldStyles.control}>
      {prefixPlacement === 'inside' ? (
        <Group className={`${styles.prefixGroup} ${inputStyles.size36}`}>
          <span className={styles.affix}>{prefix}</span>
          <Input className={styles.input} />
        </Group>
      ) : (
        <div className={styles.outsideRow}>
          <span className={styles.outsideAffix}>{prefix}</span>
          <Input
            className={`${inputStyles.input} ${inputStyles.size36} ${styles.outsideInput}`}
          />
        </div>
      )}
      <FieldHelp description={description} errorMessage={errorMessage} />
    </div>
  </AriaTextField>
);

export default AffixField;

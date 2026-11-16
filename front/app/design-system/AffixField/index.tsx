import React, { ReactNode, useState } from 'react';

import {
  Group,
  Input,
  TextField as AriaTextField,
} from 'react-aria-components';

import { FieldHelp, FieldLabel, fieldStyles } from '../Field';
import '../tokens.css';
import inputStyles from '../TextField/input.module.css';

import styles from './AffixField.module.css';

// The fixed text inside the box. It is not part of the value.
type AffixProps =
  | { prefix: string; suffix?: undefined }
  | { suffix: string; prefix?: undefined };

export type AffixFieldProps = AffixProps & {
  label: ReactNode;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  description?: ReactNode;
  errorMessage?: ReactNode;
  size?: 36 | 32;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  name?: string;
  // Set on the input.
  id?: string;
  'data-cy'?: string;
};

const AffixField = ({
  prefix,
  suffix,
  label,
  value,
  defaultValue,
  onChange,
  description,
  errorMessage,
  size = 36,
  isRequired = false,
  isInvalid,
  isDisabled = false,
  name,
  id,
  'data-cy': dataCy,
}: AffixFieldProps) => {
  // Only needed to size the input to its text, so the suffix sits right after it.
  const [uncontrolledText, setUncontrolledText] = useState(defaultValue ?? '');
  const text = value ?? uncontrolledText;

  const handleChange = (newValue: string) => {
    setUncontrolledText(newValue);
    onChange?.(newValue);
  };

  return (
    <AriaTextField
      className={inputStyles.field}
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
      isRequired={isRequired}
      isInvalid={isInvalid}
      isDisabled={isDisabled}
      name={name}
      id={id}
      data-cy={dataCy}
    >
      <FieldLabel isRequired={isRequired}>{label}</FieldLabel>
      <div className={fieldStyles.control}>
        <Group
          className={`${
            prefix === undefined ? styles.suffixGroup : styles.prefixGroup
          } ${inputStyles[`size${size}`]}`}
        >
          {prefix !== undefined && (
            <span className={styles.affix}>{prefix}</span>
          )}
          {suffix === undefined ? (
            <Input className={styles.input} />
          ) : (
            <span className={styles.sizer} data-value={text}>
              <Input className={styles.sizedInput} />
            </span>
          )}
          {suffix !== undefined && (
            <span className={styles.affix}>{suffix}</span>
          )}
        </Group>
        <FieldHelp description={description} errorMessage={errorMessage} />
      </div>
    </AriaTextField>
  );
};

export default AffixField;

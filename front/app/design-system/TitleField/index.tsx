import React, { ReactNode } from 'react';

import { Input, TextField as AriaTextField } from 'react-aria-components';

import { FieldHelp, RequiredMarker } from '../Field';

import styles from './TitleField.module.css';
import '../tokens.css';

type TitleFieldProps = {
  // There is no visible label, so the input needs a name.
  'aria-label': string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  id?: string;
  errorMessage?: ReactNode;
};

// A title is always required, so the marker is always drawn.
const TitleField = ({
  'aria-label': ariaLabel,
  value,
  onChange,
  placeholder,
  id,
  errorMessage,
}: TitleFieldProps) => (
  <AriaTextField
    className={styles.titleField}
    aria-label={ariaLabel}
    value={value}
    onChange={onChange}
    id={id}
    isInvalid={!!errorMessage}
    isRequired
  >
    <span className={styles.control}>
      <Input className={styles.input} placeholder={placeholder} />
      <span className={styles.marker}>
        <RequiredMarker />
      </span>
    </span>
    <FieldHelp errorMessage={errorMessage} />
  </AriaTextField>
);

export default TitleField;

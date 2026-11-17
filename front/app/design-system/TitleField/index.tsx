import React from 'react';

import { Input, TextField as AriaTextField } from 'react-aria-components';

import { RequiredMarker } from '../Field';

import styles from './TitleField.module.css';
import '../tokens.css';

type TitleFieldProps = {
  // There is no visible label, so the input needs a name.
  'aria-label': string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
};

// A title is always required, so the marker is always drawn.
const TitleField = ({
  'aria-label': ariaLabel,
  value,
  onChange,
  placeholder,
}: TitleFieldProps) => (
  <AriaTextField
    className={styles.titleField}
    aria-label={ariaLabel}
    value={value}
    onChange={onChange}
    isRequired
  >
    <Input className={styles.input} placeholder={placeholder} />
    <span className={styles.marker}>
      <RequiredMarker />
    </span>
  </AriaTextField>
);

export default TitleField;

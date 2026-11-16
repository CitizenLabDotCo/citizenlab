import React from 'react';

import { Input, TextField as AriaTextField } from 'react-aria-components';

import { RequiredMarker } from '../Field';
import '../tokens.css';

import styles from './TitleField.module.css';

export type TitleFieldProps = {
  // There is no visible label, so the input needs a name.
  'aria-label': string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
  // Set on the input.
  id?: string;
  autoFocus?: boolean;
  'data-cy'?: string;
};

// A title is always required, so the marker is always drawn.
const TitleField = ({
  'aria-label': ariaLabel,
  value,
  defaultValue,
  onChange,
  placeholder,
  name,
  id,
  autoFocus,
  'data-cy': dataCy,
}: TitleFieldProps) => (
  <AriaTextField
    className={styles.titleField}
    aria-label={ariaLabel}
    value={value}
    defaultValue={defaultValue}
    onChange={onChange}
    isRequired
    name={name}
    id={id}
    autoFocus={autoFocus}
    data-cy={dataCy}
  >
    <Input className={styles.input} placeholder={placeholder} />
    <span className={styles.marker}>
      <RequiredMarker />
    </span>
  </AriaTextField>
);

export default TitleField;

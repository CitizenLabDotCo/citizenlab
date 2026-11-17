import React, { ReactNode, RefCallback } from 'react';

import { Input, TextField as AriaTextField } from 'react-aria-components';

import { FieldHelp, FieldLabel, fieldStyles } from '../Field';

import inputStyles from './input.module.css';
import '../tokens.css';

type LabelProps =
  | { label: ReactNode; 'aria-label'?: undefined }
  // Without a visible label (a title in a header, an inline rename) the field needs an aria-label.
  | { label?: undefined; 'aria-label': string };

type TextFieldProps = LabelProps & {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  description?: ReactNode;
  errorMessage?: ReactNode;
  size?: 36 | 32;
  isInvalid?: boolean;
  isDisabled?: boolean;
  id?: string;
  autoFocus?: boolean;
  // For a form library that focuses the first invalid field.
  inputRef?: RefCallback<HTMLInputElement>;
  'data-cy'?: string;
};

const TextField = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  description,
  errorMessage,
  size = 36,
  isInvalid,
  isDisabled = false,
  id,
  autoFocus,
  inputRef,
  'aria-label': ariaLabel,
  'data-cy': dataCy,
}: TextFieldProps) => (
  <AriaTextField
    className={inputStyles.field}
    value={value}
    onChange={onChange}
    onBlur={onBlur}
    isInvalid={isInvalid}
    isDisabled={isDisabled}
    id={id}
    autoFocus={autoFocus}
    aria-label={ariaLabel}
    data-cy={dataCy}
  >
    {label !== undefined && <FieldLabel>{label}</FieldLabel>}
    <div className={fieldStyles.control}>
      <Input
        ref={inputRef}
        className={`${inputStyles.input} ${inputStyles[`size${size}`]}`}
        placeholder={placeholder}
      />
      <FieldHelp description={description} errorMessage={errorMessage} />
    </div>
  </AriaTextField>
);

export default TextField;

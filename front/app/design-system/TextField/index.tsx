import React, { ReactNode, RefCallback } from 'react';

import { Input, TextField as AriaTextField } from 'react-aria-components';

import { FieldHelp, FieldLabel, fieldStyles } from '../Field';
import '../tokens.css';

import inputStyles from './input.module.css';

type LabelProps =
  | { label: ReactNode; 'aria-label'?: undefined }
  // Without a visible label (a title in a header, an inline rename) the field needs an aria-label.
  | { label?: undefined; 'aria-label': string };

export type TextFieldProps = LabelProps & {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  description?: ReactNode;
  errorMessage?: ReactNode;
  size?: 36 | 32;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  name?: string;
  id?: string;
  autoFocus?: boolean;
  // For a form library that focuses the first invalid field.
  inputRef?: RefCallback<HTMLInputElement>;
  'data-cy'?: string;
};

const TextField = ({
  label,
  value,
  defaultValue,
  onChange,
  onBlur,
  placeholder,
  description,
  errorMessage,
  size = 36,
  isRequired = false,
  isInvalid,
  isDisabled = false,
  isReadOnly = false,
  name,
  id,
  autoFocus,
  inputRef,
  'aria-label': ariaLabel,
  'data-cy': dataCy,
}: TextFieldProps) => (
  <AriaTextField
    className={inputStyles.field}
    value={value}
    defaultValue={defaultValue}
    onChange={onChange}
    onBlur={onBlur}
    isRequired={isRequired}
    isInvalid={isInvalid}
    isDisabled={isDisabled}
    isReadOnly={isReadOnly}
    name={name}
    id={id}
    autoFocus={autoFocus}
    aria-label={ariaLabel}
    data-cy={dataCy}
  >
    {label !== undefined && (
      <FieldLabel isRequired={isRequired}>{label}</FieldLabel>
    )}
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

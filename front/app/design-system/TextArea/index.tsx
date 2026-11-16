import React, { ReactNode, RefCallback, useLayoutEffect, useRef } from 'react';

import {
  TextArea as AriaTextArea,
  TextField as AriaTextField,
} from 'react-aria-components';

import { FieldHelp, FieldLabel, fieldStyles } from '../Field';
import '../tokens.css';
import inputStyles from '../TextField/input.module.css';

import styles from './TextArea.module.css';

type LabelProps =
  | { label: ReactNode; 'aria-label'?: undefined }
  // Without a visible label (a title in a header, an inline rename) the field needs an aria-label.
  | { label?: undefined; 'aria-label': string };

export type TextAreaProps = LabelProps & {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  description?: ReactNode;
  errorMessage?: ReactNode;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  name?: string;
  id?: string;
  autoFocus?: boolean;
  // For a form library that focuses the first invalid field.
  inputRef?: RefCallback<HTMLTextAreaElement>;
  'data-cy'?: string;
};

const TextArea = ({
  label,
  value,
  defaultValue,
  onChange,
  onBlur,
  placeholder,
  description,
  errorMessage,
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
}: TextAreaProps) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  // The box grows with its text instead of scrolling inside.
  const fitToContent = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    const borders = el.offsetHeight - el.clientHeight;
    el.style.height = `${el.scrollHeight + borders}px`;
  };

  useLayoutEffect(fitToContent, [value]);

  // The box measures itself through ref; a caller's inputRef gets the same element.
  const setRefs = (el: HTMLTextAreaElement | null) => {
    ref.current = el;
    inputRef?.(el);
  };

  const handleChange = (newValue: string) => {
    fitToContent();
    onChange?.(newValue);
  };

  return (
    <AriaTextField
      className={inputStyles.field}
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
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
        <AriaTextArea
          ref={setRefs}
          className={styles.textArea}
          placeholder={placeholder}
        />
        <FieldHelp description={description} errorMessage={errorMessage} />
      </div>
    </AriaTextField>
  );
};

export default TextArea;

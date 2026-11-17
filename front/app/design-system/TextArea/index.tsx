import React, { ReactNode, RefCallback, useLayoutEffect, useRef } from 'react';

import {
  TextArea as AriaTextArea,
  TextField as AriaTextField,
} from 'react-aria-components';

import { FieldHelp, FieldLabel, fieldStyles } from '../Field';
import '../tokens.css';
import inputStyles from '../TextField/input.module.css';

import styles from './TextArea.module.css';

type TextAreaProps = {
  label: ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  errorMessage?: ReactNode;
  isInvalid?: boolean;
  id?: string;
  // For a form library that focuses the first invalid field.
  inputRef?: RefCallback<HTMLTextAreaElement>;
};

const TextArea = ({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  errorMessage,
  isInvalid,
  id,
  inputRef,
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
      onChange={handleChange}
      onBlur={onBlur}
      isInvalid={isInvalid}
      id={id}
    >
      <FieldLabel>{label}</FieldLabel>
      <div className={fieldStyles.control}>
        <AriaTextArea
          ref={setRefs}
          className={styles.textArea}
          placeholder={placeholder}
        />
        <FieldHelp errorMessage={errorMessage} />
      </div>
    </AriaTextField>
  );
};

export default TextArea;

import React, {
  useState,
  useCallback,
  MouseEvent,
  useMemo,
  KeyboardEvent,
} from 'react';

import { isEmpty, debounce as debounceFn } from 'lodash-es';
import styled from 'styled-components';

import { colors, isRtl } from '../../utils/styleUtils';
import { InputSize } from '../../utils/typings';
import Box from '../Box';
import Icon from '../Icon';
import IconButton from '../IconButton';

const StyledInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledLabel = styled.label<{ isFloating: boolean }>`
  position: absolute;
  left: 12px;
  top: ${({ isFloating }) => (isFloating ? '0px' : '50%')};
  font-size: ${({ isFloating }) => (isFloating ? '12px' : '16px')};
  background-color: white; /* Matches the input background */
  padding: 0 4px; /* Adds a bit of spacing to cover the border */
  pointer-events: none;
  transform: translateY(-50%);
  transition: all 0.2s ease;

  ${isRtl`
    left: auto;
    right: 12px;
  `}
`;

const StyledInput = styled.input`
  padding: 20px 40px 8px 12px; /* Padding for the floating label */
  width: 100%;
  border: 1px solid ${colors.black};
  border-radius: 4px;
  background-color: white; /* Ensures the background matches */

  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const IconContainer = styled.div<{ inputSize?: InputSize }>`
  position: absolute;
  right: 10px;
  top: ${({ inputSize }) => (inputSize === 'small' ? '7px' : '10px')};
  ${isRtl`
    left: 10px;
    right: auto;
  `}
`;

export interface Props {
  id: string;
  defaultValue?: string;
  placeholder: string;
  ariaLabel: string;
  debounce?: number;
  a11y_closeIconTitle: string;
  setClearButtonRef?: (arg: HTMLButtonElement) => void;
  onChange: (arg: string | null) => void;
  className?: string;
  size?: InputSize;
  setInputRef?: (arg: HTMLInputElement) => void;
}

const SearchInput = ({
  id,
  defaultValue,
  placeholder,
  ariaLabel,
  debounce = 500,
  a11y_closeIconTitle,
  onChange,
  className,
  size,
  setInputRef,
}: Props) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState(
    defaultValue ?? ''
  );
  const [isFocused, setIsFocused] = useState(false);

  const debouncedOnChange = useMemo(
    () =>
      debounceFn((value: string | null) => {
        onChange(value);
      }, debounce),
    [onChange, debounce]
  );

  const handleOnChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const newValue = !isEmpty(value) ? value : '';
      setInternalSearchTerm(newValue);
      debouncedOnChange(newValue || null);
    },
    [debouncedOnChange]
  );

  const handleOnReset = (event?: MouseEvent | KeyboardEvent) => {
    event?.preventDefault();
    setInternalSearchTerm('');
    onChange(null);
  };

  const handleRef = (element: HTMLInputElement) => {
    setInputRef && setInputRef(element);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const isLabelFloating = isFocused || !!internalSearchTerm;

  return (
    <Box className={className || ''} position="relative">
      <StyledInputWrapper>
        <StyledLabel htmlFor={id} isFloating={isLabelFloating}>
          {placeholder}
        </StyledLabel>
        <StyledInput
          id={id}
          aria-label={ariaLabel}
          value={internalSearchTerm}
          onChange={handleOnChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          ref={handleRef}
        />
        <IconContainer inputSize={size}>
          {internalSearchTerm ? (
            <IconButton
              iconName="close"
              onClick={handleOnReset}
              iconColor={colors.textSecondary}
              iconColorOnHover="#000"
              a11y_buttonActionMessage={a11y_closeIconTitle}
            />
          ) : (
            <Icon name="search" fill={colors.textSecondary} />
          )}
        </IconContainer>
      </StyledInputWrapper>
    </Box>
  );
};

export default SearchInput;

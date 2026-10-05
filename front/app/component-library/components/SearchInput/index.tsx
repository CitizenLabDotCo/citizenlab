import React, {
  useState,
  useCallback,
  MouseEvent,
  useMemo,
  KeyboardEvent,
} from 'react';

import { isEmpty, debounce as debounceFn } from 'lodash-es';
import styled, { css } from 'styled-components';

import { bo, colors, isRtl, defaultStyles } from '../../utils/styleUtils';
import testEnv from '../../utils/testUtils/testEnv';
import { InputSize } from '../../utils/typings';
import Box from '../Box';
import Icon from '../Icon';
import IconButton from '../IconButton';
import Input from '../Input';

const StyledInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledLabel = styled.label<{ isFloating: boolean; color?: string }>`
  position: absolute;
  left: 12px;
  top: ${({ isFloating }) => (isFloating ? '0px' : '50%')};
  font-size: ${({ isFloating }) => (isFloating ? '14px' : '16px')};
  background-color: white;
  padding: 0 4px;
  pointer-events: none;
  transform: translateY(-50%);
  transition: all 0.2s ease;
  z-index: 2;
  ${({ color }) => (color ? `color: ${color};` : '')}

  ${isRtl`
    left: auto;
    right: 12px;
  `}
`;

type Variant = 'default' | 'bo';

const StyledInput = styled(Input)<{ variant: Variant }>`
  input {
    padding-right: 40px;
    width: 100%;

    &::-ms-clear {
      display: none;
    }
  }
  ${isRtl`
    input{
        padding-right: ${defaultStyles.inputPadding};
        padding-left: 40px;
    }
  `}

  ${({ variant }) =>
    variant === 'bo' &&
    css`
      input {
        height: 36px;
        padding: 0 10px 0 33px;
        border-radius: ${bo.borderRadius};
        border-color: ${colors.grey300};
        font-size: 13px;
        color: ${bo.colors.textHeadingStrong};
        transition: border-color 0.15s;

        &::placeholder {
          color: ${colors.coolGrey500};
        }

        &::-webkit-search-cancel-button {
          display: none;
        }
      }
      ${isRtl`
        input {
          padding: 0 33px 0 10px;
        }
      `}

      input:not(:disabled):not(.disabled):not(.error):hover {
        border-color: ${colors.grey300};
      }

      input:not(:disabled):not(.disabled):not(.error):focus {
        border: 1px solid ${colors.primary};
      }
    `}
`;

const IconContainer = styled(Box)<{ variant: Variant }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  ${({ variant }) =>
    variant === 'bo'
      ? css`
          left: 11px;
          ${isRtl`
            left: auto;
            right: 11px;
          `}
        `
      : css`
          right: 10px;
          ${isRtl`
            left: 10px;
            right: auto;
          `}
        `}
`;

export interface Props {
  id?: string;
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
  labelColor?: string;
  hideLabel?: boolean;
  dataCy?: string;
  variant?: Variant;
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
  labelColor,
  hideLabel = false,
  dataCy,
  variant = 'default',
}: Props) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState(
    defaultValue ?? null
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
    (value: string) => {
      const newValue = !isEmpty(value) ? value : null;

      setInternalSearchTerm(newValue);
      debouncedOnChange(newValue);
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
    <Box
      className={className || ''}
      position="relative"
      data-cy={dataCy}
      role="search"
    >
      <StyledInputWrapper>
        {!hideLabel && (
          <StyledLabel
            htmlFor={id}
            isFloating={isLabelFloating}
            color={labelColor}
          >
            {placeholder}
          </StyledLabel>
        )}
        <StyledInput
          id={id}
          className="e2e-search-input"
          type="search"
          aria-label={ariaLabel}
          placeholder={isLabelFloating && !hideLabel ? '' : placeholder}
          value={internalSearchTerm || ''}
          onChange={handleOnChange}
          size={size}
          data-testid={testEnv('input-field')}
          setRef={handleRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          variant={variant}
        />
        <IconContainer variant={variant}>
          {internalSearchTerm ? (
            <IconButton
              iconName="close"
              onClick={handleOnReset}
              iconColor={colors.textSecondary}
              iconColorOnHover="#000"
              iconWidth={variant === 'bo' ? '15px' : undefined}
              iconHeight={variant === 'bo' ? '15px' : undefined}
              a11y_buttonActionMessage={a11y_closeIconTitle}
              mr="-5px"
            />
          ) : (
            <Icon
              name="search"
              fill={
                variant === 'bo' ? colors.coolGrey500 : colors.textSecondary
              }
              width={variant === 'bo' ? '15px' : undefined}
              height={variant === 'bo' ? '15px' : undefined}
              role="presentation"
            />
          )}
        </IconContainer>
      </StyledInputWrapper>
    </Box>
  );
};

export default SearchInput;

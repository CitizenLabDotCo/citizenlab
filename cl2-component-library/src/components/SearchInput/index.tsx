import React, {
  useState,
  useCallback,
  MouseEvent,
  useMemo,
  KeyboardEvent,
} from 'react';
import { isEmpty } from 'lodash-es';
import debounceFn from 'lodash/debounce';

import Input from '../Input';
import Box from '../Box';
import IconButton from '../IconButton';
import Icon from '../Icon';

import styled from 'styled-components';
import { colors, isRtl, defaultStyles } from '../../utils/styleUtils';

import { InputSize } from '../../utils/typings';

import testEnv from '../../utils/testUtils/testEnv';

const StyledInput = styled(Input)`
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
    defaultValue ?? null
  );

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

    if (!isEmpty(internalSearchTerm)) {
      onChange(null);
      setInternalSearchTerm(null);
    }
  };

  const handleRef = (element: HTMLInputElement) => {
    setInputRef && setInputRef(element);
  };

  const userHasEnteredSearchTerm = !isEmpty(internalSearchTerm);

  return (
    <Box className={className || ''} position="relative">
      <StyledInput
        id={id}
        className="e2e-search-input"
        type="text"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={internalSearchTerm || ''}
        onChange={handleOnChange}
        size={size}
        data-testid={testEnv('input-field')}
        setRef={handleRef}
      />
      <IconContainer inputSize={size}>
        {userHasEnteredSearchTerm ? (
          <IconButton
            iconName={'close'}
            onClick={handleOnReset}
            iconColor={colors.textSecondary}
            iconColorOnHover={'#000'}
            a11y_buttonActionMessage={a11y_closeIconTitle}
          />
        ) : (
          <Icon name="search" fill={colors.textSecondary} />
        )}
      </IconContainer>
    </Box>
  );
};

export default SearchInput;

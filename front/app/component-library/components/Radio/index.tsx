import React, { FormEvent, useState } from 'react';

import useInstanceId from 'component-library/hooks/useInstanceId';
import { get } from 'lodash-es';
import { hideVisually } from 'polished';
import styled, { css, useTheme } from 'styled-components';

import { fontSizes, colors, focusRing, isRtl } from '../../utils/styleUtils';
import testEnv from '../../utils/testUtils/testEnv';
import Box, { BoxPaddingProps, BoxMarginProps } from '../Box';

type Variant = 'default' | 'bo';

const HiddenRadio = styled.input.attrs({ type: 'radio' })`
  ${hideVisually()};
`;

const CustomRadio = styled.div<{
  borderColor: string | undefined;
  variant: Variant;
}>`
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  margin-right: 10px;
  position: relative;
  background: #fff;
  border-radius: 50%;
  border: ${({ borderColor }) =>
    borderColor
      ? `solid 1px ${borderColor}`
      : `solid 1px ${colors.borderDark}`};
  transition: all 120ms ease-out;

  ${isRtl`
    margin-rigth: 0;
    margin-left: 10px;
  `}

  ${HiddenRadio}.focus-visible + & {
    ${focusRing}
  }

  &.enabled:hover {
    border-color: #000;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ variant }) =>
    variant === 'bo' &&
    css`
      flex-basis: 16px;
      width: 16px;
      height: 16px;
      margin-top: 2px;
      margin-right: 8px;
      border-color: ${colors.grey400};

      &.checked,
      &.enabled:hover {
        border-color: ${({ theme }) => theme.colors.tenantPrimary};
      }
    `}
`;

const Checked = styled.div<{ variant: Variant }>`
  flex: 0 0 12px;
  width: 12px;
  height: 12px;
  background: ${(props) => props.color};
  border-radius: 50%;

  ${({ variant }) =>
    variant === 'bo' &&
    css`
      flex-basis: 8px;
      width: 8px;
      height: 8px;
    `}
`;

const Label = styled.label<{ variant: Variant }>`
  display: flex;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  margin-bottom: 12px;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  & > :not(last-child) {
    margin-right: 7px;
  }

  &.enabled {
    cursor: pointer;

    &:hover {
      ${CustomRadio} {
        border-color: #000;
      }
    }
  }

  ${({ variant }) =>
    variant === 'bo' &&
    css`
      margin-bottom: 0;
    `}
`;

export type Props = {
  label?: string | JSX.Element | null;
  id?: string;
  onChange?: (arg: any) => void;
  currentValue?: any;
  value: any;
  usePrimaryBorder?: boolean;
  /**
   * Name should be a string that is the same for all radios of the same radio group and unique for each radio group.
   * E.g. if you have a poll with two questions and each question has four answers/radios,
   * radios of each question should have the same name, but it should be different from those
   * of the second question. See PollForm.tsx for a good example.
   */
  name: string | undefined;
  disabled?: boolean;
  buttonColor?: string | undefined;
  className?: string;
  isRequired?: boolean;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  onClick?: () => void;
  dataCy?: string;
  autoFocus?: boolean;
  variant?: Variant;
} & BoxPaddingProps &
  BoxMarginProps;

const Radio = ({
  onChange,
  value,
  disabled,
  id,
  name,
  currentValue,
  buttonColor,
  label,
  className,
  isRequired,
  usePrimaryBorder = false,
  onKeyDown,
  onChange: _onChange,
  onClick,
  dataCy,
  autoFocus,
  variant = 'default',
  ...rest
}: Props) => {
  const theme = useTheme();
  const [inputFocused, setInputFocused] = useState(false);
  const uuid = useInstanceId();

  const handleOnChange = (event: FormEvent) => {
    event.preventDefault();
    if (!disabled && onChange) {
      const targetElement = get(event, 'target') as HTMLElement;
      const targetElementIsLink =
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        targetElement &&
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        targetElement.hasAttribute &&
        targetElement.hasAttribute('href');

      if (!targetElementIsLink) {
        onChange(value);
        onClick && onClick();
      }
    }
  };

  const handleOnFocus = () => {
    setInputFocused(true);
  };

  const handleOnBlur = () => {
    setInputFocused(false);
  };

  const checked = value === currentValue;

  return (
    <Box
      onClick={handleOnChange}
      display="flex"
      alignItems="flex-start"
      data-testid="radio-container"
      data-cy={dataCy}
      {...rest}
    >
      <HiddenRadio
        id={id ?? uuid}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        aria-checked={checked}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        required={isRequired}
        readOnly
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
      />
      <CustomRadio
        className={`${inputFocused ? 'focused' : ''}
            ${checked ? 'checked' : ''}
            ${disabled ? 'disabled' : 'enabled'}
            circle`}
        variant={variant}
        borderColor={usePrimaryBorder ? theme.colors.tenantPrimary : undefined}
      >
        {checked && (
          <Checked
            aria-hidden
            variant={variant}
            color={buttonColor || colors.success}
          />
        )}
      </CustomRadio>
      {label && (
        <Label
          htmlFor={id ?? uuid}
          className={`
          ${className || ''}
          text
          ${disabled ? 'disabled' : 'enabled'}`}
          variant={variant}
          data-testid={testEnv('radio-label')}
        >
          {label}
        </Label>
      )}
    </Box>
  );
};

export default Radio;

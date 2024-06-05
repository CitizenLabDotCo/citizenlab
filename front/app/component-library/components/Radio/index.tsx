import React, { FormEvent, useState } from 'react';

import { get } from 'lodash-es';
import { hideVisually } from 'polished';
import styled, { useTheme } from 'styled-components';

import {
  fontSizes,
  colors,
  defaultOutline,
  isRtl,
} from '../../utils/styleUtils';
import testEnv from '../../utils/testUtils/testEnv';
import Box, { BoxPaddingProps, BoxMarginProps } from '../Box';

const HiddenRadio = styled.input.attrs({ type: 'radio' })`
  ${hideVisually()};
`;

const CustomRadio = styled.div<{ borderColor?: string }>`
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
    borderColor ? `solid 1px ${borderColor}` : `solid 1px ${colors.grey500}`};
  border: ;
  transition: all 120ms ease-out;

  ${isRtl`
    margin-rigth: 0;
    margin-left: 10px;
  `}

  ${HiddenRadio}.focus-visible + & {
    ${defaultOutline};
  }

  &.enabled:hover {
    border-color: #000;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Checked = styled.div`
  flex: 0 0 12px;
  width: 12px;
  height: 12px;
  background: ${(props) => props.color};
  border-radius: 50%;
`;

const Label = styled.label`
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
`;

/**
 * If we have a label, an id is required. Otherwise id is optional.
 */
type LabelProps =
  | {
      label: string | JSX.Element | null;
      id: string;
    }
  | {
      label?: undefined;
      id?: string | undefined;
    };

export type Props = {
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
} & BoxPaddingProps &
  BoxMarginProps &
  LabelProps;

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
  usePrimaryBorder,
  onChange: _onChange,
  ...rest
}: Props) => {
  const theme = useTheme();
  const [inputFocused, setInputFocused] = useState(false);

  const handleOnChange = (event: FormEvent) => {
    event.preventDefault();
    if (!disabled && onChange) {
      const targetElement = get(event, 'target') as HTMLElement;
      const targetElementIsLink =
        targetElement &&
        targetElement.hasAttribute &&
        targetElement.hasAttribute('href');

      if (!targetElementIsLink) {
        onChange(value);
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
      data-testid="radio-container"
      {...rest}
    >
      <HiddenRadio
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        aria-checked={checked}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        required={isRequired}
        readOnly
      />
      <CustomRadio
        className={`${inputFocused ? 'focused' : ''}
            ${checked ? 'checked' : ''}
            ${disabled ? 'disabled' : 'enabled'}
            circle`}
        borderColor={usePrimaryBorder ? theme.colors.tenantPrimary : undefined}
      >
        {checked && (
          <Checked aria-hidden color={buttonColor || colors.success} />
        )}
      </CustomRadio>
      {label && (
        <Label
          htmlFor={id}
          className={`
          ${className || ''}
          text
          ${disabled ? 'disabled' : 'enabled'}`}
          data-testid={testEnv('radio-label')}
        >
          {label}
        </Label>
      )}
    </Box>
  );
};

export default Radio;

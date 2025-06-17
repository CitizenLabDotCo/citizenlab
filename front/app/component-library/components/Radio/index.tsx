import React, { FormEvent, useState } from 'react';

import useInstanceId from 'component-library/hooks/useInstanceId';
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

const CustomRadio = styled.div<{ borderColor: string | undefined }>`
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
      alignItems="center"
      data-testid="radio-container"
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
          htmlFor={id ?? uuid}
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

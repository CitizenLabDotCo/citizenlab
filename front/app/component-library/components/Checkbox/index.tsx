import React from 'react';

import { hideVisually } from 'polished';
import styled from 'styled-components';

import { Color, defaultOutline } from '../../utils/styleUtils';
import testEnv from '../../utils/testUtils/testEnv';
import Box, { BoxMarginProps, BoxPaddingProps } from '../Box';
import Icon from '../Icon';

import { getColor } from './utils';

const CheckMarkIcon = styled(Icon)<{ size: string }>`
  fill: #fff;
`;

const IndeterminateIcon = styled(Icon)<{ size: string }>`
  fill: #fff;
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  ${hideVisually()};
`;

const StyledCheckbox = styled.div<{
  checkedOrIndeterminate: boolean;
  checkedColor?: Color;
  size: string;
  disabled: boolean;
}>`
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

  ${(props) => `
    background: ${getColor({
      checkedColor: props.checkedColor
        ? props.theme.colors[props.checkedColor]
        : undefined,
      checkedOrIndeterminate: props.checkedOrIndeterminate,
      element: 'background',
    })};
    border: solid 1px ${getColor({
      checkedColor: props.checkedColor
        ? props.theme.colors[props.checkedColor]
        : undefined,
      checkedOrIndeterminate: props.checkedOrIndeterminate,
      element: 'border',
    })};
    &.enabled {
    &:hover {
      background: ${getColor({
        checkedColor: props.checkedColor
          ? props.theme.colors[props.checkedColor]
          : undefined,
        checkedOrIndeterminate: props.checkedOrIndeterminate,
        element: 'hoverBackground',
      })};
      border-color: ${getColor({
        checkedColor: props.checkedColor
          ? props.theme.colors[props.checkedColor]
          : undefined,
        checkedOrIndeterminate: props.checkedOrIndeterminate,
        element: 'hoverBorder',
      })};
    }
  }
  `}

  width: ${({ size }) => parseInt(size, 10)}px;
  height: ${({ size }) => parseInt(size, 10)}px;
  flex: 0 0 ${({ size }) => parseInt(size, 10)}px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: ${(props) => props.theme.borderRadius};

  transition: all 120ms ease-out;

  ${HiddenCheckbox}.focus-visible + & {
    ${defaultOutline};
  }
`;

export type CheckboxProps = {
  size?: string;
  indeterminate?: boolean;
  disabled?: boolean;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  name?: string;
  stopLabelPropagation?: boolean;
  checkedColor?: Color;
  dataTestId?: string;
};

type Props = CheckboxProps & BoxPaddingProps & BoxMarginProps;

const Checkbox = ({
  id,
  size = '24px',
  disabled = false,
  indeterminate = false,
  onChange,
  checked,
  checkedColor,
  name,
  ...boxProps
}: Props) => {
  const handleOnCheckboxClick = (event: React.MouseEvent) => {
    event.preventDefault();
    onChange({
      target: {
        checked: !checked,
      },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const checkedOrIndeterminate = checked || indeterminate;

  return (
    <Box {...boxProps}>
      <HiddenCheckbox
        id={id}
        onChange={onChange}
        checked={checked}
        disabled={disabled}
        tabIndex={0}
        name={name}
      />
      <StyledCheckbox
        data-testid={testEnv('check-mark-background')}
        checkedColor={checkedColor}
        checkedOrIndeterminate={checkedOrIndeterminate}
        size={size}
        className={`${checked ? 'checked' : ''} ${
          disabled ? 'disabled' : 'enabled'
        } e2e-checkbox`}
        onClick={handleOnCheckboxClick}
        disabled={disabled}
      >
        {checked && (
          <CheckMarkIcon
            ariaHidden
            name="check"
            size={size}
            data-testid={testEnv('check-mark')}
          />
        )}
        {indeterminate && (
          <IndeterminateIcon ariaHidden name="minus" size={size} />
        )}
      </StyledCheckbox>
    </Box>
  );
};

export default Checkbox;

import React from 'react';

import { hideVisually } from 'polished';
import styled from 'styled-components';

import { Color, defaultOutline } from '../../utils/styleUtils';
import testEnv from '../../utils/testUtils/testEnv';
import Box, { BoxMarginProps, BoxPaddingProps } from '../Box';
import Icon from '../Icon';
import IconTooltip from '../IconTooltip';

import { getColor } from './utils';

const CheckboxContainer = styled.div<{ hasLabel: boolean }>`
  margin-right: ${({ hasLabel }) => (hasLabel ? '10px' : '0px')};
`;

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
}>`
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

type DefaultProps = {
  size?: string;
  disabled?: boolean;
  indeterminate?: boolean;
};

type Props = DefaultProps &
  BoxPaddingProps &
  BoxMarginProps & {
    checked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    label?: string | JSX.Element | null;
    labelTooltipText?: string | JSX.Element | null;
    id?: string;
    name?: string;
    stopLabelPropagation?: boolean;
    checkedColor?: Color;
    dataTestId?: string;
  };

const Checkbox = ({
  id,
  label,
  labelTooltipText,
  stopLabelPropagation,
  size = '24px',
  checked,
  className,
  disabled = false,
  indeterminate = false,
  onChange,
  name,
  checkedColor,
  dataTestId,
  ...rest
}: Props) => {
  const hasLabel = !!label;

  const handleLabelClick = (event: React.MouseEvent) => {
    stopLabelPropagation && event.stopPropagation();
  };

  const handleOnCheckboxClick = (event: React.MouseEvent) => {
    event.preventDefault();
    onChange({
      target: {
        checked: !checked,
      },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const checkedOrIndeterminate = checked || indeterminate;

  return label ? (
    <Box
      as="label"
      className={className || ''}
      position="relative"
      display="flex"
      flex="1"
      alignItems="center"
      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      onClick={handleLabelClick}
      data-testid={dataTestId || `${testEnv('check-mark-label')}`}
      {...rest}
    >
      <CheckboxContainer hasLabel={hasLabel}>
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
      </CheckboxContainer>
      <Box as="span" mr="4px">
        {label}
      </Box>
      {labelTooltipText && <IconTooltip content={labelTooltipText} />}
    </Box>
  ) : (
    <Box
      className={className || ''}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      data-testid={testEnv('check-mark-label')}
      {...rest}
    >
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

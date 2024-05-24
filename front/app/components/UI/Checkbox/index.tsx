import React, { PureComponent } from 'react';

import {
  colors,
  defaultOutline,
  isRtl,
  Icon,
} from '@citizenlab/cl2-component-library';
import { isBoolean } from 'lodash-es';
import { darken, hideVisually } from 'polished';
import styled from 'styled-components';

const CheckboxContainer = styled.div<{ hasLabel: boolean }>`
  margin-right: ${({ hasLabel }) => (hasLabel ? '10px' : '0px')};

  ${isRtl`
    margin-right: 0;
    margin-left: ${({ hasLabel }) => (hasLabel ? '10px' : '0px')};
  `}
`;

const CheckMarkIcon = styled(Icon)<{ size: string }>`
  fill: #fff;
`;

const IndeterminateIcon = styled(Icon)<{ size: string }>`
  fill: #fff;
`;

const Label = styled.label<{ disabled: boolean }>`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  ${hideVisually()};
`;

const StyledCheckbox = styled.div<{
  checkedOrIndeterminate: boolean;
  size: string;
}>`
  width: ${({ size }) => parseInt(size, 10)}px;
  height: ${({ size }) => parseInt(size, 10)}px;
  flex: 0 0 ${({ size }) => parseInt(size, 10)}px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: ${(props) => props.theme.borderRadius};
  border: solid 1px
    ${({ checkedOrIndeterminate }) =>
      checkedOrIndeterminate ? colors.success : colors.grey600};
  background: ${({ checkedOrIndeterminate }) =>
    checkedOrIndeterminate ? colors.success : '#fff'};
  transition: all 120ms ease-out;

  ${HiddenCheckbox}.focus-visible + & {
    ${defaultOutline};
  }

  &.enabled {
    &:hover {
      background: ${({ checkedOrIndeterminate }) =>
        checkedOrIndeterminate ? darken(0.05, colors.success) : '#fff'};
      border-color: ${({ checkedOrIndeterminate }) =>
        checkedOrIndeterminate ? darken(0.05, colors.success) : '#000'};
    }
  }
`;

type DefaultProps = {
  size?: string;
  disabled?: boolean;
  indeterminate?: boolean;
};

type Props = DefaultProps & {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  label?: string | JSX.Element | null;
  id?: string;
  name?: string;
  checkBoxTabIndex?: number;
};

/** @deprecated Use CheckboxWithLabel or Checkbox from component-library instead. */
export default class Checkbox extends PureComponent<Props> {
  static defaultProps: DefaultProps = {
    size: '22px',
    disabled: false,
    indeterminate: false,
  };

  render() {
    const {
      id,
      label,
      size,
      checked,
      className,
      disabled,
      indeterminate,
      onChange,
      name,
      checkBoxTabIndex,
    } = this.props;
    const hasLabel = !!label;

    if (size && isBoolean(disabled) && isBoolean(indeterminate)) {
      return (
        <Label
          id={id}
          className={className || ''}
          disabled={disabled}
          role="checkbox"
          aria-checked={checked}
        >
          <CheckboxContainer hasLabel={hasLabel}>
            <HiddenCheckbox
              onChange={onChange}
              checked={checked}
              disabled={disabled}
              tabIndex={checkBoxTabIndex}
              name={name}
            />
            <StyledCheckbox
              checkedOrIndeterminate={checked || indeterminate}
              size={size}
              className={`${checked ? 'checked' : ''} ${
                disabled ? 'disabled' : 'enabled'
              } e2e-checkbox`}
            >
              {checked && <CheckMarkIcon ariaHidden name="check" size={size} />}
              {indeterminate && (
                <IndeterminateIcon ariaHidden name="minus" size={size} />
              )}
            </StyledCheckbox>
          </CheckboxContainer>
          {label}
        </Label>
      );
    }

    return null;
  }
}

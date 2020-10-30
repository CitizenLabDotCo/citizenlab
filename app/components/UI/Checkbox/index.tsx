import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { colors, defaultOutline, isRtl } from 'utils/styleUtils';
import { Icon } from 'cl2-component-library';
import { isBoolean } from 'lodash-es';
import { darken, hideVisually } from 'polished';

const CheckboxContainer = styled.div<{ hasLabel: boolean }>`
  margin-right: ${({ hasLabel }) => (hasLabel ? '10px' : '0px')};

  ${isRtl`
    margin-right: 0;
    margin-left: ${({ hasLabel }) => (hasLabel ? '10px' : '0px')};
  `}
`;

const CheckMarkIcon = styled(Icon)<{ size: string }>`
  fill: #fff;
  flex: 0 0 ${({ size }) => Math.round((parseInt(size, 10) / 100) * 70)}px;
  width: ${({ size }) => Math.round((parseInt(size, 10) / 100) * 70)}px;
  height: ${({ size }) => Math.round((parseInt(size, 10) / 100) * 70)}px;
`;

const IndeterminateIcon = styled(Icon)<{ size: string }>`
  fill: #fff;
  flex: 0 0 ${({ size }) => Math.round((parseInt(size, 10) / 100) * 60)}px;
  width: ${({ size }) => Math.round((parseInt(size, 10) / 100) * 60)}px;
  height: ${({ size }) => Math.round((parseInt(size, 10) / 100) * 60)}px;
`;

const Label = styled.label<{ disabled: boolean }>`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  ${isRtl`
    flex-direction: row-reverse;
  `}
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
      checkedOrIndeterminate ? colors.clGreen : colors.separationDark};
  background: ${({ checkedOrIndeterminate }) =>
    checkedOrIndeterminate ? colors.clGreen : '#fff'};
  transition: all 120ms ease-out;

  ${HiddenCheckbox}.focus-visible + & {
    ${defaultOutline};
  }

  &.enabled {
    &:hover {
      background: ${({ checkedOrIndeterminate }) =>
        checkedOrIndeterminate ? darken(0.05, colors.clGreen) : '#fff'};
      border-color: ${({ checkedOrIndeterminate }) =>
        checkedOrIndeterminate ? darken(0.05, colors.clGreen) : '#000'};
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
};

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
    } = this.props;
    const hasLabel = !!label;

    if (size && isBoolean(disabled) && isBoolean(indeterminate)) {
      return (
        <Label id={id || ''} className={className || ''} disabled={disabled}>
          <CheckboxContainer hasLabel={hasLabel}>
            <HiddenCheckbox
              onChange={onChange}
              checked={checked}
              disabled={disabled}
              tabIndex={0}
              name={name}
            />
            <StyledCheckbox
              checkedOrIndeterminate={checked || indeterminate}
              size={size}
              className={`${checked ? 'checked' : ''} ${
                disabled ? 'disabled' : 'enabled'
              } e2e-checkbox`}
            >
              {checked && (
                <CheckMarkIcon ariaHidden name="checkmark" size={size} />
              )}
              {indeterminate && (
                <IndeterminateIcon
                  ariaHidden
                  name="indeterminate"
                  size={size}
                />
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

import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { colors, customOutline } from 'utils/styleUtils';
import Icon from 'components/UI/Icon';

const CheckMarkIcon = styled(Icon)`
  fill: #fff;
  width: 15px;
`;

const IndeterminateIcon = styled(Icon)`
  fill: #fff;
  width: 12px;
`;
const Label = styled.label<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  // Hide checkbox visually but remain accessible to screen readers.
  // Source: https://polished.js.org/docs/#hidevisually
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

const StyledCheckbox = styled.div<{checkedOrIndeterminate: boolean, size: string}>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 0 0 ${({ size }) => parseInt(size, 10)}px;
  width: ${({ size }) => parseInt(size, 10)}px;
  height: ${({ size }) => parseInt(size, 10)}px;
  background: ${({ checkedOrIndeterminate }) => checkedOrIndeterminate ? colors.clGreen : '#fff'};
  border-radius: ${(props) => props.theme.borderRadius};
  transition: all 150ms;
  border: solid 1px ${colors.separationDark};

  ${HiddenCheckbox}:focus + & {
    outline: ${customOutline};
  }

  &:hover {
    border-color: ${({ checkedOrIndeterminate }) => checkedOrIndeterminate ? colors.clGreen : '#000'};
  }
`;

const CheckboxContainer = styled.div<{ hasLabel: boolean }>`
  margin-right: ${({ hasLabel }) => hasLabel ? '10px' : '0px'};
`;

type DefaultProps = {
  size?: string;
};

type Props = DefaultProps & {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (event: React.MouseEvent | React.KeyboardEvent) => void;
  className?: string;
  notFocusable?: boolean;
  disabled?: boolean;
  label?: string | JSX.Element | null;
};

export default class Checkbox extends PureComponent<Props> {
  static defaultProps: DefaultProps = {
    size: '22px'
  };

  handleOnChange = (event) => {
    this.props.onChange(event);
  }

  render() {
    const {
      label,
      size,
      checked,
      className,
      notFocusable,
      disabled,
      indeterminate
    } = this.props;
    const hasLabel = !!label;

    return (
      <Label disabled={disabled as boolean}>
        <CheckboxContainer className={className} hasLabel={hasLabel}>
          <HiddenCheckbox
            className="e2e-checkbox"
            onChange={this.handleOnChange}
            checked={checked}
            disabled={disabled}
            tabIndex={notFocusable ? -1 : 0}
          />
          <StyledCheckbox
            checkedOrIndeterminate={(checked || indeterminate) as boolean}
            size={size as string}
          >
            {checked && <CheckMarkIcon ariaHidden name="checkmark" />}
            {indeterminate && <IndeterminateIcon ariaHidden name="indeterminate" />}
          </StyledCheckbox>
        </CheckboxContainer>
        {hasLabel && <span>{label}</span>}
      </Label>
    );
  }
}

// e2e tests (checkbox, indeterminate?)
// check in different places

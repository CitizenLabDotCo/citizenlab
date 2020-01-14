import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { colors, fontSizes, customOutline } from 'utils/styleUtils';
import Icon from 'components/UI/Icon';

const Container = styled.div<{ size: string }>`
  display: flex;
  align-items: center;
  cursor: pointer;

  &.hasNoLabel {
    flex: 0 0 ${({ size }) => parseInt(size, 10) + 2}px;
    width: ${({ size }) => parseInt(size, 10) + 2}px;
    height: ${({ size }) => parseInt(size, 10) + 2}px;
  }

  label {
    cursor: pointer;
  }

  &.disabled {
    cursor: not-allowed;
    label {
      cursor: not-allowed;
    }
  }
`;

const InputWrapper = styled.div<{ checked: boolean, size: string }>`
  position: relative;
  flex: 0 0 ${({ size }) => parseInt(size, 10)}px;
  width: ${({ size }) => parseInt(size, 10)}px;
  height: ${({ size }) => parseInt(size, 10)}px;
  color: #fff;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border: solid 1px ${colors.separationDark};
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${(props) => props.checked ? colors.clGreen : '#fff'};
  border-color: ${(props) => props.checked ? colors.clGreen : colors.separationDark};
  box-shadow: inset 0px 1px 1px rgba(0, 0, 0, 0.15);

  &.focused {
    outline: ${customOutline};
  }

  &:hover {
    border-color: ${(props: any) => props.checked ? colors.clGreen : '#000'};
  }
`;

const Input = styled.input`
  &[type='checkbox'] {
    /* See: https://snook.ca/archives/html_and_css/hiding-content-for-accessibility */
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(1px 1px 1px 1px); /* IE6, IE7 */
    clip: rect(1px, 1px, 1px, 1px);
  }
`;

const CheckmarkIcon = styled(Icon)`
  fill: #fff;
  width: 15px;
`;

const IndeterminateIcon = styled(Icon)`
  fill: #fff;
  width: 12px;
`;

const Label = styled.label`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  margin-left: 10px;
`;

type DefaultProps = {
  size?: string;
};

/**
 * If we have a label, an id is required. Otherwise id is optional.
 */
type LabelProps = {
  label: string | JSX.Element | null,
  id: string
} | {
  label?: undefined,
  id?: string | undefined
};

type Props = DefaultProps & LabelProps & {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (event: React.MouseEvent | React.KeyboardEvent) => void;
  className?: string;
  notFocusable?: boolean;
  disabled?: boolean;
};

interface State {
  inputFocused: boolean;
}

export default class Checkbox extends PureComponent<Props, State> {

  static defaultProps: DefaultProps = {
    size: '22px'
  };

  constructor(props) {
    super(props);
    this.state = {
      inputFocused: false
    };
  }

  handleOnClick = (event: React.MouseEvent) => {
    if (!this.props.disabled) {
      const targetElement = event?.target as HTMLElement | undefined;
      const parentElement = targetElement?.parentElement;
      const targetElementIsLink = targetElement?.hasAttribute('href');
      const parentElementIsLink = parentElement?.hasAttribute('href');

      if (!targetElementIsLink && !parentElementIsLink) {
        event.preventDefault();
        this.props.onChange(event);
      }
    }
  }

  handleOnKeyDown = (event: React.KeyboardEvent) => {
    if (!this.props.disabled) {
      const targetElement = event?.target as HTMLElement | undefined;
      const parentElement = targetElement?.parentElement;
      const targetElementIsLink = targetElement?.hasAttribute('href');
      const parentElementIsLink = parentElement?.hasAttribute('href');

      // if key = Space
      if (!targetElementIsLink && !parentElementIsLink && event.keyCode === 32) {
        event.preventDefault();
        this.props.onChange(event);
      }
    }
  }

  handleOnFocus = () => {
    this.setState({ inputFocused: true });
  }

  handleOnBlur = () => {
    this.setState({ inputFocused: false });
  }

  removeFocus = (event: React.FormEvent) => {
    event.preventDefault();
  }

  render() {
    const { label, size, checked, indeterminate, className, notFocusable, id, disabled } = this.props;
    const { inputFocused } = this.state;

    return (
      <Container
        size={size as string}
        onMouseDown={this.removeFocus}
        onClick={this.handleOnClick}
        onKeyDown={this.handleOnKeyDown}
        className={`${className ? className : ''} ${label ? 'hasLabel' : 'hasNoLabel'} ${disabled ? 'disabled' : ''}`}
      >
        <InputWrapper
          className={`e2e-checkbox ${checked ? 'checked' : ''} ${inputFocused ? 'focused' : ''}`}
          checked={!!(checked || indeterminate)}
          size={size as string}
        >
          <Input
            tabIndex={notFocusable ? -1 : 0}
            id={id}
            aria-checked={checked}
            type="checkbox"
            defaultChecked={checked}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur}
            disabled={disabled}
          />
          {checked && <CheckmarkIcon ariaHidden name="checkmark" />}
          {indeterminate && <IndeterminateIcon ariaHidden name="indeterminate" />}
        </InputWrapper>

        {label &&
          <Label htmlFor={id}>
            {label}
          </Label>
        }
      </Container>
    );
  }
}

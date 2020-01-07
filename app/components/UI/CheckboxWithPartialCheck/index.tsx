import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { colors, fontSizes, customOutline } from 'utils/styleUtils';
import Icon from 'components/UI/Icon';
import { get } from 'lodash-es';
// https://www.w3.org/TR/2016/WD-wai-aria-practices-1.1-20160317/examples/checkbox/checkbox-2.html

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

const InputWrapper = styled.div<{ checked: boolean | 'mixed', size: string }>`
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
  border-color: ${(props) => props.checked ? colors.clGreen : '#aaa'};
  box-shadow: inset 0px 1px 1px rgba(0, 0, 0, 0.15);

  &.focused {
    outline: ${customOutline};
  }

  &:hover {
    border-color: ${(props) => props.checked === 'mixed' ? colors.clBlueLightest : props.checked ? colors.clGreen : '#333'};
  }
`;

const RoleInput = styled.div`
  /* See: https://snook.ca/archives/html_and_css/hiding-content-for-accessibility */
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(1px 1px 1px 1px); /* IE6, IE7 */
  clip: rect(1px, 1px, 1px, 1px);
`;

const CheckmarkIcon = styled(Icon)`
  fill: #fff;
  width: 15px;
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
  checked: boolean | 'mixed';
  onChange: (event: React.MouseEvent | React.KeyboardEvent) => void;
  className?: string;
  notFocusable?: boolean;
  disabled?: boolean;
};

interface State {
  inputFocused: boolean;
}

export default class CheckboxWithPartialCheck extends PureComponent<Props, State> {

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
    const { disabled } = this.props;
    if (!disabled) {
      const targetElement = get(event, 'target') as any;
      const parentElement = get(event, 'target.parentElement');
      const targetElementIsLink = targetElement && targetElement.hasAttribute && targetElement.hasAttribute('href');
      const parentElementIsLink = parentElement && parentElement.hasAttribute && parentElement.hasAttribute('href');

      if (!targetElementIsLink && !parentElementIsLink) {
        event && event.preventDefault();
        this.props.onChange(event);
      }
    }
  }

  handleOnKeyDown = (event: React.KeyboardEvent) => {
    const { disabled } = this.props;
    if (!disabled) {
      const targetElement = get(event, 'target') as any;
      const parentElement = get(event, 'target.parentElement');
      const targetElementIsLink = targetElement && targetElement.hasAttribute && targetElement.hasAttribute('href');
      const parentElementIsLink = parentElement && parentElement.hasAttribute && parentElement.hasAttribute('href');

      if (!targetElementIsLink && !parentElementIsLink && event.key === 'Enter') {
        event && event.preventDefault();
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
    const { label, size, checked, className, notFocusable, id } = this.props;
    const { inputFocused } = this.state;

    return (
      <Container
        size={size as string}
        onMouseDown={this.removeFocus}
        onClick={this.handleOnClick}
        onKeyDown={this.handleOnKeyDown}
        className={`${className ? className : ''} ${label ? 'hasLabel' : 'hasNoLabel'}`}
      >
        <InputWrapper
          className={`e2e-mixed-checkbox ${inputFocused ? 'focused' : ''}`}
          size={size as string}
          checked={checked}
        >
          <RoleInput
            tabIndex={notFocusable ? -1 : 0}
            id={id}
            aria-checked={checked}
            role="checkbox"
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur}
          />
          {checked === 'mixed' ? <CheckmarkIcon ariaHidden name="more-options" /> : checked && <CheckmarkIcon ariaHidden name="checkmark" />}
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

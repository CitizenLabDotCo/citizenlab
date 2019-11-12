import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { colors, fontSizes, customOutline } from 'utils/styleUtils';
import Icon from 'components/UI/Icon';
import { get } from 'lodash-es';

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
  border: solid 1px #aaa;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${(props) => props.checked ? colors.clGreen : '#fff'};
  border-color: ${(props) => props.checked ? colors.clGreen : '#aaa'};
  box-shadow: inset 0px 1px 1px rgba(0, 0, 0, 0.15);

  &.focused {
    outline: ${customOutline};
  }

  &:hover {
    border-color: ${(props: any) => props.checked ? colors.clGreen : '#333'};
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

const Label = styled.label`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  margin-left: 10px;
`;

interface DefaultProps {
  size?: string;
}

interface Props extends DefaultProps {
  label?: string | JSX.Element | null | undefined;
  checked: boolean;
  onChange: (event: React.MouseEvent | React.KeyboardEvent) => void;
  className?: string;
}

interface State {
  inputFocused: boolean;
}

export default class Checkbox extends PureComponent<Props, State> {
  checkbox = React.createRef<HTMLInputElement>();

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
    const targetElement = get(event, 'target') as any;
    const parentElement = get(event, 'target.parentElement');
    const targetElementIsLink = targetElement && targetElement.hasAttribute && targetElement.hasAttribute('href');
    const parentElementIsLink = parentElement && parentElement.hasAttribute && parentElement.hasAttribute('href');

    if (!targetElementIsLink && !parentElementIsLink) {
      event && event.preventDefault();
      this.props.onChange(event);
    }
  }

  handleOnKeyDown = (event: React.KeyboardEvent) => {
    const targetElement = get(event, 'target') as any;
    const parentElement = get(event, 'target.parentElement');
    const targetElementIsLink = targetElement && targetElement.hasAttribute && targetElement.hasAttribute('href');
    const parentElementIsLink = parentElement && parentElement.hasAttribute && parentElement.hasAttribute('href');

    if (!targetElementIsLink && !parentElementIsLink && event.key === 'Enter') {
      event && event.preventDefault();
      this.props.onChange(event);
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
    const { label, size, checked, className } = this.props;
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
          className={`e2e-checkbox ${checked ? 'checked' : ''} ${inputFocused ? 'focused' : ''}`}
          checked={checked}
          size={size as string}
        >
          <Input
            ref={this.checkbox}
            id="checkbox"
            aria-checked={checked}
            type="checkbox"
            defaultChecked={checked}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur}
          />
          {checked && <CheckmarkIcon ariaHidden name="checkmark" />}
        </InputWrapper>

        {label &&
          <Label htmlFor="checkbox">
            {label}
          </Label>
        }
      </Container>
    );
  }
}

import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import Icon from 'components/UI/Icon';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const InputWrapper: any = styled.div`
  position: relative;
  flex: 0 0 ${(props: any) => props.size};
  width: ${(props: any) => props.size};
  height: ${(props: any) => props.size};
  color: #fff;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: solid 1px #aaa;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${(props: any) => props.checked ? colors.clGreen : '#fff'};
  border-color: ${(props: any) => props.checked ? colors.clGreen : '#aaa'};
  box-shadow: inset 0px 1px 1px rgba(0, 0, 0, 0.15);

  &.focused {
    outline: rgb(59, 153, 252) auto 5px;
  }

  &:hover {
    border-color: ${(props: any) => props.checked ? colors.clGreen : '#333'};
  }
`;

const Input = styled.input`
  &[type='checkbox'] {
    // opacity: 0;
    position: absolute;
    left: -50px;
  }
`;

const CheckmarkIcon = styled(Icon)`
  position: absolute;
  fill: #fff;
  height: 55%;
`;

const CheckmarkBox = styled.div`
  position: absolute;
  top: 0;
  z-index: 10;
  height: 22px;
  width: 22px;
  min-width: 22px;
  border: 1px solid #aaa;
  border-radius: ${(props: any) => props.theme.borderRadius};
  box-shadow: inset 0px 1px 1px rgba(0, 0, 0, 0.15);
  background: ${(props: any) => props.checked ? colors.clGreen : '#fff'};

  &.checked::after {
    content: "";
    display: inline-block;
    height: 6px;
    width: 14px;
    border-left: 1.5px solid;
    border-bottom: 1.5px solid;
    transform: rotate(-45deg);
  }
`;

const Label = styled.label`
  margin-left: 15px;
`;

interface DefaultProps {
  size?: string;
}

interface Props extends DefaultProps {
  label?: string | JSX.Element | null | undefined;
}

interface State {
  checked: boolean;
  inputFocused: boolean;
}

export default class AccessibleCheckbox extends PureComponent<Props, State> {
   checkbox = React.createRef<HTMLInputElement>();

  static defaultProps: DefaultProps = {
    size: '22px'
  };

  constructor(props) {
    super(props);
    this.state = {
      checked: false,
      inputFocused: false
    };
  }

  handleOnChange = () => {
    this.setState(prevState => ({
      checked: !prevState.checked
    }));
  }

  handleOnFocus = () => {
    this.setState({
      inputFocused: true
    });
  }

  handleOnBlur = () => {
    this.setState({
      inputFocused: false
    });
  }

  render() {
    const { label, size } = this.props;
    const { checked, inputFocused } = this.state;

    return (
      <Container>
        {/* <InputWrapper>
          <Input type="checkbox" id="checkbox" />
        </InputWrapper> */}
        <InputWrapper className={ inputFocused ? 'focused' : '' } onClick={this.handleOnChange} checked={checked} size={size}>
          <Input
            ref={this.checkbox}
            id="checkbox"
            aria-checked={checked}
            type="checkbox"
            checked={checked}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur}
          />
          {checked && <CheckmarkIcon ariaHidden name="checkmark" />}
        </InputWrapper>

        {label &&
          <Label htmlFor="checkbox" id="label">
            {label}
          </Label>
        }
      </Container>
    );
  }
}

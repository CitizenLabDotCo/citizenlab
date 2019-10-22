import React, { PureComponent } from 'react';
import styled from 'styled-components';

// components
import { ChromePicker, ColorResult } from 'react-color';
import Input from 'components/UI/Input';

const Container = styled.div`
  position: relative;
`;

const InputWrapper = styled.div`
  display: flex;
  width: 100%;

  input {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
`;

const Color: any = styled.div`
  width: 50px;
  height: 50px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  background: ${(props: any) => props.color };
  cursor: pointer;
`;

const StyledInput = styled(Input)`
  input {
    cursor: pointer;
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
    border-left: none !important;
  }
`;

const Popover = styled.div`
  position: absolute;
  top: 50px;
  left: 0px;
  z-index: 2;
`;

const Cover = styled.div`
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
`;

export interface Props {
  type: 'text';
  value: string;
  onChange: (arg: string) => void;
}

interface State {
  opened: boolean;
  value: string;
}

class ColorPickerInput extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      opened: false,
      value: props.value
    };
  }

  componentDidMount() {
    this.setState({ value: this.props.value });
  }

  componentDidUpdate(prevProps: Props) {
    if (!this.state.opened && prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value });
    }
  }

  open = (event: React.FormEvent<any>) => {
    event.preventDefault();
    this.setState({ opened: true });
  }

  close = (event: React.FormEvent<any>) => {
    event.preventDefault();
    this.setState({ opened: false });
    this.props.onChange(this.state.value);
  }

  change = (ColorDescription: ColorResult) => {
    const hexColor = ColorDescription.hex;
    this.setState({ value: hexColor });
  }

  render() {
    const { opened, value } = this.state;

    return (
      <Container>
        {opened &&
          <Popover>
            <Cover onClick={this.close} />
            <ChromePicker
              disableAlpha={true}
              color={value}
              onChange={this.change}
              onChangeComplete={this.change}
            />
          </Popover>
        }
        <InputWrapper>
          <Color
            onClick={this.open}
            color={value}
          />
          <StyledInput
            readOnly
            type="text"
            value={value}
            onFocus={this.open}
            spellCheck={false}
          />
        </InputWrapper>
      </Container>
    );
  }
}

export default ColorPickerInput;

import * as React from 'react';
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
  border-radius: 5px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  background: ${(props: any) => props.color };
  cursor: pointer;
`;

const StyledInput = styled(Input)`
  input {
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

interface Props {
  type: 'text';
  value: string;
  onChange: (arg: string) => void;
}

interface State {
  opened: boolean;
}

class ColorPickerInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {
      opened: false,
    };
  }

  open = (event: React.FormEvent<any>) => {
    event.preventDefault();
    this.setState({ opened: true });
  }

  close = (event: React.FormEvent<any>) => {
    event.preventDefault();
    this.setState({ opened: false });
  }

  change = (ColorDescription: ColorResult) => {
    const hexColor = ColorDescription.hex;
    if (this.props.onChange) this.props.onChange(hexColor);
  }

  render() {
    const { opened } = this.state;

    return (
      <Container>
        {opened &&
          <Popover>
            <Cover onClick={this.close} />
            <ChromePicker
              disableAlpha={true}
              color={this.props.value || undefined}
              onChange={this.change}
              onChangeComplete={this.change}
            />
          </Popover>
        }
        <InputWrapper>
          <Color
            onClick={this.open}
            color={this.props.value}
          />
          <StyledInput
            type="text"
            value={this.props.value}
            onFocus={this.open}
            spellCheck={false}
          />
        </InputWrapper>
      </Container>
    );
  }
}

export default ColorPickerInput;

import * as React from 'react';
import styled from 'styled-components';
import Input, { Props as InputProps } from 'components/UI/Input';
import { ChromePicker } from 'react-color';

const InputWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const Color: any = styled.div`
  width: 37px;
  height: 37px;
  border-radius: 4px;
  background: ${(props: any) => props.color };
`;

const Popover = styled.div`
  position: absolute;
  z-index: 2;
`;

const Cover = styled.div`
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
`;

type State = {
  displayColorPicker: boolean,
};


class ColorPickerInput extends React.Component<InputProps, State> {

  constructor(props) {
    super(props);

    this.state = {
      displayColorPicker: false,
    };
  }

  openColorPicker = (e) => {
    e.preventDefault();
    this.setState({ displayColorPicker: true });
  };

  closeColorPicker = (e) => {
    e.preventDefault();
    this.setState({ displayColorPicker: false });
  };

  changeColor = (colorDescriptor) => {
    this.props.onChange(colorDescriptor.hex);
  }

  render() {
    return (
      <div>
        {this.state.displayColorPicker &&
          <Popover>
            <Cover onClick={this.closeColorPicker} />
            <ChromePicker
              disableAlpha
              color={this.props.value}
              onChange={this.changeColor}
              onChangeComplete={this.changeColor} />
          </Popover>
        }
        <InputWrapper>
          <Color
            onClick={this.openColorPicker}
            color={this.props.value}
          />
          <Input
            {...this.props}
          />
        </InputWrapper>
      </div>
    );
  }
}

export default ColorPickerInput;

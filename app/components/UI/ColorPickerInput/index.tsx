import * as React from 'react';
import styled from 'styled-components';
import Input, { Props as InputProps } from 'components/UI/Input';
import { ChromePicker } from 'react-color';
import { calculateContrastRatio } from 'utils/styleUtils';
import Warning from 'components/UI/Warning';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

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

interface Props extends InputProps {}

interface State {
  opened: boolean;
  contrastRatio: number | null;
  contrastRatioTooLow: boolean;
}

class ColorPickerInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {
      opened: false,
      contrastRatio: null,
      contrastRatioTooLow: false
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

  change = (colorDescriptor) => {
    const { r, g, b } = colorDescriptor.rgb;
    const contrastRatio = calculateContrastRatio([255, 255, 255], [r, g, b]);
    const contrastRatioTooLow = contrastRatio < 4.50 ? true : false;
    this.setState({ contrastRatio, contrastRatioTooLow });

    if (this.props.onChange) this.props.onChange(colorDescriptor.hex);
  }

  render() {
    const { opened, contrastRatio, contrastRatioTooLow } = this.state;
    const formattedContrastRatio = contrastRatio && contrastRatio.toFixed(2);

    return (
      <Container>
        {opened &&
          <Popover>
            <Cover onClick={this.close} />
            <ChromePicker
              disableAlpha={true}
              color={this.props.value}
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
            {...this.props}
            onFocus={this.open}
          />
        </InputWrapper>
        {contrastRatioTooLow &&
          <Warning
            text={
              <FormattedMessage
                {...messages.contrastRatioTooLow}
                values={{ contrastRatio: formattedContrastRatio }}
              />
        } />
        }
      </Container>
    );
  }
}

export default ColorPickerInput;

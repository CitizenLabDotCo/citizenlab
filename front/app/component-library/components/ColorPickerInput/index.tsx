import React, { PureComponent, FormEvent } from 'react';

import { ChromePicker, ColorResult } from 'react-color';
import styled from 'styled-components';

import { colors } from '../../utils/styleUtils';
import testEnv from '../../utils/testUtils/testEnv';
import IconTooltip from '../IconTooltip';
import Input from '../Input';
import Label from '../Label';

const Container = styled.div``;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const SelectedColorSquare = styled.div`
  flex: 0 0 46px;
  width: 46px;
  height: 46px;
  border: 1px solid ${colors.grey700};
  border-radius: ${({ theme }) => theme.borderRadius};
  border-bottom-right-radius: 0px;
  border-top-right-radius: 0px;
  background: ${(props) => props.color};
  cursor: pointer;
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: 1;
`;

const SelectedColorValueInput = styled(Input)`
  input {
    height: 46px;
    width: 180px;
    padding: 0px;
    padding-left: 54px;
    cursor: pointer;
    border: 1px solid ${colors.grey700};
  }
`;

const Popover = styled.div`
  position: absolute;
  top: 50px;
  left: 0px;
  z-index: 2;

  & * {
    font-family: 'Public Sans', 'Helvetica Neue', Arial, Helvetica, sans-serif !important;
  }
`;

const Cover = styled.div`
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
`;

export interface Props {
  id?: string;
  type: 'text';
  value: string;
  label?: string | JSX.Element | null;
  labelTooltipText?: string | JSX.Element | null;
  className?: string;
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
      value: props.value,
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

  open = (event: FormEvent) => {
    event.preventDefault();
    this.setState({ opened: true });
  };

  close = (event: FormEvent) => {
    event.preventDefault();
    this.setState({ opened: false });
  };

  change = (ColorDescription: ColorResult) => {
    const hexColor = ColorDescription.hex;
    this.setState({ value: hexColor });
    this.props.onChange(this.state.value);
  };

  render() {
    const { label, labelTooltipText, className, id } = this.props;
    const { opened, value } = this.state;

    return (
      <Container className={className || ''}>
        {label && (
          <Label htmlFor={id}>
            <span>{label}</span>
            {labelTooltipText && <IconTooltip content={labelTooltipText} />}
          </Label>
        )}

        <InputWrapper>
          <SelectedColorSquare
            data-testid={testEnv('selected-color-square')}
            onClick={this.open}
            color={value}
          />
          <SelectedColorValueInput
            type="text"
            id={id}
            value={value}
            onFocus={this.open}
          />
          {opened && (
            <Popover data-testid={testEnv('popover')}>
              <Cover onClick={this.close} data-testid={testEnv('cover')} />
              <ChromePicker
                disableAlpha={true}
                color={value}
                onChange={this.change}
                onChangeComplete={this.change}
              />
            </Popover>
          )}
        </InputWrapper>
      </Container>
    );
  }
}

export default ColorPickerInput;

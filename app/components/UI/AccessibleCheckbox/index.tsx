import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

interface Props {
  label?: string | JSX.Element | null | undefined;
}

type State = {};

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const InputWrapper = styled.div`
  position: relative;
  height: 22px;
  width: 22px;
`;

const Input = styled.input`
  opacity: 0;

  &:focus + #checkmark::before {
    outline: rgb(59, 153, 252) auto 5px;
  }

  & + #checkmark::after {
    content: none;
  }

  &:checked + #checkmark::after {
    content: "";
  }
`;

const CheckmarkBox = styled.div`
  &::before, &::after {
    position: absolute;
  }

  &::before {
    content: "";
    display: inline-block;
    height: 22px;
    width: 22px;
    border: 1px solid #aaa;
    border-radius: ${(props: any) => props.theme.borderRadius};
    box-shadow: inset 0px 1px 1px rgba(0, 0, 0, 0.15);
    background: ${(props: any) => props.checked ? colors.clGreen : '#fff'};
    left: 50%;
    margin-left: -11px;
    top: 50%;
    margin-top: -11px;
  }

  &::after {
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

export default class AccessibleCheckbox extends PureComponent<Props, State> {
  render() {
    const { label } = this.props;

    return (
      <Container>
        <InputWrapper>
          <Input type="checkbox" id="checkbox" />
          <CheckmarkBox id="checkmark" />
        </InputWrapper>
        {label &&
          <Label htmlFor="checkbox" id="label">
            {/* {label} */}
            This is a test. This is a test.
            This is a test. This is a test.This is a test. This is a test.This is a test. This is a test.This is a test. This is a test.
          </Label>
        }
      </Container>
    );
  }
}

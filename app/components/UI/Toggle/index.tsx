import * as React from 'react';
import styled, { css } from 'styled-components';

const size = 22;
const padding = 4;

const Container: any = styled.div`
  height: ${size + padding * 2}px;
  display: inline-block;

  ${(props: any) => props.disabled && css`
    opacity: 0.25;

    i,
    i:before {
      cursor: not-allowed;
    }
  `};

  ${(props: any) => props.checked && css`
    i {
      padding-right: ${padding}px !important;
      padding-left: ${size}px !important;
      background: #00cc33 !important;
    }
  `};

  input {
    display: none;
  }

  i {
    display: inline-block;
    cursor: pointer;
    padding: ${padding}px;
    padding-right: ${size}px;
    transition: all ease 0.15s;
    border-radius: ${size + padding}px;
    background: #ccc;
    transform: translate3d(0, 0, 0);

    &:before {
      display: block;
      content: '';
      width: ${size}px;
      height: ${size}px;
      border-radius: ${size}px;
      background: #fff;
    }
  }
`;

export type Props = {
  checked: boolean;
  disabled?: boolean | undefined;
  onToggle: Function;
};

type State = {};

export default class Label extends React.PureComponent<Props, State> {
  handleOnClick = () => {
    if (!this.props.disabled) {
      this.props.onToggle();
    }
  }

  render() {
    const { checked, disabled } = this.props;

    return (
      <Container onClick={this.handleOnClick} checked={checked} disabled={disabled}>
        <input type="checkbox" role="checkbox" aria-checked={checked} />
        <i />
      </Container>
    );
  }
}

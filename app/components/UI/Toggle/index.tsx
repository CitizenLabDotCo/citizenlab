import * as React from 'react';
import styled, { css } from 'styled-components';
import { colors } from 'utils/styleUtils';

const size = 22;
const padding = 4;

const Container = styled.div`
  display: inline-block;

  &.hasLabel {
    display: flex;
    align-items: center;
  }
`;

const ToggleContainer: any = styled.div`
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
      background: ${colors.success} !important;
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

const Text = styled.div`
  color: #333;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
  padding-left: 10px;
  cursor: pointer;
`;

export type Props = {
  value: boolean;
  disabled?: boolean | undefined;
  label?: string | JSX.Element | null | undefined;
  onChange: (event: React.FormEvent<any>) => void;
};

type State = {};

export default class Toggle extends React.PureComponent<Props, State> {
  handleOnClick = (event) => {
    if (!this.props.disabled) {
      this.props.onChange(event);
    }
  }

  render() {
    const className = this.props['className'];
    const { value, disabled, label } = this.props;

    return (
      <Container className={`${className} ${label && 'hasLabel'}`}>
        <ToggleContainer onClick={this.handleOnClick} checked={value} disabled={disabled}>
          <input type="checkbox" role="checkbox" aria-checked={value} />
          <i />
        </ToggleContainer>

        {label &&
          <Text onClick={this.handleOnClick}>{label}</Text>
        }
      </Container>
    );
  }
}

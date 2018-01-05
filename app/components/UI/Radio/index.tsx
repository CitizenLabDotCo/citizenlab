import * as React from 'react';
import styled from 'styled-components';

const Wrapper = styled.label`
  display: flex !important;
  flex-direction: row;
  align-items: center;
  margin-bottom: .5rem;
`;

const CustomRadio = styled.div`
  width: 20px;
  height: 20px;
  content: '';
  cursor: pointer;
  display: inline-block;
  margin-right: 10px;
  position: relative;
  background: #fff;
  border-radius: 50%;
  border: 1px solid #a6a6a6;
  box-shadow: inset 0px 1px 2px rgba(0, 0, 0, 0.15);

  ::after {
    background: #49B47D;
    border-radius: 50%;
    content: "";
    opacity: 0;
    height: 70%;
    left: calc(50% - 70%/2);
    position: absolute;
    top: calc(50% - 70%/2);
    width: 70%;
    transition: all 0.2s;
  }

  &.checked::after{
    opacity: 1;
  }

  &:not(.checked):hover {
    border-color: #333;
  }
`;

const Text = styled.div`
  color: #333;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
`;

const HiddenInput = styled.input`
  display: none;
`;

interface Props {
  onChange: {(event): void};
  currentValue: any;
  value: any;
  name: string;
  id: string;
  label: string;
}

export default class Radio extends React.PureComponent<Props> {

  handleChange = (): void => {
    this.props.onChange(this.props.value);
  }

  render() {
    const className = this.props['className'];
    const checked = (this.props.value === this.props.currentValue);

    return (
      <Wrapper className={className} htmlFor={this.props.id}>
        <HiddenInput
          type="radio"
          name={this.props.name}
          id={this.props.id}
          value={this.props.value}
          aria-checked={checked}
          checked={checked}
          onChange={this.handleChange}
        />
        <CustomRadio className={`${checked ? 'checked' : ''}`} />
        <Text className="text">{this.props.label}</Text>
      </Wrapper>
    );
  }
}

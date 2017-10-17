import * as React from 'react';
import styled from 'styled-components';

const Wrapper = styled.label`
  display: flex !important;
  align-items: center;
  margin-bottom: .5rem;
`;

const CustomRadio = styled.div`
  background: #fff;
  border-radius: 50%;
  border: 1px solid #A6A6A6;
  box-shadow: inset 0px 2px 3px rgba(0, 0, 0, 0.15);
  content: '';
  cursor: pointer;
  display: inline-block;
  height: 1.5em;
  margin-right: 1.5rem;
  position: relative;
  width: 1.5em;

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

export default class Radio extends React.Component<Props> {

  handleChange = (event): void => {
    this.props.onChange(this.props.value);
  }

  render() {
    const checked = this.props.value === this.props.currentValue;

    return (
      <Wrapper htmlFor={this.props.id}>
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
        {this.props.label}
      </Wrapper>
    );
  }
}

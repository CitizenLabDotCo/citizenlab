import * as React from 'react';
import styled from 'styled-components';

const Wrapper = styled.label`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const CustomRadio = styled<any, 'div'>('div')`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  position: relative;
  background: #fff;
  border-radius: 50%;
  border: 1px solid #a6a6a6;
  box-shadow: inset 0px 1px 2px rgba(0, 0, 0, 0.15);


  ${props => props.disabled ? `
    opacity: 0.5;
    ` : `
    cursor: pointer;
    &:not(.checked):hover {
      border-color: #000;
    }
  `
  }
`;

const Checked = styled.div`
  width: 12px;
  height: 12px;
  background: #49B47D;
  border-radius: 50%;
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
  label: string | JSX.Element;
  disabled?: boolean;
}

export default class Radio extends React.PureComponent<Props> {
  handleChange = () => {
    if (!this.props.disabled) {
      this.props.onChange(this.props.value);
    }
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
        <CustomRadio
          className={`${checked ? 'checked' : ''}`}
          disabled={this.props.disabled}
        >
          {checked && <Checked />}
        </CustomRadio>
        <Text className="text">{this.props.label}</Text>
      </Wrapper>
    );
  }
}

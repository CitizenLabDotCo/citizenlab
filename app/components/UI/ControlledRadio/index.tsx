import React from 'react';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

const Wrapper = styled.label`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
  cursor: pointer;
  flex-wrap: nowrap;
`;

const CustomRadio = styled<any, 'div'>('div')`
  flex: 0 0 20px;
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
`;

const Checked = styled.div`
  flex: 0 0 12px;
  width: 12px;
  height: 12px;
  background: ${(props: any) => props.color};
  border-radius: 50%;
`;

const Text = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${colors.label};
  font-weight: 400;
  line-height: 20px;
  margin-bottom: 4px;
`;

const HiddenInput = styled.input`
  display: none;
`;

export interface Props {
  onChange: {(event): void};
  isChecked?: boolean;
  value: any;
  name?: string | undefined;
  id?: string | undefined;
  label: string | JSX.Element;
  buttonColor?: string | undefined;
}

export default class Radio extends React.PureComponent<Props> {

  handleChange = (e) => {
    this.props.onChange(e);
  }

  render() {
    const id = this.props.id || `${this.props.name}-${this.props.value}`;
    const {
      value,
      name,
      buttonColor,
      label,
      isChecked
    } = this.props;

    const className = this.props['className'];
    return (
      <Wrapper className={className} htmlFor={id}>
        <HiddenInput
          type="radio"
          name={name}
          id={id}
          value={value}
          aria-checked={isChecked}
          checked={isChecked}
          onChange={this.handleChange}
        />
        <CustomRadio
          className={`${isChecked ? 'checked' : ''}`}
        >
          {isChecked && <Checked color={(buttonColor || '#49B47D')}/>}
        </CustomRadio>
        <Text className="text">{label}</Text>
      </Wrapper>
    );
  }
}

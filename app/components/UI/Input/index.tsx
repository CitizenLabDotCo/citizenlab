import * as React from 'react';
import { media } from 'utils/styleUtils';
import Error from 'components/UI/Error';
import * as _ from 'lodash';
import styled from 'styled-components';

interface IInputWrapper {
  error: boolean;
}

const InputWrapper = styled.div`
  position: relative;

  input {
    width: 100%;
    color: #333;
    font-size: 17px;
    line-height: 24px;
    font-weight: 400;
    padding: 12px;
    border-radius: 5px;
    border: solid 1px;
    border-color: ${(props: IInputWrapper) => props.error ? '#fc3c2d' : '#ccc'};
    background: #fff;
    outline: none;

    &::placeholder {
      color: #aaa;
      opacity: 1;
    }

    ${media.notPhone`
      padding-right: ${props => props.error && '40px'};
    `}

    &:not(:focus):hover {
      border-color: ${props => props.error ? '#fc3c2d' : '#999'};
    }

    &:focus {
      border-color: ${props => props.error ? '#fc3c2d' : '#000'};
    }
  }
`;

export type Props = {
  id?: string | undefined;
  value?: string | null | undefined;
  type: 'text' | 'email' | 'password';
  placeholder?: string | null | undefined;
  error?: string | null | undefined;
  onChange: (arg: string) => void;
  onFocus?: (arg: any) => void;
  setRef?: (arg: HTMLInputElement) => void | undefined;
};

type State = {};

export default class Input extends React.PureComponent<Props, State> {
  handleOnChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.props.onChange(event.currentTarget.value);
  }

  handleRef = (element: HTMLInputElement) => {
    if (_.isFunction(this.props.setRef)) {
      this.props.setRef(element);
    }
  }

  render() {
    let { value, placeholder, error } = this.props;
    const { id, type } = this.props;
    const hasError = (_.isString(error) && !_.isEmpty(error));

    value = (value || '');
    placeholder = (placeholder || '');
    error = (error || null);

    return (
      <InputWrapper error={hasError}>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={this.handleOnChange}
          onFocus={this.props.onFocus}
          ref={this.handleRef}
        />
        <Error
          text={error}
          size="1"
          marginTop="10px"
          marginBottom="0px"
          showIcon={false}
          showBackground={false}
        />
      </InputWrapper>
    );
  }
}

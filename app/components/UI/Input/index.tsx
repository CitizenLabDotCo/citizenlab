import * as React from 'react';
import { media } from 'utils/styleUtils';
import Error from 'components/UI/Error';
import * as _ from 'lodash';
import styledComponents from 'styled-components';
const styled = styledComponents;

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

interface IInput {
  id?: string;
  type: 'text' | 'email' | 'password';
  value: string | null;
  placeholder: string | null;
  error: string | null;
  onChange: (arg: string) => void;
  setRef?: (arg: HTMLInputElement) => void;
}

const emptyString = '';

const Input: React.SFC<IInput> = ({ id, type, value, placeholder, error, onChange, setRef }) => {
  const hasError = (_.isString(error) && !_.isEmpty(error));

  const handleOnChange = (event: React.FormEvent<HTMLInputElement>) => {
    onChange(event.currentTarget.value);
  };

  const handleRef = (element: HTMLInputElement) => {
    if (_.isFunction(setRef)) {
      setRef(element);
    }
  };

  return (
    <InputWrapper error={hasError}>
      { type !== null && 
        value !== null && 
        placeholder !== null &&
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value || emptyString}
          onChange={handleOnChange}
          ref={handleRef}
        />
      }
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
};

export default Input;

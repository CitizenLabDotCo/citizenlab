import * as React from 'react';
import { media } from 'utils/styleUtils';
import Error from 'components/UI/Error';
import * as _ from 'lodash';
import * as MaskedInput from 'react-text-mask';
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

    ::placeholder {
      color: #aaa;
      opacity: 1;
    }

    ${media.biggerThanPhone`
      padding-right: ${(props: IInputWrapper) => props.error && '40px'};
    `}

    &:not(:focus):hover {
      border-color: ${(props: IInputWrapper) => props.error ? '#fc3c2d' : '#999'};
    }

    &:focus {
      border-color: ${(props: IInputWrapper) => props.error ? '#fc3c2d' : '#000'};
    }
  }
`;

const emptyString = '';

const MaskedTextInput: React.SFC<IMaskedTextInput> = ({ value, placeholder, mask, error, onChange }) => {
  const hasError = (!_.isNull(error) && !_.isUndefined(error) && !_.isEmpty(error));

  const handleOnChange = (event: React.FormEvent<HTMLInputElement>) => {
    onChange(event.currentTarget.value);
  };

  return (
    <InputWrapper error={hasError}>
      <MaskedInput
        guide={false}
        showMask={false}
        keepCharPositions={false}
        mask={mask}
        type="text"
        value={value || emptyString}
        placeholder={placeholder}
        onChange={handleOnChange}
      />
      <Error text={error} />
    </InputWrapper>
  );
};

interface IMaskedTextInput {
  value: string;
  placeholder: string;
  mask: string;
  error: string;
  onChange: (arg: string) => void;
}

export default MaskedTextInput;

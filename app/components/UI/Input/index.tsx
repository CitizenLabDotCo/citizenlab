import React from 'react';
import { isFunction, isNil, isEmpty, size } from 'lodash-es';
import { FormikConsumer, FormikContext } from 'formik';

// components
import Error from 'components/UI/Error';

// style
import styled from 'styled-components';
import { media, color, fontSize } from 'utils/styleUtils';
import { isBoolean } from 'util';

const Container: any = styled.div`
  width: 100%;
  position: relative;

  input {
    width: 100%;
    height: 100%;
    font-size: ${fontSize('base')};
    line-height: 24px;
    font-weight: 400;
    padding: 12px;
    border-radius: 5px;
    border: solid 1px;
    border-color: ${(props: any) => props.error ? props.theme.colors.clRedError : '#ccc'};
    box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.1);
    background: #fff;
    outline: none;
    -webkit-appearance: none;

    &.hasMaxCharCount {
      padding-right: 62px;
    }

    &::placeholder {
      color: #aaa;
      opacity: 1;
    }

    &:focus {
      border-color: ${(props: any) => props.error ? props.theme.colors.clRedError : '#999'};
    }

    &:disabled {
      background-color: #f9f9f9;
    }

    ${media.biggerThanPhone`
      padding-right: ${props => props.error && '40px'};
    `}
  }
`;

const CharCount = styled.div`
  color: ${color('label')};
  font-size: ${fontSize('small')};
  font-weight: 400;
  text-align: right;
  position: absolute;
  top: 16px;
  right: 10px;

  &.error {
    color: red;
  }
`;

export type Props = {
  ariaLabel?: string;
  id?: string | undefined;
  value?: string | null | undefined;
  type: 'text' | 'email' | 'password' | 'number';
  placeholder?: string | null | undefined;
  error?: string | JSX.Element | null | undefined;
  onChange?: (arg: string) => void;
  onFocus?: (arg: React.FormEvent<HTMLInputElement>) => void;
  onBlur?: (arg: React.FormEvent<HTMLInputElement>) => void;
  setRef?: (arg: HTMLInputElement) => void | undefined;
  autoFocus?: boolean | undefined;
  min?: string | undefined;
  name?: string | undefined;
  maxCharCount?: number | undefined;
  disabled?: boolean;
  spellCheck?: boolean;
  formikContext: FormikContext<any>;
};

type State = {};

class Input extends React.PureComponent<Props, State> {

  handleOnChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { maxCharCount, onChange, name, formikContext } = this.props;

    if (!maxCharCount || size(event.currentTarget.value) <= maxCharCount) {
      if (onChange) {
        onChange(event.currentTarget.value);
      }

      if (name && formikContext && formikContext.handleChange) {
        formikContext.handleChange(event);
      }
    }
  }

  handleOnBlur = (event: React.FormEvent<HTMLInputElement>) => {
    const { onBlur, formikContext, /*, name */ } = this.props;

    if (onBlur) {
      onBlur(event);
    }

    if (name && formikContext && formikContext.handleBlur) {
      formikContext.handleBlur(event);
    }
  }

  handleRef = (element: HTMLInputElement) => {
    if (isFunction(this.props.setRef)) {
      this.props.setRef(element);
    }
  }

  render() {
    const { ariaLabel } = this.props;
    let { value, placeholder, error } = this.props;
    const className = this.props['className'];
    const { formikContext } = this.props;
    const { id, type, name, maxCharCount, min, autoFocus, onFocus, disabled, spellCheck } = this.props;
    const hasError = (!isNil(error) && !isEmpty(error));
    const optionalProps = isBoolean(spellCheck) ? { spellCheck } : null;
    if (name && formikContext && formikContext.values[name]) {
      value = (value || formikContext.values[name]);
    }

    value = (value || '');
    placeholder = (placeholder || '');
    error = (error || null);

    const currentCharCount = (maxCharCount && size(value));
    const tooManyChars = (maxCharCount && currentCharCount && currentCharCount > maxCharCount);

    return (
      <Container error={hasError} className={className}>

        {maxCharCount &&
          <CharCount className={`${tooManyChars && 'error'}`}>
            {currentCharCount}/{maxCharCount}
          </CharCount>
        }

        <input
          aria-label={ariaLabel}
          id={id}
          className={`CLInputComponent ${maxCharCount && 'hasMaxCharCount'}`}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={this.handleOnChange}
          onFocus={onFocus}
          onBlur={this.handleOnBlur}
          ref={this.handleRef}
          min={min}
          autoFocus={autoFocus}
          disabled={disabled}
          {...optionalProps}
        />

        <div>
          <Error text={error} size="1" />
        </div>

      </Container>
    );
  }
}

export default (props: Props) => (
  <FormikConsumer>
    {formikContext => <Input formikContext={formikContext} {...props} />}
  </FormikConsumer>
);

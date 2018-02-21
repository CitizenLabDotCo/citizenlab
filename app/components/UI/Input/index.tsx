import * as React from 'react';
import { isFunction, isNil, isEmpty, size } from 'lodash';
import PropTypes from 'prop-types';

// components
import Error from 'components/UI/Error';

// style
import styled from 'styled-components';
import { media, color, fontSize } from 'utils/styleUtils';

const Container: any = styled.div`
  position: relative;

  input {
    width: 100%;
    height: 100%;
    color: ${color('text')};
    font-size: ${fontSize('base')};
    line-height: 24px;
    font-weight: 400;
    padding: 12px;
    border-radius: 5px;
    border: solid 1px;
    border-color: ${(props: any) => props.error ? props.theme.colors.error : '#ccc'};
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
      border-color: ${(props: any) => props.error ? props.theme.colors.error : '#999'};
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
};

type State = {};

export default class Input extends React.PureComponent<Props, State> {
  static contextTypes = {
    formik: PropTypes.object,
  };

  handleOnChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { maxCharCount, onChange, name } = this.props;
    const { formik } = this.context;

    if (!maxCharCount || size(event.currentTarget.value) <= maxCharCount) {
      if (onChange) {
        onChange(event.currentTarget.value);
      }

      if (name && formik && formik.handleChange) {
        formik.handleChange(event);
      }
    }
  }

  handleOnBlur = (event: React.FormEvent<HTMLInputElement>) => {
    const { onBlur/*, name */ } = this.props;
    const { formik } = this.context;

    if (onBlur) {
      onBlur(event);
    }

    if (name && formik && formik.handleBlur) {
      formik.handleBlur(event);
    }
  }

  handleRef = (element: HTMLInputElement) => {
    if (isFunction(this.props.setRef)) {
      this.props.setRef(element);
    }
  }

  render() {
    let { value, placeholder, error } = this.props;
    const className = this.props['className'];
    const { formik } = this.context;
    const { id, type, name, maxCharCount, min, autoFocus, onFocus } = this.props;
    const hasError = (!isNil(error) && !isEmpty(error));

    if (name && formik && formik.values[name]) {
      value = (value || formik.values[name]);
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
        />

        <div>
          <Error text={error} size="1" />
        </div>

      </Container>
    );
  }
}

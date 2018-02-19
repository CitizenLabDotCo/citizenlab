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
    /* box-shadow: inset 0px 2px 3px rgba(0, 0, 0, 0.15); */
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
    if (this.props.onChange) this.props.onChange(event.currentTarget.value);

    if (this.context.formik && this.props.name) {
      this.context.formik.handleChange(event);
    }

    if (this.props.maxCharCount && this.props.maxCharCount > 0) {

    }
  }

  handleOnBlur = (event: React.FormEvent<HTMLInputElement>) => {
    if (this.props.onBlur) this.props.onBlur(event);

    if (this.context.formik && this.props.name) {
      this.context.formik.handleBlur(event);
    }
  }

  handleRef = (element: HTMLInputElement) => {
    if (isFunction(this.props.setRef)) {
      this.props.setRef(element);
    }
  }

  render() {
    const { maxCharCount } = this.props;
    let { value, placeholder, error } = this.props;
    const className = this.props['className'];
    const { id, type, name } = this.props;
    const hasError = (!isNil(error) && !isEmpty(error));

    if (this.props.name && this.context.formik && this.context.formik.values[this.props.name]) {
      value = value || this.context.formik.values[this.props.name];
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
          onFocus={this.props.onFocus}
          onBlur={this.handleOnBlur}
          ref={this.handleRef}
          min={this.props.min}
          autoFocus={this.props.autoFocus}
        />

        <div>
          <Error text={error} size="1" />
        </div>

      </Container>
    );
  }
}

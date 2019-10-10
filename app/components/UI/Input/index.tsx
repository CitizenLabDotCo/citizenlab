import React from 'react';
import { isNil, isEmpty, size } from 'lodash-es';
import { FormikConsumer, FormikContext } from 'formik';

// components
import Error from 'components/UI/Error';
import Label from 'components/UI/Label';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { isBoolean } from 'util';

const Container: any = styled.div`
  width: 100%;
  position: relative;

  input {
    width: 100%;
    height: 100%;
    color: ${colors.text};
    font-size: ${fontSizes.base}px;
    line-height: 24px;
    font-weight: 400;
    padding: 12px;
    border-radius: ${(props: any) => props.theme.borderRadius};
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
      color: ${colors.clIconSecondary} !important;
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

const LabelWrapper = styled.div`
  display: flex;
`;

const CharCount = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  text-align: right;
  position: absolute;
  top: 16px;
  right: 10px;

  &.error {
    color: red;
  }
`;

export type InputProps = {
  ariaLabel?: string;
  id?: string | undefined;
  label?: string | JSX.Element | null | undefined;
  value?: string | null | undefined;
  type: 'text' | 'email' | 'password' | 'number' | 'date';
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
  readOnly?: boolean;
  required?: boolean;
  autocomplete?: 'email' | 'given-name' | 'family-name' | 'current-password' | 'new-password'; // https://www.w3.org/TR/WCAG21/#input-purposes
  className?: string;
};

interface DataProps {
  formikContext?: FormikContext<any>;
}

interface Props extends InputProps, DataProps {}

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
    this.props.setRef && this.props.setRef(element);
  }

  render() {
    const { label, ariaLabel, className } = this.props;
    let { value, placeholder, error } = this.props;
    const { formikContext } = this.props;
    const { id, type, name, maxCharCount, min, autoFocus, onFocus, disabled, spellCheck, readOnly, required, autocomplete } = this.props;
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
      <Container error={hasError} className={className || ''}>

        {label &&
          <LabelWrapper>
            <Label htmlFor={id}>{label}</Label>
          </LabelWrapper>
        }

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
          readOnly={readOnly}
          required={required}
          autoComplete={autocomplete}
          {...optionalProps}
        />

        <div>
          <Error className="e2e-input-error" text={error} size="1" />
        </div>

      </Container>
    );
  }
}

export default (inputProps: InputProps) => (
  <FormikConsumer>
    {formikContext => <Input {...inputProps} formikContext={formikContext} />}
  </FormikConsumer>
);

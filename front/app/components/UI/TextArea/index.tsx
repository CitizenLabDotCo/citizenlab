import React from 'react';
import { isEmpty } from 'lodash-es';

// components
import Error from 'components/UI/Error';
import TextareaAutosize from 'react-autosize-textarea';
import { IconTooltip, Label } from 'cl2-component-library';

// style
import styled from 'styled-components';
import { colors, defaultInputStyle, isRtl } from 'utils/styleUtils';

// typings
import { Locale } from 'typings';

const Container = styled.div``;

const TextAreaContainer = styled.div`
  width: 100%;
  position: relative;
  padding: 2px;
  margin-top: -1px;
  margin-left: -1px;

  textarea {
    width: 100%;
    ${defaultInputStyle}
    ${isRtl`
        direction: rtl
    `}
  }
`;

const CharacterCount = styled.p`
  bottom: 0;
  color: ${colors.label};
  margin: 0;
  padding: 0.5rem;
  position: absolute;
  right: 0;

  &.error {
    color: ${colors.clRedError};
  }
`;

export type Props = {
  id?: string | undefined;
  name?: string;
  label?: string | JSX.Element | null | undefined;
  labelTooltipText?: string | JSX.Element | null;
  locale?: Locale;
  value?: string | null;
  placeholder?: string | null | undefined;
  rows?: number | undefined;
  error?: string | null | undefined;
  onChange?: (value: string, locale: Locale | undefined) => void;
  onFocus?: () => void | undefined;
  onBlur?: () => void | undefined;
  autofocus?: boolean | undefined;
  maxCharCount?: number;
  disabled?: boolean;
  focusOnError?: boolean;
  className?: string;
};

interface State {}

export default class TextArea extends React.PureComponent<Props, State> {
  textareaElement: HTMLTextAreaElement | null = null;

  constructor(props) {
    super(props);
    this.textareaElement = null;
  }

  componentDidUpdate(prevProps: Props) {
    const { focusOnError, error } = this.props;

    if (
      focusOnError &&
      error &&
      error !== prevProps.error &&
      this.textareaElement !== null
    ) {
      setTimeout(() => {
        if (this.textareaElement) {
          this.textareaElement.focus();
        }
      }, 50);
    }
  }

  handleOnChange = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const value = this.props.maxCharCount
      ? event.currentTarget.value.substr(0, this.props.maxCharCount)
      : event.currentTarget.value;

    if (this.props.onChange) {
      this.props.onChange(value, this.props.locale);
    }
  };

  handleOnFocus = () => {
    if (this.props.onFocus) {
      this.props.onFocus();
    }
  };

  handleOnBlur = () => {
    if (this.props.onBlur) {
      this.props.onBlur();
    }
  };

  noop = () => {};

  render() {
    const {
      id,
      name,
      label,
      labelTooltipText,
      value,
      rows,
      placeholder,
      error,
      children,
      maxCharCount,
      disabled,
      className,
    } = this.props;

    return (
      <Container className={className}>
        {label && (
          <Label htmlFor={id}>
            <span>{label}</span>
            {labelTooltipText && <IconTooltip content={labelTooltipText} />}
          </Label>
        )}

        <TextAreaContainer className="TextArea">
          <TextareaAutosize
            id={id}
            className={`textarea ${!isEmpty(error) ? 'error' : ''}`}
            name={name || ''}
            rows={rows || 5}
            value={value || ''}
            placeholder={placeholder || undefined}
            onChange={this.handleOnChange}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur}
            disabled={disabled}
          />
          {value && maxCharCount && (
            <CharacterCount
              className={value.length === maxCharCount ? 'error' : ''}
            >
              {value.length} / {maxCharCount}
            </CharacterCount>
          )}
          {children}
        </TextAreaContainer>
        <Error text={error} />
      </Container>
    );
  }
}

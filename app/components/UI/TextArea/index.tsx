import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Error from 'components/UI/Error';
import TextareaAutosize from 'react-autosize-textarea';

// style
import styled, { css } from 'styled-components';

const Container: any = styled.div`
  position: relative;

  .textarea {
    width: 100%;
    color: #333;
    font-size: 17px;
    line-height: 24px;
    font-weight: 400;
    padding: 12px;
    resize: none;
    outline: none;
    position: relative;
    border-radius: 5px;
    border: solid 1px #ccc;
    background: #fff;
    overflow: hidden;
    -webkit-appearance: none;

    &::placeholder {
      color: #aaa;
      opacity: 1;
    }

    &:focus {
      border-color: #333;
    }

    &.error {
      border-color: #fc3c2d !important;

      &:hover,
      &:focus {
        border-color: #fc3c2d !important;
      }
    }
  }
`;

const TextAreaContainer: any = styled.div`
  position: relative;
`;

type Props = {
  name: string;
  value: string;
  placeholder?: string | undefined;
  rows?: number | undefined;
  error?: string | null | undefined;
  onChange?: (arg: string) => void | undefined;
  onFocus?: () => void | undefined;
  onBlur?: () => void | undefined;
};

type State = {};

export default class TextArea extends React.PureComponent<Props, State> {
  textareaElement: HTMLTextAreaElement | null = null;

  constructor(props: Props) {
    super(props as any);
    this.textareaElement = null;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.error && nextProps.error !== this.props.error && this.textareaElement !== null) {
      setTimeout(() => {
        if (this.textareaElement) {
          this.textareaElement.focus();
        }
      }, 50);
    }
  }

  setRef = (element) => {
    this.textareaElement = element;
  }

  handleOnChange = (event: React.FormEvent<HTMLTextAreaElement>) => {
    if (this.props.onChange && _.isFunction(this.props.onChange)) {
      this.props.onChange(event.currentTarget.value);
    }
  }

  handleOnFocus = () => {
    if (this.props.onFocus) {
      this.props.onFocus();
    }
  }

  handleOnBlur = () => {
    if (this.props.onBlur) {
      this.props.onBlur();
    }
  }

  render() {
    let { rows } = this.props;
    const { name, placeholder, value, error, children } = this.props;
    const hasError = (_.isString(error) && !_.isEmpty(error));
    const className = this.props['className'];

    rows = (rows || 5);

    return (
      <Container className={className} hasError={hasError}>
        <TextAreaContainer>
          <TextareaAutosize
            className={`textarea ${hasError ? 'error' : ''}`}
            name={name || ''}
            rows={rows}
            value={value}
            placeholder={placeholder}
            onChange={this.handleOnChange}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur}
            innerRef={this.setRef}
          />
          {children}
        </TextAreaContainer>
        <Error text={error} />
      </Container>
    );
  }
}

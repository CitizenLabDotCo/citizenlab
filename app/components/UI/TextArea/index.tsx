import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Error from 'components/UI/Error';
// import TextareaAutosize from 'react-autosize-textarea';

import { MentionsInput, Mention } from 'react-mentions';

// style
import styled, { css } from 'styled-components';

const Container: any = styled.div`
  position: relative;

  textarea {
    color: #333;
    font-size: 17px;
    line-height: 24px;
    font-weight: 400;
    -webkit-appearance: none;
    border-radius: 5px;
    border: solid 1px #ccc;

    padding: 0 !important;
    margin: 0 !important;
    outline: none !important;
    display: block !important;
    position: relative !important;
    top: auto !important;
    box-sizing: border-box !important;
    background-color: transparent !important;
    width: 100% !important;
    height: 100% !important;
    bottom: auto !important;
    overflow: hidden !important;
    resize: vertical !important;
  }

  /*
  textarea {
    width: 100%;
    color: #333;
    font-size: 17px;
    line-height: 24px;
    font-weight: 400;
    padding: 12px;
    resize: vertical;
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
  */
`;

const TextAreaContainer = styled.div`
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
      setTimeout(() => (this.textareaElement as HTMLElement).focus(), 50);
    }
  }

  setRef = (element) => {
    this.textareaElement = element;
  }

  mentionDisplayTransform = (id, display, type) => {
    return '@' + display;
  }

  handleOnChange = (event) => {
    if (this.props.onChange) {
      this.props.onChange(event.target.value);
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

    const users = [
      {
        id: 'walter',
        display: 'Walter White',
      },
      {
        id: 'jesse',
        display: 'Jesse Pinkman',
      },
      {
        id: 'gus',
        display: 'Gustavo "Gus" Fring',
      },
      {
        id: 'saul',
        display: 'Saul Goodman',
      },
      {
        id: 'hank',
        display: 'Hank Schrader',
      },
      {
        id: 'skyler',
        display: 'Skyler White',
      },
      {
        id: 'mike',
        display: 'Mike Ehrmantraut',
      },
    ];

    return (
      <Container className={className} hasError={hasError}>
        <TextAreaContainer>
          {/*
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
          */}
          <MentionsInput
            className={`textarea ${hasError ? 'error' : ''}`}
            name={name || ''}
            rows={rows}
            value={value}
            placeholder={placeholder}
            displayTransform={this.mentionDisplayTransform}
            onChange={this.handleOnChange}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur}
            ref={this.setRef}
          >
            <Mention trigger="@" data={users} />
          </MentionsInput>
          {children}
        </TextAreaContainer>
        <Error text={error} />
      </Container>
    );
  }
}

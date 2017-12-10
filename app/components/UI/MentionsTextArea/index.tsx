import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { MentionsInput, Mention } from 'react-mentions';

// components
import Error from 'components/UI/Error';

// style
import styled, { css } from 'styled-components';
import { media, color, fontSize as getFontSize } from 'utils/styleUtils';

const Container: any = styled.div`
  position: relative;

  textarea {
    outline: none;
    -webkit-appearance: none;
    border-color: ${(props: any) => props.error ? props.theme.colors.error : '#ccc'} !important;

    &:focus {
      border-color: ${(props: any) => props.error ? props.theme.colors.error : '#999'} !important;
    }
  }
`;

type Props = {
  name: string;
  value: string;
  placeholder?: string | undefined;
  rows: number;
  padding?: string | undefined;
  error?: string | null | undefined;
  onChange?: (arg: string) => void | undefined;
  onFocus?: () => void | undefined;
  onBlur?: () => void | undefined;
};

type State = {};

export default class MentionsTextArea extends React.PureComponent<Props, State> {
  textareaElement: HTMLTextAreaElement | null = null;
  style: object | null;

  constructor(props: Props) {
    super(props as any);
    this.textareaElement = null;
    this.style = null;
  }

  componentWillMount() {
    const { rows } = this.props;
    const lineHeight = 24;
    const padding = (this.props.padding || '25px');

    this.style = {
      '&multiLine': {
        control: {},
        input: {
          padding,
          color: color('text'),
          fontSize: '18px',
          lineHeight: `${lineHeight}px`,
          minHeight: `${rows * lineHeight}px`,
          outline: 0,
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.1)',
          background: '#fff',
          zIndex: 0
        },
        highlighter: {
          background: 'red',
        },
        suggestions: {
          list: {
            backgroundColor: 'white',
            border: '1px solid rgba(0,0,0,0.15)',
            fontSize: 10,
          },
          item: {
            padding: '5px 15px',
            borderBottom: '1px solid rgba(0,0,0,0.15)',
      
            '&focused': {
              backgroundColor: '#cee4e5',
            },
          },
        }
      }
    };
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
    const { name, placeholder, value, error, children, rows } = this.props;
    const hasError = (_.isString(error) && !_.isEmpty(error));
    const className = this.props['className'];

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

    if (this.style) {
      return (
        <Container className={className} hasError={hasError}>
          <MentionsInput
            style={this.style}
            className="textareaWrapper"
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
          <Error text={error} />
        </Container>
      );
    }

    return null;
  }
}

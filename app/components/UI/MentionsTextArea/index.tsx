import React from 'react';
import { isString, isEmpty } from 'lodash';

// libraries
import { MentionsInput, Mention } from 'react-mentions';

// services
import { mentionsStream } from 'services/mentions';

// components
import Error from 'components/UI/Error';

// style
import styled from 'styled-components';
import { color } from 'utils/styleUtils';
import { transparentize } from 'polished';

const Container = styled.div`
  position: relative;

  textarea {
    &:hover {
      border-color: ${(props: any) => props.error ? props.theme.colors.error : '#999'} !important;
    }

    &:focus {
      border-color: ${(props: any) => props.error ? props.theme.colors.error : '#666'} !important;
    }
  }

  .textareaWrapper__suggestions__list li:last-child {
    border: none !important;
  }
`;

type Props = {
  name: string;
  value: string;
  placeholder?: string | undefined;
  rows: number;
  ideaId?: string | undefined
  padding?: string | undefined;
  error?: string | null | undefined;
  onChange?: (arg: string) => void | undefined;
  onFocus?: () => void | undefined;
  onBlur?: () => void | undefined;
};

type State = {
  style: object | null;
  mentionStyle: object | null;
};

export default class MentionsTextArea extends React.PureComponent<Props, State> {
  textareaElement: HTMLTextAreaElement | null = null;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      style: null,
      mentionStyle: null
    };
    this.textareaElement = null;
  }

  componentDidMount() {
    const { rows } = this.props;
    const lineHeight = 24;
    const padding = (this.props.padding || '25px');

    const style = {
      '&multiLine': {
        control: {
          padding: 0,
          margin: 0,
          border: 'none',
          '-webkit-appearance': 'none'
        },
        input: {
          padding,
          margin: 0,
          color: color('text'),
          fontSize: '18px',
          lineHeight: `${lineHeight}px`,
          minHeight: `${rows * lineHeight}px`,
          outline: 'none',
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.1)',
          background: 'transparent',
          '-webkit-appearance': 'none'
        },
        suggestions: {
          list: {
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '5px',
            overflow: 'hidden',
            boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.15)'
          },
          item: {
            fontSize: '15px',
            lineHeight: '22px',
            padding: '5px 15px',
            borderBottom: '1px solid #ccc',

            '&focused': {
              backgroundColor: '#f4f4f4'
            }
          }
        }
      }
    };

    const mentionStyle = {
      backgroundColor: transparentize(0.9, color('clBlue'))
    };

    this.setState({ style, mentionStyle });
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.error && this.props.error !== prevProps.error && this.textareaElement !== null) {
      setTimeout(() => (this.textareaElement as HTMLElement).focus(), 50);
    }
  }

  setRef = (element) => {
    this.textareaElement = element;
  }

  mentionDisplayTransform = (_id, display) => {
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

  getUsers = async (query, callback) => {
    let users: any[] = [];

    if (isString(query) && !isEmpty(query)) {
      const mention = query.toLowerCase();
      const queryParameters = { mention };

      if (this.props.ideaId) {
        queryParameters['idea_id'] = this.props.ideaId;
      }

      const response = await mentionsStream({ queryParameters }).observable.first().toPromise();

      if (response && response.data && response.data.length > 0) {
        users = response.data.map((user) => ({
          display: `${user.attributes.first_name} ${user.attributes.last_name}`,
          id: user.attributes.slug
        }));
      }
    }

    callback(users);
  }

  render() {
    const { style, mentionStyle } = this.state;
    const { name, placeholder, value, error, children, rows } = this.props;
    const className = this.props['className'];

    if (style) {
      return (
        <Container className={className}>
          <MentionsInput
            style={style}
            className="textareaWrapper"
            name={name || ''}
            rows={rows}
            value={value}
            placeholder={placeholder}
            displayTransform={this.mentionDisplayTransform}
            markup={'@[__display__](__id__)'}
            onChange={this.handleOnChange}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur}
            ref={this.setRef}
          >
            <Mention
              trigger="@"
              data={this.getUsers}
              appendSpaceOnAdd={true}
              style={mentionStyle}
            />
          </MentionsInput>
          {children}
          <Error text={error} />
        </Container>
      );
    }

    return null;
  }
}

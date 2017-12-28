import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { MentionsInput, Mention } from 'react-mentions';

// services
import { mentionsStream, IMention, IMentions } from 'services/mentions';

// components
import Error from 'components/UI/Error';

// style
import styled, { css } from 'styled-components';
import { media, color, fontSize as getFontSize } from 'utils/styleUtils';
import { transparentize, darken } from 'polished';

const Container: any = styled.div`
  position: relative;

  textarea {
    -webkit-appearance: none;
    border-color: ${(props: any) => props.error ? props.theme.colors.error : '#ccc'} !important;

    &:focus {
      border-color: ${(props: any) => props.error ? props.theme.colors.error : '#999'} !important;
    }

    background: none !important;
  }

  .textareaWrapper__suggestions__list {
    li:last-child {
      border: none !important;
    }
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

type State = {};

export default class MentionsTextArea extends React.PureComponent<Props, State> {
  textareaElement: HTMLTextAreaElement | null = null;
  style: object | null;
  mentionStyle: object | null;

  constructor(props: Props) {
    super(props as any);
    this.textareaElement = null;
    this.style = null;
    this.mentionStyle = null;
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
          outline: 'none',
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.1)',
          background: 'transparent'
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
              backgroundColor: '#f4f4f4',
            },
          },
        }
      }
    };

    this.mentionStyle = {
      backgroundColor: transparentize(0.9, color('clBlue')),
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

  getUsers = async (query, callback) => {
    let users: any[] = [];

    if (_.isString(query) && !_.isEmpty(query)) {
      const mention = query.toLowerCase();
      const queryParameters = { mention };

      if (this.props.ideaId) {
        queryParameters['idea_id'] = this.props.ideaId;
      }

      const response = await mentionsStream({ queryParameters }).observable.first().toPromise();

      if (response && response.data && response.data.length > 0) {
        users = response.data.map((user, index) => ({
          display: `${user.attributes.first_name} ${user.attributes.last_name}`,
          id: user.attributes.slug
        }));
      }
    }

    callback(users);
  }

  render() {
    const { name, placeholder, value, error, children, rows } = this.props;
    const className = this.props['className'];

    if (this.style) {
      return (
        <Container className={className}>
          <MentionsInput
            style={this.style}
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
              style={this.mentionStyle}
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

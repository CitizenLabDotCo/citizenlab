import React, { PureComponent } from 'react';
import { isString, isEmpty, capitalize } from 'lodash-es';
import { first } from 'rxjs/operators';

// libraries
import { MentionsInput, Mention } from 'react-mentions';

// services
import { mentionsStream } from 'services/mentions';

// components
import Error from 'components/UI/Error';

// style
import styled, { withTheme } from 'styled-components';
import { colors, fontSizes, defaultStyles } from 'utils/styleUtils';
import { transparentize } from 'polished';

// typings
import { Locale } from 'typings';

const Container = styled.div`
  position: relative;
  cursor: text;
  background: #fff;

  & .hasBorder textarea:focus {
    border-color: ${colors.focussedBorder} !important;
    box-shadow: ${defaultStyles.boxShadowFocused} !important;
  }

  & .textareaWrapper__suggestions__list li:last-child {
    border: none !important;
  }

  & .textareaWrapper__highlighter,
  & textarea {
    background: transparent !important;
  }

  & textarea::placeholder {
    opacity: 1 !important;
    color: #767676 !important;
  }

  & .textareaWrapper__highlighter > strong {
    z-index: 2;
  }
`;

const StyledMentionsInput = styled(MentionsInput)`
  word-break: break-word;
`;

export interface InputProps {
  id?: string;
  className?: string;
  name: string;
  value?: string | null;
  locale?: Locale;
  placeholder?: string;
  rows: number;
  postId?: string;
  postType?: 'idea' | 'initiative';
  error?: string | null;
  onChange?: (arg: string, locale: Locale | undefined) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  getTextareaRef?: (element: HTMLTextAreaElement) => void;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  padding?: string;
  border?: string;
  borderRadius?: string;
  boxShadow?: string;
  background?: string;
  ariaLabel?: string;
}

interface Props extends InputProps {
  theme: any;
}

interface State {
  style: object | null;
  mentionStyle: object | null;
}

class MentionsTextArea extends PureComponent<Props, State> {
  textareaElement = React.createRef();

  static defaultProps = {
    color: colors.text,
    fontSize: `${fontSizes.base}px`,
    fontWeight: '400',
    lineHeight: '24px',
    padding: '24px',
    border: `solid 1px ${colors.border}`,
    borderRadius: '3px',
    boxShadow: 'none',
    background: '#fff',
  };

  constructor(props) {
    super(props);
    this.state = {
      style: null,
      mentionStyle: null,
    };
  }

  componentDidMount() {
    const style = this.getStyle();
    const mentionStyle = {
      paddingTop: '3px',
      paddingBottom: '3px',
      paddingLeft: '0px',
      paddingRight: '1px',
      borderRadius: '3px',
      backgroundColor: transparentize(0.85, this.props.theme.colorText),
    };
    this.setState({ style, mentionStyle });
  }

  componentDidUpdate(prevProps: Props, _prevState: State) {
    if (this.props.rows !== prevProps.rows) {
      this.setState({ style: this.getStyle() });
    }
  }

  getStyle = () => {
    const { rows } = this.props;

    const style = {
      '&multiLine': {
        control: {
          padding: 0,
          margin: 0,
          border: 'none',
          appearance: 'none',
          WebkitAppearance: 'none',
        },
        input: {
          margin: 0,
          padding: this.props.padding,
          color: this.props.color,
          fontSize: this.props.fontSize,
          fontWeight: this.props.fontWeight,
          lineHeight: this.props.lineHeight,
          minHeight: `${
            rows * parseInt(this.props.lineHeight as string, 10)
          }px`,
          outline: 'none',
          border: this.props.border,
          borderRadius: this.props.borderRadius,
          boxShadow: this.props.boxShadow,
          background: this.props.background,
          appearance: 'none',
          WebkitAppearance: 'none',
          transition: 'min-height 180ms cubic-bezier(0.165, 0.84, 0.44, 1)',
        },
        suggestions: {
          list: {
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '3px',
            overflow: 'hidden',
            boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.15)',
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
        },
      },
    };

    return style;
  };

  mentionDisplayTransform = (_id, display) => {
    return `@${display}`;
  };

  handleOnChange = (event) => {
    this.props?.onChange?.(event.target.value, this.props.locale);
  };

  handleOnFocus = () => {
    this.props?.onFocus?.();
  };

  handleOnBlur = () => {
    this.props?.onBlur?.();
  };

  setRef = () => {
    if (
      this.textareaElement &&
      this.textareaElement.current &&
      this.props.getTextareaRef
    ) {
      this.props.getTextareaRef(
        this.textareaElement.current as HTMLTextAreaElement
      );
    }
  };

  getUsers = async (query: string, callback) => {
    let users: any[] = [];

    if (isString(query) && !isEmpty(query)) {
      const mention = query.toLowerCase();
      const queryParameters = { mention };
      const { postId, postType } = this.props;

      if (postId && postType) {
        queryParameters['post_id'] = postId;
        queryParameters['post_type'] = capitalize(postType);
      }

      const response = await mentionsStream({ queryParameters })
        .observable.pipe(first())
        .toPromise();

      if (response && response.data && response.data.length > 0) {
        users = response.data.map((user) => ({
          display: `${user.attributes.first_name} ${
            user.attributes.last_name ? user.attributes.last_name : ''
          }`,
          id: user.attributes.slug,
        }));
      }
    }

    callback(users);
  };

  render() {
    const { style, mentionStyle } = this.state;
    const {
      name,
      placeholder,
      value,
      error,
      children,
      rows,
      id,
      className,
      ariaLabel,
    } = this.props;

    if (style) {
      return (
        <Container className={className}>
          <StyledMentionsInput
            id={id}
            style={style}
            className={`textareaWrapper ${
              this.props.border !== 'none' ? 'hasBorder' : 'noBorder'
            }`}
            name={name || ''}
            rows={rows}
            value={value || ''}
            placeholder={placeholder}
            displayTransform={this.mentionDisplayTransform}
            markup={'@[__display__](__id__)'}
            onChange={this.handleOnChange}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur}
            aria-label={ariaLabel}
            ref={this.setRef}
            inputRef={this.textareaElement}
          >
            <Mention
              trigger="@"
              data={this.getUsers}
              appendSpaceOnAdd={true}
              style={mentionStyle}
            />
          </StyledMentionsInput>
          {children}
          <Error text={error} />
        </Container>
      );
    }

    return null;
  }
}

export default withTheme(MentionsTextArea);

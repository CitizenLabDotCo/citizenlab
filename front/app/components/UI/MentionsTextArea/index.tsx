import React, { useRef } from 'react';
import { isString, isEmpty, capitalize } from 'lodash-es';

// libraries
import { MentionsInput, Mention, MentionItem } from 'react-mentions';

// components
import Error from 'components/UI/Error';

// style
import styled, { useTheme } from 'styled-components';
import { colors, fontSizes, defaultStyles } from 'utils/styleUtils';
import { transparentize } from 'polished';

// typings
import { Locale } from 'typings';
import { MentionRoles } from 'api/mentions/types';

import getMentions from 'api/mentions/getMentions';

const Container = styled.div`
  position: relative;
  cursor: text;
  background: #fff;

  & .hasBorder textarea:focus {
    border-color: ${colors.black} !important;
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

export interface Props {
  id?: string;
  className?: string;
  name: string;
  value?: string | null;
  locale?: Locale;
  placeholder?: string;
  rows: number;
  postId?: string;
  postType?: 'idea' | 'initiative';
  error?: JSX.Element | string | null;
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
  children?: React.ReactNode;
  roles?: MentionRoles[];
  trigger?: string;
  onChangeMentions?: (mentions: MentionItem[]) => void;
  // Determines whether we get back the user id or slug
  // in mention of onChangeMentions
  userReferenceType?: 'slug' | 'id';
}

const MentionsTextArea = ({
  color = colors.textPrimary,
  fontSize = `${fontSizes.base}px`,
  fontWeight = '400',
  lineHeight = '24px',
  padding = '24px',
  border = `solid 1px ${colors.borderDark}`,
  borderRadius = '3px',
  boxShadow = 'none',
  background = '#fff',
  rows,
  onChange,
  onChangeMentions,
  onBlur,
  onFocus,
  locale,
  getTextareaRef,
  postId,
  postType,
  id,
  className,
  ariaLabel,
  value,
  placeholder,
  name,
  error,
  children,
  roles,
  trigger = '@',
  userReferenceType = 'slug',
}: Props) => {
  const textareaElement = useRef<HTMLTextAreaElement | null>(null);
  const theme = useTheme();

  const mentionStyle = {
    paddingTop: '3px',
    paddingBottom: '3px',
    paddingLeft: '0px',
    paddingRight: '1px',
    borderRadius: '3px',
    backgroundColor: transparentize(0.85, theme.colors.tenantText),
  };

  const getStyle = () => {
    const style = {
      '&multiLine': {
        control: {
          padding: 0,
          margin: 0,
          border: 'none',
          appearance: 'none',
          WebkitAppearance: 'none',
          minHeight: `${rows * parseInt(lineHeight, 10)}px`,
        },
        input: {
          margin: 0,
          padding,
          color,
          fontSize,
          fontWeight,
          lineHeight,
          minHeight: `${rows * parseInt(lineHeight, 10)}px`,
          outline: 'none',
          border,
          borderRadius,
          boxShadow,
          background,
          appearance: 'none',
          WebkitAppearance: 'none',
          transition: 'min-height 180ms cubic-bezier(0.165, 0.84, 0.44, 1)',
        },
        highlighter: {
          padding,
          fontSize,
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

  const mentionDisplayTransform = (_id, display) => {
    return `${trigger}${display}`;
  };

  const handleOnChange = (event) => {
    onChange?.(event.target.value, locale);
  };

  const handleOnFocus = () => {
    onFocus?.();
  };

  const handleOnBlur = () => {
    onBlur?.();
  };

  const setMentionsInputRef = () => {
    if (textareaElement && textareaElement.current && getTextareaRef) {
      getTextareaRef(textareaElement.current as HTMLTextAreaElement);
    }
  };

  const getUsers = async (
    query: string,
    callback: (users: { id: string; display: string }[]) => void
  ) => {
    let users: { id: string; display: string }[] = [];

    if (isString(query) && !isEmpty(query)) {
      const queryParameters = {
        mention: query.toLowerCase(),
        post_id: postId,
        post_type: capitalize(postType) as 'Idea' | 'Initiative',
        roles,
      };

      const response = await getMentions(queryParameters);

      if (response && response.data && response.data.length > 0) {
        users = response.data.map((user) => ({
          display: `${user.attributes.first_name} ${
            user.attributes.last_name ? user.attributes.last_name : ''
          }`,
          id: userReferenceType === 'slug' ? user.attributes.slug : user.id,
        }));
      }

      callback(users);
    }
  };

  if (getStyle()) {
    return (
      <Container className={className}>
        <StyledMentionsInput
          id={id}
          style={getStyle()}
          className={`textareaWrapper ${
            border !== 'none' ? 'hasBorder' : 'noBorder'
          }`}
          name={name || ''}
          rows={rows}
          value={value || ''}
          placeholder={placeholder}
          onChange={(event, _newValue, _newPlainTextValue, mentions) => {
            handleOnChange(event);
            onChangeMentions?.(mentions);
          }}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          aria-label={ariaLabel}
          ref={setMentionsInputRef}
          inputRef={textareaElement}
          autoFocus={false}
        >
          <Mention
            trigger={trigger}
            data={getUsers}
            appendSpaceOnAdd={true}
            style={mentionStyle}
            displayTransform={mentionDisplayTransform}
            markup={'@[__display__](__id__)'}
          />
        </StyledMentionsInput>
        {children}
        <Error text={error} />
      </Container>
    );
  }

  return null;
};

export default MentionsTextArea;

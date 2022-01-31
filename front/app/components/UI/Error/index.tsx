import React, { useRef, useEffect } from 'react';
import { Icon } from '@citizenlab/cl2-component-library';
import CSSTransition from 'react-transition-group/CSSTransition';
import { isArray, isEmpty, uniqBy } from 'lodash-es';
import styled from 'styled-components';
import { FormattedMessage } from 'utils/cl-intl';
import { darken } from 'polished';
import { CLError, Message } from 'typings';
import { IInviteError } from 'services/invites';
import messages from './messages';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';

const timeout = 350;

const ErrorMessageText = styled.div`
  flex: 1 1 100%;
  color: ${colors.clRedError};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;

  a {
    color: ${colors.clRedError};
    font-weight: 500;
    text-decoration: underline;

    &:hover {
      color: ${darken(0.2, colors.clRedError)};
      text-decoration: underline;
    }
  }

  strong {
    font-weight: 500;
  }
`;

const ErrorIcon = styled(Icon)`
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  fill: ${colors.clRedError};
  padding: 0px;
  margin: 0px;
  margin-right: 10px;

  ${isRtl`
    margin-right: 0;
    margin-left: 10px;
  `}
`;

const ContainerInner = styled.div<{ showBackground: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 13px;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${colors.clRedErrorBackground};
  background: ${(props) =>
    props.showBackground ? colors.clRedErrorBackground : 'transparent'};

  ${isRtl`
    flex-direction: row-reverse;
 `}
`;

const Container = styled.div<{ marginTop: string; marginBottom: string }>`
  position: relative;
  overflow: hidden;

  ${ContainerInner} {
    margin-top: ${(props) => props.marginTop};
    margin-bottom: ${(props) => props.marginBottom};
  }

  &.error-enter {
    max-height: 0px;
    opacity: 0;

    &.error-enter-active {
      max-height: 60px;
      opacity: 1;
      transition: max-height ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1),
        opacity ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.error-exit {
    max-height: 100px;
    opacity: 1;

    &.error-exit-active {
      max-height: 0px;
      opacity: 0;
      transition: max-height ${timeout}ms cubic-bezier(0.19, 1, 0.22, 1),
        opacity ${timeout}ms cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
`;

const ErrorList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ErrorListItem = styled.li`
  display: flex;
  align-items: flex-start;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const Bullet = styled.span`
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  line-height: ${fontSizes.base}px;
  margin-right: 8px;
`;

interface Props {
  marginTop?: string;
  marginBottom?: string;
  showIcon?: boolean;
  showBackground?: boolean;
  className?: string;
  animate?: boolean | undefined;
  text?: string | JSX.Element | null;
  fieldName?: TFieldName | undefined;
  apiErrors?: (CLError | IInviteError)[] | null;
  id?: string;
}

export type TFieldName =
  | 'base'
  | 'title_multiloc'
  | 'sender'
  | 'group_ids'
  | 'reply_to'
  | 'subject_multiloc'
  | 'body_multiloc'
  | 'description_multiloc'
  | 'description_preview_multiloc'
  | 'required'
  | 'input_type'
  | 'slug'
  | 'file'
  | 'token'
  | 'password'
  | 'buttonText'
  | 'showFooter'
  | 'showLogo'
  | 'showHeader'
  | 'relativeLink'
  | 'font'
  | 'accentColor'
  | 'textColor'
  | 'siteBgColor'
  | 'bgColor'
  | 'fontSize'
  | 'headerText'
  | 'headerSubText'
  | 'limit'
  | 'width'
  | 'height'
  | 'first_name'
  | 'last_name'
  | 'confirmation_code'
  | 'email'
  | 'view_name'
  | 'category_name'
  | 'nav_bar_item_title_multiloc';

const Error = (props: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    text,
    apiErrors,
    fieldName,
    marginTop = '3px',
    marginBottom = '0px',
    showIcon = true,
    showBackground = true,
    className = '',
    animate = true,
    id,
  } = props;

  useEffect(() => {
    if (text || apiErrors) {
      containerRef.current &&
        containerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
    }
  }, [text, apiErrors]);

  const findMessage = (fieldName: TFieldName | undefined, error: string) => {
    if (fieldName && messages[`${fieldName}_${error}`]) {
      return messages[`${fieldName}_${error}`] as Message;
    }

    if (messages[error]) {
      return messages[error] as Message;
    }

    return null;
  };

  const dedupApiErrors =
    apiErrors && isArray(apiErrors) && !isEmpty(apiErrors)
      ? uniqBy(apiErrors, 'error')
      : undefined;

  return (
    <CSSTransition
      classNames="error"
      in={!!(text || apiErrors)}
      timeout={timeout}
      mounOnEnter={true}
      unmountOnExit={true}
      enter={animate}
      exit={animate}
    >
      <Container
        className={`e2e-error-message ${className}`}
        id={id}
        marginTop={marginTop}
        marginBottom={marginBottom}
        role="alert"
        data-testid="error-message"
      >
        <ContainerInner
          ref={containerRef}
          showBackground={showBackground}
          className={`${apiErrors && apiErrors.length > 1 && 'isList'}`}
        >
          {showIcon && (
            <ErrorIcon
              title={<FormattedMessage {...messages.error} />}
              name="error"
              ariaHidden
              data-testid="error-icon"
            />
          )}

          <ErrorMessageText data-testid="error-message-text">
            {text && <p>{text}</p>}
            {dedupApiErrors &&
              isArray(dedupApiErrors) &&
              !isEmpty(dedupApiErrors) && (
                <ErrorList>
                  {dedupApiErrors.map((error, index) => {
                    // If we have multiple possible errors for a certain input field,
                    // we can 'group' them in the messages.js file using the fieldName as a prefix
                    // Check the implementation of findMessage for details
                    const errorMessage = findMessage(fieldName, error.error);

                    if (errorMessage) {
                      // Variables for inside messages.js
                      const payload = error?.payload ?? null;
                      const value = error?.value ?? null;
                      const row = error?.row ?? null;
                      const rows = error?.rows ?? null;

                      let values = {
                        row: <strong>{row}</strong>,
                        rows: rows ? <strong>{rows.join(', ')}</strong> : null,
                        // eslint-disable-next-line react/no-unescaped-entities
                        value: <strong>'{value}'</strong>,
                      };

                      values = payload ? { ...payload, ...values } : values;

                      if (value || row || rows) {
                        return (
                          <ErrorListItem key={index}>
                            {dedupApiErrors.length > 1 && (
                              <Bullet aria-hidden>•</Bullet>
                            )}

                            <FormattedMessage
                              {...errorMessage}
                              values={values}
                            />
                          </ErrorListItem>
                        );
                      }

                      return (
                        <ErrorListItem key={index}>
                          {dedupApiErrors.length > 1 && (
                            <Bullet aria-hidden>•</Bullet>
                          )}
                          <FormattedMessage
                            {...errorMessage}
                            values={{
                              ideasCount: (error as CLError).ideas_count,
                            }}
                          />
                        </ErrorListItem>
                      );
                    }

                    return null;
                  })}
                </ErrorList>
              )}
          </ErrorMessageText>
        </ContainerInner>
      </Container>
    </CSSTransition>
  );
};

export default Error;

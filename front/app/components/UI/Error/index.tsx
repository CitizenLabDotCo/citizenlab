import React, { useEffect, useRef } from 'react';

import {
  Box,
  Icon,
  colors,
  fontSizes,
  isRtl,
} from '@citizenlab/cl2-component-library';
import { isArray, isEmpty, uniqBy } from 'lodash-es';
import { darken } from 'polished';
import CSSTransition from 'react-transition-group/CSSTransition';
import styled from 'styled-components';
import { CLError } from 'typings';

import { IAppConfiguration } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IInviteError } from 'api/invites/types';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

const timeout = 350;

const ErrorMessageText = styled.div`
  flex: 1 1 100%;
  color: ${colors.red600};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;

  a {
    color: ${colors.red600};
    font-weight: 500;
    text-decoration: underline;

    &:hover {
      color: ${darken(0.2, colors.red600)};
      text-decoration: underline;
    }
  }

  strong {
    font-weight: 500;
  }
`;

const ErrorIcon = styled(Icon)`
  flex: 0 0 24px;
  fill: ${colors.red600};
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
  padding: 0px 13px;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${colors.errorLight};
  background: ${(props) =>
    props.showBackground ? colors.errorLight : 'transparent'};

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
`;

const Bullet = styled.span`
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  line-height: ${fontSizes.base}px;
  margin-right: 8px;
`;

export interface ErrorProps {
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
  scrollIntoView?: boolean;
}

export interface TFieldNameMap {
  base: 'base';
  title_multiloc: 'title_multiloc';
  sender: 'sender';
  group_ids: 'group_ids';
  reply_to: 'reply_to';
  subject_multiloc: 'subject_multiloc';
  body_multiloc: 'body_multiloc';
  description_multiloc: 'description_multiloc';
  description_preview_multiloc: 'description_preview_multiloc';
  required: 'required';
  input_type: 'input_type';
  slug: 'slug';
  file: 'file';
  token: 'token';
  password: 'password';
  buttonText: 'buttonText';
  showFooter: 'showFooter';
  showLogo: 'showLogo';
  relativeLink: 'relativeLink';
  font: 'font';
  accentColor: 'accentColor';
  textColor: 'textColor';
  siteBgColor: 'siteBgColor';
  bgColor: 'bgColor';
  fontSize: 'fontSize';
  headerText: 'headerText';
  headerSubText: 'headerSubText';
  limit: 'limit';
  width: 'width';
  height: 'height';
  first_name: 'first_name';
  last_name: 'last_name';
  confirmation_code: 'confirmation_code';
  email: 'email';
  nav_bar_item_title_multiloc: 'nav_bar_item_title_multiloc';
  banner_cta_button_multiloc: 'banner_cta_button_multiloc';
  banner_cta_button_url: 'banner_cta_button_url';
  tag_name: 'tag_name';
  maximum_attendees: 'maximum_attendees';
}

export type TFieldName = TFieldNameMap[keyof TFieldNameMap];

export const findErrorMessage = (
  fieldName: TFieldName | undefined,
  error: string
) => {
  if (fieldName && messages[`${fieldName}_${error}`]) {
    return messages[`${fieldName}_${error}`] as MessageDescriptor;
  }

  if (messages[error]) {
    return messages[error] as MessageDescriptor;
  }
  // Return a empty error message
  return '';
};

// Get the variables to use inside API error messages
export const getApiErrorValues = (
  error: CLError | IInviteError,
  appConfiguration?: IAppConfiguration
) => {
  const payload = error.payload ?? null;
  const supportEmail =
    (error as any)?.inviter_email ??
    appConfiguration?.data.attributes.settings.core.reply_to_email;

  const values = {
    row: error.row ?? '',
    rows: error.rows?.join(', ') ?? '',
    value: error.value ?? '',
    supportEmail: supportEmail ?? '',
    ideasCount: (error as CLError).ideas_count ?? '',
  };

  return payload ? { ...payload, ...values } : values;
};

const Error = (props: ErrorProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { data: appConfiguration } = useAppConfiguration();

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
    scrollIntoView = true,
  } = props;

  useEffect(() => {
    if (scrollIntoView) {
      containerRef.current?.scrollIntoView &&
        containerRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
    }
  }, [scrollIntoView]);

  if (!appConfiguration) return null;

  const dedupApiErrors =
    apiErrors && isArray(apiErrors) && !isEmpty(apiErrors)
      ? uniqBy(apiErrors, 'error')
      : undefined;

  return (
    <CSSTransition
      classNames="error"
      in={!!(text || apiErrors)}
      timeout={timeout}
      mountOnEnter={true}
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
              name="alert-circle"
              fill={colors.error}
              data-testid="error-icon"
            />
          )}

          <ErrorMessageText data-testid="error-message-text">
            <Box py="16px">
              {text}
              {dedupApiErrors &&
                isArray(dedupApiErrors) &&
                !isEmpty(dedupApiErrors) && (
                  <ErrorList>
                    {dedupApiErrors.map((error, index) => {
                      // If we have multiple possible errors for a certain input field,
                      // we can 'group' them in the messages.js file using the fieldName as a prefix
                      // Check the implementation of findErrorMessage for details
                      const errorMessage = findErrorMessage(
                        fieldName,
                        error.error
                      );

                      if (errorMessage) {
                        // Variables for inside messages.js
                        const values = getApiErrorValues(
                          error,
                          appConfiguration
                        );

                        if (values.value || values.row || values.rows) {
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
                              values={values}
                            />
                          </ErrorListItem>
                        );
                      }

                      return null;
                    })}
                  </ErrorList>
                )}
            </Box>
          </ErrorMessageText>
        </ContainerInner>
      </Container>
    </CSSTransition>
  );
};

export default Error;

import React, { useContext } from 'react';
import { Box, Icon } from 'cl2-component-library';
import CSSTransition from 'react-transition-group/CSSTransition';
import styled from 'styled-components';
import { FormattedMessage } from 'utils/cl-intl';
import { darken } from 'polished';
import messages from './messages';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';
import { getDefaultApiErrorMessage } from 'utils/errorUtils';
import { APIErrorsContext, FormContext } from '.';
import { getFieldNameFromPath } from 'utils/JSONFormUtils';
import Link from 'utils/cl-router/Link';

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

const ContainerInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 13px;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${colors.clRedErrorBackground};

  ${isRtl`
    flex-direction: row-reverse;
 `}
`;

const Container = styled(Box)`
  position: relative;
  overflow: hidden;

  ${ContainerInner} {
    margin-top: 3px;
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
  fieldPath: string;
  ajvErrors?: string;
  className?: string;
  didBlur?: boolean;
}

export default ({ fieldPath, ajvErrors, didBlur }: Props) => {
  // shows ajv errors
  // shows apiErrors whenever present, along ajv errors.

  const { getApiErrorMessage, showAllErrors } = useContext(FormContext);

  const fieldName = getFieldNameFromPath(fieldPath);
  const allApiErrors = useContext(APIErrorsContext);

  const fieldErrors = [
    ...(allApiErrors?.[fieldName] || []),
    ...(allApiErrors?.base?.filter(
      (err) =>
        err.error === 'includes_banned_words' &&
        err?.blocked_words?.find((e) => e?.attribute === fieldName)
    ) || []),
  ];

  const dedupApiErrors = [...new Set(fieldErrors)];

  const show =
    (showAllErrors || didBlur === undefined || didBlur === true) &&
    Boolean(ajvErrors?.length || fieldErrors?.length);

  return (
    <CSSTransition
      classNames="error"
      in={show}
      timeout={timeout}
      mounOnEnter={true}
      unmountOnExit={true}
      enter={true}
      exit={true}
    >
      <Container role="alert">
        <ContainerInner>
          <ErrorIcon
            title={<FormattedMessage {...messages.error} />}
            name="error"
            ariaHidden
          />

          <ErrorMessageText>
            <ErrorList>
              {ajvErrors && (
                <ErrorListItem key={'FEVal'}>
                  {dedupApiErrors?.length > 0 && <Bullet aria-hidden>•</Bullet>}
                  {ajvErrors}
                </ErrorListItem>
              )}

              {dedupApiErrors?.map((error, index) => (
                <ErrorListItem key={index}>
                  {(dedupApiErrors.length > 1 ||
                    (ajvErrors && dedupApiErrors.length === 1)) && (
                    <Bullet aria-hidden>•</Bullet>
                  )}

                  <FormattedMessage
                    {...(getApiErrorMessage(error.error, fieldName) ||
                      getDefaultApiErrorMessage(error.error, fieldName))}
                    values={{
                      ...error,
                      row: <strong>{error?.row}</strong>,
                      rows: error?.rows ? (
                        <strong>{error?.rows.join(', ')}</strong>
                      ) : null,
                      // eslint-disable-next-line react/no-unescaped-entities
                      value: <strong>'{error?.value}'</strong>,
                      guidelinesLink: (
                        <Link to="/pages/faq" target="_blank">
                          <FormattedMessage {...messages.guidelinesLinkText} />
                        </Link>
                      ),
                    }}
                  />
                </ErrorListItem>
              ))}
            </ErrorList>
          </ErrorMessageText>
        </ContainerInner>
      </Container>
    </CSSTransition>
  );
};

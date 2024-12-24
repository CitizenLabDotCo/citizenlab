import React, { useContext, useEffect, useState } from 'react';

import {
  Box,
  Icon,
  colors,
  fontSizes,
  isRtl,
} from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import CSSTransition from 'react-transition-group/CSSTransition';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { getDefaultApiErrorMessage } from 'utils/errorUtils';
import { getFieldNameFromPath } from 'utils/JSONFormUtils';

import { APIErrorsContext, FormContext } from '../contexts';
import messages from '../messages';

import { useErrorToRead } from './Fields/ErrorToReadContext';

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

const ContainerInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 13px;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${colors.errorLight};

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
  didBlur?: boolean;
  inputId: string;
}
const ErrorDisplay = ({ fieldPath, ajvErrors, didBlur, inputId }: Props) => {
  // shows ajv errors
  // shows apiErrors whenever present, along ajv errors.
  const { getApiErrorMessage, showAllErrors } = useContext(FormContext);
  const allApiErrors = useContext(APIErrorsContext);
  const [errorMessageKey, setErrorMessageKey] = useState(0);
  const { errorToReadId } = useErrorToRead();

  const fieldName = getFieldNameFromPath(fieldPath);
  const fieldErrors = [
    ...(allApiErrors?.[fieldName] || []),
    ...(allApiErrors?.base?.filter(
      (err) =>
        err.error === 'includes_banned_words' &&
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        err?.blocked_words?.find((e) => e?.attribute === fieldName)
    ) || []),
  ];

  const dedupApiErrors = [...new Set(fieldErrors)];

  const show =
    (showAllErrors || didBlur === undefined || didBlur === true) &&
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    Boolean(ajvErrors?.length || fieldErrors?.length);

  useEffect(() => {
    if (errorToReadId === `error-display-${inputId}`) {
      // Trigger re-render to force screen reader to re-read the error
      setErrorMessageKey((prev) => prev + 1);
    }
  }, [errorToReadId, inputId]);

  return (
    <CSSTransition
      classNames="error"
      in={show}
      timeout={timeout}
      mountOnEnter={true}
      unmountOnExit={true}
      enter={true}
      exit={true}
    >
      <Container
        role="alert"
        className="e2e-error-message error-display-container"
        id={`error-display-${inputId}`}
        aria-describedby={inputId}
        aria-live="polite"
        key={`error-display-${inputId}-${errorMessageKey}`}
      >
        <ContainerInner>
          <ErrorIcon name="alert-circle" fill={colors.error} />

          <ErrorMessageText>
            <ErrorList>
              {ajvErrors && (
                <ErrorListItem key={'FEErrors'}>
                  {/* TODO: Fix this the next time the file is edited. */}
                  {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
                  {dedupApiErrors?.length > 0 && <Bullet aria-hidden>•</Bullet>}
                  {ajvErrors}
                </ErrorListItem>
              )}

              {/* TODO: Fix this the next time the file is edited. */}
              {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
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
                      // TODO: Fix this the next time the file is edited.
                      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                      row: <strong>{error?.row}</strong>,
                      // TODO: Fix this the next time the file is edited.
                      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                      rows: error?.rows ? (
                        // TODO: Fix this the next time the file is edited.
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        <strong>{error?.rows.join(', ')}</strong>
                      ) : null,
                      // eslint-disable-next-line react/no-unescaped-entities, @typescript-eslint/no-unnecessary-condition
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

export default ErrorDisplay;

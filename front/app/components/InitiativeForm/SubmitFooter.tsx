import { ScreenReaderOnly } from 'utils/a11y';
import ContentContainer from 'components/ContentContainer';
import styled, { withTheme } from 'styled-components';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import Button from 'components/UI/Button';
import { colors, media } from 'utils/styleUtils';
import React, { memo } from 'react';
import messages from './messages';

interface FormSubmitFooterProps {
  disabled?: boolean;
  processing?: boolean;
  onSubmit: () => void;
  theme: any;
  className?: string;
  error: boolean;
  errorMessage: MessageDescriptor;
  message: MessageDescriptor;
}

const StyledButton = styled(Button)`
  margin-right: 10px;
`;

const SubmitFooterContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: white;
  border-top: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  z-index: 1;
  ${media.tablet`
    align-items: center;
  `}
`;
const StyledContentContainer = styled(ContentContainer)`
  ${media.tablet`
    max-width: 620px;
  `}
`;

const SubmitFooterInner = styled.div`
  width: 100%;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  padding-bottom: 12px;
  background: #fff;

  ${media.phone`
    padding: 10px;
  `}
`;

const ErrorContainer = styled.div`
  color: ${colors.red600};
`;
export const FormSubmitFooter = withTheme(
  memo(
    ({
      message,
      theme,
      onSubmit,
      className,
      error,
      errorMessage,
      disabled,
      ...otherProps
    }: FormSubmitFooterProps) => (
      <SubmitFooterContainer className={className}>
        <StyledContentContainer mode="page">
          <SubmitFooterInner>
            <StyledButton
              fontWeight="500"
              padding="13px 22px"
              bgColor={theme.colors.tenantPrimary}
              textColor="#FFF"
              type="submit"
              onClick={onSubmit}
              className="e2e-submit-form"
              disabled={disabled}
              ariaDisabled={disabled}
              {...otherProps}
            >
              <FormattedMessage {...message} />
            </StyledButton>
            {error && (
              <ErrorContainer className="e2e-error-form">
                <FormattedMessage {...errorMessage} />
              </ErrorContainer>
            )}
            <ScreenReaderOnly aria-live="polite">
              {disabled ? (
                <FormattedMessage {...messages.buttonDisabled} />
              ) : (
                <FormattedMessage {...messages.buttonEnabled} />
              )}
            </ScreenReaderOnly>
          </SubmitFooterInner>
        </StyledContentContainer>
      </SubmitFooterContainer>
    )
  )
);

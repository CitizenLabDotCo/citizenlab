import ContentContainer from 'components/ContentContainer';
import Button from 'components/UI/Button';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { useTheme } from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';
import { colors, media } from 'utils/styleUtils';
import messages from './messages';

interface FormSubmitFooterProps {
  disabled?: boolean;
  processing?: boolean;
  onSubmit: () => void;
  className?: string;
  error: boolean;
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
  ${media.smallerThanMaxTablet`
    align-items: center;
  `}
`;
const StyledContentContainer = styled(ContentContainer)`
  ${media.smallerThanMaxTablet`
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

  ${media.smallerThanMinTablet`
    padding: 10px;
  `}
`;

const ErrorContainer = styled.div`
  color: ${colors.red600};
`;

export const FormSubmitFooter = ({
  onSubmit,
  className,
  error,
  disabled,
  ...otherProps
}: FormSubmitFooterProps) => {
  const theme: any = useTheme();
  const { formatMessage } = useIntl();

  return (
    <SubmitFooterContainer className={className}>
      <StyledContentContainer mode="page">
        <SubmitFooterInner>
          <StyledButton
            fontWeight="500"
            padding="13px 22px"
            bgColor={theme.colorMain}
            textColor="#FFF"
            type="submit"
            onClick={onSubmit}
            className="e2e-submit-form"
            disabled={disabled}
            ariaDisabled={disabled}
            {...otherProps}
          >
            {formatMessage(messages.publishButton)}
          </StyledButton>
          {error && (
            <ErrorContainer className="e2e-error-form">
              {formatMessage(messages.submitApiError)}
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
  );
};

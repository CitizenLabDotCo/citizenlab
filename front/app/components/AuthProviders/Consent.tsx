import React, { memo } from 'react';

// components
import Link from 'utils/cl-router/Link';
import Checkbox from 'components/UI/Checkbox';
import Error from 'components/UI/Error';
import { AuthProvider } from 'components/AuthProviders';
import { Box } from '@citizenlab/cl2-component-library';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  gap: 15px;
  flex-direction: column;
  align-items: stretch;
`;

const ConsentText = styled.div`
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.s}px;
  line-height: 21px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  a {
    color: ${(props) => props.theme.colors.tenantText};
    font-weight: 400;
    text-decoration: underline;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;

    &:hover {
      color: #000;
      text-decoration: underline;
    }
  }
`;

interface Props {
  termsAndConditionsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  termsAndConditionsError: boolean;
  privacyPolicyError: boolean;
  onTacAcceptedChange: (tacAccepted: boolean) => void;
  onPrivacyAcceptedChange: (privacyAccepted: boolean) => void;
  authProvider: AuthProvider;
  className?: string;
}

const Consent = memo(
  ({
    className,
    intl: { formatMessage },
    privacyPolicyError,
    termsAndConditionsError,
    termsAndConditionsAccepted,
    privacyPolicyAccepted,
    onTacAcceptedChange,
    onPrivacyAcceptedChange,
  }: Props & WrappedComponentProps) => {
    const handleTermsAndConditionsOnChange = () => {
      onTacAcceptedChange(!termsAndConditionsAccepted);
    };

    const handlePrivacyPolicyOnChange = () => {
      onPrivacyAcceptedChange(!privacyPolicyAccepted);
    };

    return (
      <Container className={className}>
        <Box id="e2e-terms-and-conditions-container">
          <Checkbox
            className="e2e-terms-and-conditions"
            size="20px"
            checked={termsAndConditionsAccepted}
            onChange={handleTermsAndConditionsOnChange}
            label={
              <ConsentText>
                <FormattedMessage
                  {...messages.iHaveReadAndAgreeTo}
                  values={{
                    link: (
                      <Link target="_blank" to="/pages/terms-and-conditions">
                        <FormattedMessage {...messages.theTermsAndConditions} />
                      </Link>
                    ),
                  }}
                />
              </ConsentText>
            }
          />
          <Error
            text={
              termsAndConditionsError ? formatMessage(messages.tacError) : null
            }
          />
        </Box>

        <Box id="e2e-privacy-container">
          <Checkbox
            className="e2e-privacy-checkbox"
            size="20px"
            checked={privacyPolicyAccepted}
            onChange={handlePrivacyPolicyOnChange}
            label={
              <ConsentText>
                <FormattedMessage
                  {...messages.iHaveReadAndAgreeTo}
                  values={{
                    link: (
                      <Link target="_blank" to="/pages/privacy-policy">
                        <FormattedMessage {...messages.thePrivacyPolicy} />
                      </Link>
                    ),
                  }}
                />
              </ConsentText>
            }
          />
          <Error
            text={
              privacyPolicyError
                ? formatMessage(messages.privacyPolicyNotAcceptedError)
                : null
            }
          />
        </Box>

        <ConsentText>
          <FormattedMessage {...messages.emailConsent} />
        </ConsentText>
      </Container>
    );
  }
);

export default injectIntl(Consent);

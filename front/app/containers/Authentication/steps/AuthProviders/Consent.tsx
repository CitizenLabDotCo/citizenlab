import React, { memo } from 'react';

import { Box, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import Checkbox from 'components/UI/Checkbox';
import Error from 'components/UI/Error';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

const Container = styled.div`
  display: flex;
  gap: 15px;
  flex-direction: column;
  align-items: stretch;
`;

export const ConsentText = styled.div`
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

const BoldConsentText = styled(ConsentText)`
  font-weight: bold;
`;

interface Props {
  termsAndConditionsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  termsAndConditionsError?: boolean;
  privacyPolicyError?: boolean;
  onTacAcceptedChange: (tacAccepted: boolean) => void;
  onPrivacyAcceptedChange: (privacyAccepted: boolean) => void;
  isViennaAuth?: boolean;
  className?: string;
}

const Consent = memo(
  ({
    className,
    privacyPolicyError,
    termsAndConditionsError,
    termsAndConditionsAccepted,
    privacyPolicyAccepted,
    onTacAcceptedChange,
    onPrivacyAcceptedChange,
    isViennaAuth,
  }: Props) => {
    const { formatMessage } = useIntl();

    const handleTermsAndConditionsOnChange = () => {
      onTacAcceptedChange(!termsAndConditionsAccepted);
    };

    const handlePrivacyPolicyOnChange = () => {
      onPrivacyAcceptedChange(!privacyPolicyAccepted);
    };

    if (isViennaAuth) {
      return (
        <Container className={className}>
          <ConsentText>
            <FormattedMessage
              {...messages.viennaConsentHeader}
              values={{ br: <br /> }}
            />
            <ul>
              <li>{formatMessage(messages.viennaConsentEmail)}</li>
              <li>{formatMessage(messages.viennaConsentFirstName)}</li>
              <li>{formatMessage(messages.viennaConsentLastName)}</li>
              <li>{formatMessage(messages.viennaConsentUserName)}</li>
            </ul>
            <FormattedMessage {...messages.viennaConsentFooter} />
          </ConsentText>

          <BoldConsentText>
            <FormattedMessage
              {...messages.iHaveReadAndAgreeToVienna}
              values={{
                link: (
                  <Link target="_blank" to="/pages/privacy-policy">
                    <FormattedMessage {...messages.viennaDataProtection} />
                  </Link>
                ),
              }}
            />
          </BoldConsentText>
        </Container>
      );
    } else {
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
                    {...messages.iHaveReadAndAgreeToTerms}
                    values={{
                      link: (
                        <Link target="_blank" to="/pages/terms-and-conditions">
                          <FormattedMessage
                            {...messages.theTermsAndConditions}
                          />
                        </Link>
                      ),
                    }}
                  />
                </ConsentText>
              }
            />
            <Error
              text={
                termsAndConditionsError
                  ? formatMessage(messages.tacError)
                  : null
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
                    {...messages.iHaveReadAndAgreeToPrivacy}
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
  }
);

export default Consent;

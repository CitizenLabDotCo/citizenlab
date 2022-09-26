import React, { memo } from 'react';

// components
import Checkbox from 'components/UI/Checkbox';
import Error from 'components/UI/Error';
import Link from 'utils/cl-router/Link';

// i18n
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const CheckboxWrapper = styled.div`
  margin-bottom: 15px;
`;

const ConsentText = styled.div`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.s}px;
  line-height: 21px;
  font-weight: 300;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  a {
    color: ${(props: any) => props.theme.colorText};
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
        <CheckboxWrapper id="e2e-terms-and-conditions-container">
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
        </CheckboxWrapper>

        <CheckboxWrapper id="e2e-privacy-container">
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
        </CheckboxWrapper>

        <ConsentText>
          <FormattedMessage {...messages.emailConsent} />
        </ConsentText>
      </Container>
    );
  }
);

export default injectIntl(Consent);

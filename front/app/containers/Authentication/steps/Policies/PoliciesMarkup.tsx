import React from 'react';

import { Box, Text, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import authProvidersMessages from 'containers/Authentication/steps/_components/AuthProviderButton/messages';

import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';
import ManualCampaignConsent from 'components/SmsConsent/ManualCampaignConsent';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

export const ConsentText = styled.div`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.s}px;
  line-height: 21px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  a {
    color: ${({ theme }) => theme.colors.tenantText};
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
  showByContinuingText?: boolean;
  showSmsManualCampaignConsent?: boolean;
  byContinuingCopy?: string;
}

const PoliciesMarkup = ({
  showByContinuingText = true,
  showSmsManualCampaignConsent = false,
  byContinuingCopy,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Box id="e2e-policies-container">
        <CheckboxWithLabel
          name="policiesAccepted"
          dataTestId="policiesAccepted"
          required
          label={
            <ConsentText>
              <FormattedMessage
                {...authProvidersMessages.iHaveReadAndAgreeToTermsAndPrivacy}
                values={{
                  termsLink: (
                    <Link
                      target="_blank"
                      to="/pages/$slug"
                      params={{ slug: 'terms-and-conditions' }}
                    >
                      <FormattedMessage
                        {...authProvidersMessages.theTermsAndConditions}
                      />
                    </Link>
                  ),
                  privacyLink: (
                    <Link
                      target="_blank"
                      to="/pages/$slug"
                      params={{ slug: 'privacy-policy' }}
                    >
                      <FormattedMessage
                        {...authProvidersMessages.thePrivacyPolicy}
                      />
                    </Link>
                  ),
                }}
              />
            </ConsentText>
          }
        />
      </Box>
      {showSmsManualCampaignConsent && (
        <Box mt="8px">
          <ManualCampaignConsent />
        </Box>
      )}
      {showByContinuingText && (
        <Text
          id="email-consent-description"
          mt="24px"
          mb="0px"
          fontSize="s"
          color="tenantText"
        >
          {byContinuingCopy ?? formatMessage(messages.byContinuing)}
        </Text>
      )}
    </>
  );
};

export default PoliciesMarkup;

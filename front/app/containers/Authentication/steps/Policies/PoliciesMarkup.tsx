import React from 'react';

import { Box, Text, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import authProvidersMessages from 'containers/Authentication/steps/_components/AuthProviderButton/messages';

import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';

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
}

const PoliciesMarkup = ({ showByContinuingText = true }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Box id="e2e-terms-conditions-container">
        <CheckboxWithLabel
          name="termsAndConditionsAccepted"
          dataTestId="termsAndConditionsAccepted"
          label={
            <ConsentText>
              <FormattedMessage
                {...authProvidersMessages.iHaveReadAndAgreeToTerms}
                values={{
                  link: (
                    <Link target="_blank" to="/pages/terms-and-conditions">
                      <FormattedMessage
                        {...authProvidersMessages.theTermsAndConditions}
                      />
                    </Link>
                  ),
                }}
              />
            </ConsentText>
          }
        />
      </Box>
      <Box mt="8px" id="e2e-privacy-policy-container">
        <CheckboxWithLabel
          name="privacyPolicyAccepted"
          dataTestId="privacyPolicyAccepted"
          label={
            <ConsentText>
              <FormattedMessage
                {...authProvidersMessages.iHaveReadAndAgreeToPrivacy}
                values={{
                  link: (
                    <Link target="_blank" to="/pages/privacy-policy">
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
      {showByContinuingText && (
        <Text mt="24px" mb="0px" fontSize="s" color="tenantText">
          {formatMessage(messages.byContinuing)}
        </Text>
      )}
    </>
  );
};

export default PoliciesMarkup;

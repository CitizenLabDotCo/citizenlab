import React from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// i18n
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import authProvidersMessages from 'containers/Authentication/steps/AuthProviders/messages';

// form
import Checkbox from 'components/HookForm/Checkbox';

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

const PoliciesMarkup = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Box id="e2e-terms-conditions-container">
        <Checkbox
          name="termsAndConditionsAccepted"
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
        <Checkbox
          name="privacyPolicyAccepted"
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
      <Text mt="24px" mb="0px" fontSize="s" color="tenantText">
        {formatMessage(messages.byContinuing)}
      </Text>
    </>
  );
};

export default PoliciesMarkup;

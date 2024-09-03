import React from 'react';

import { Box, Text, Button } from '@citizenlab/cl2-component-library';

import useAccessDeniedExplanation from 'api/access_denied_explanation/useAccessDeniedExplanation';

import useLocalize from 'hooks/useLocalize';

import { AuthenticationData } from 'containers/Authentication/typings';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  authenticationData: AuthenticationData;
  onClose: () => void;
}

const AccessDenied = ({ authenticationData, onClose }: Props) => {
  const localize = useLocalize();
  const { data } = useAccessDeniedExplanation(authenticationData.context);

  if (!data) return null;

  const accessDeniedExplanation: string | undefined = localize(
    data.data.attributes.access_denied_explanation_multiloc
  );

  const isEmpty =
    !accessDeniedExplanation || accessDeniedExplanation.length === 0;

  return (
    <Box>
      <Text mt="12px">
        {isEmpty ? (
          <FormattedMessage {...messages.youDoNotMeetTheRequirements} />
        ) : (
          <>{accessDeniedExplanation}</>
        )}
      </Text>
      <Box w="100%" display="flex" justifyContent="flex-end">
        <Button w="auto" mt="16px" buttonStyle="primary" onClick={onClose}>
          <FormattedMessage {...messages.close} />
        </Button>
      </Box>
    </Box>
  );
};

export default AccessDenied;

import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import { getMailLink } from './utils';

interface Props {
  ideaId: string;
}

const SubmissionReference = ({ ideaId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();

  return (
    <Box w="100%" p="24px">
      <Text color="tenantText">
        <FormattedMessage {...messages.ifYouLaterDecide} />
      </Text>
      <Text
        color="tenantText"
        fontWeight="bold"
        id="idea-id-success-modal"
        mb="8px"
      >
        {ideaId}
      </Text>
      <Box w="100%" display="flex">
        <ButtonWithLink
          linkTo={getMailLink({
            email: authUser?.data.attributes.email,
            subject: formatMessage(messages.surveySubmission),
            body: formatMessage(messages.yourResponseHasTheFollowingId, {
              identifier: ideaId,
            }),
          })}
          buttonStyle="text"
          w="auto"
          icon="email"
          paddingLeft="0"
        >
          <FormattedMessage {...messages.sendSurveySubmission} />
        </ButtonWithLink>
      </Box>
    </Box>
  );
};

export default SubmissionReference;

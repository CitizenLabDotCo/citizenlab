import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Warning from 'components/UI/Warning';

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
    <Warning hideIcon>
      <Box display="flex" flexDirection="column" alignItems="flex-start">
        <Text mb="0" color="tenantText">
          <FormattedMessage {...messages.ifYouLaterDecide} />
        </Text>
        <Text
          color="tenantText"
          fontWeight="bold"
          id="idea-id-success-modal"
          mb="0"
        >
          {ideaId}
        </Text>
        <ButtonWithLink
          p="0"
          linkTo={getMailLink({
            email: authUser?.data.attributes.email,
            subject: formatMessage(messages.surveySubmission),
            body: formatMessage(messages.yourResponseHasTheFollowingId, {
              identifier: ideaId,
            }),
          })}
          buttonStyle="text"
          icon="email"
          iconSize="20px"
        >
          <Text fontSize="s" color="primary">
            <FormattedMessage {...messages.sendSurveySubmission} />
          </Text>
        </ButtonWithLink>
      </Box>
    </Warning>
  );
};

export default SubmissionReference;

import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import { getMailLink } from './utils';

interface Props {
  ideaId?: string;
  showIdeaId?: boolean;
}

const NativeSurveyModalContent = ({ ideaId, showIdeaId }: Props) => {
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();

  return (
    <Box>
      <Title variant="h2" textAlign="center" mt="0">
        <FormattedMessage
          {...messages.onSurveySubmission}
          data-cy="e2e-survey-success-message"
        />
      </Title>
      {ideaId && showIdeaId && (
        <>
          <Text textAlign="center" color="coolGrey600">
            <FormattedMessage {...messages.ifYouLaterDecide} />
          </Text>
          <Text
            textAlign="center"
            color="tenantPrimary"
            fontWeight="bold"
            id="idea-id-success-modal"
            mb="8px"
          >
            {ideaId}
          </Text>
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
          >
            <FormattedMessage {...messages.sendSurveySubmission} />
          </ButtonWithLink>
        </>
      )}
    </Box>
  );
};

export default NativeSurveyModalContent;

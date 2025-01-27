import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import { getMailLink } from './utils';
import { Multiloc } from 'typings';
import useLocalize from 'hooks/useLocalize';

interface Props {
  ideaId?: string;
  showIdeaId?: boolean;
  successMessage?: Multiloc;
}

const NativeSurveyModalContent = ({
  ideaId,
  showIdeaId,
  successMessage,
}: Props) => {
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const successMessageDisplay =
    localize(successMessage) || formatMessage(messages.onSurveySubmission);

  return (
    <Box>
      <Title variant="h2" textAlign="center" mt="0">
        <Box data-cy="e2e-survey-success-message">{successMessageDisplay}</Box>
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

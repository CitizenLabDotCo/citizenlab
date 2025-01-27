import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useAuthUser from 'api/me/useAuthUser';

import useLocalize from 'hooks/useLocalize';

import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import { getMailLink } from './utils';

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

  const customSuccessMessage = !!localize(successMessage);

  return (
    <Box>
      {customSuccessMessage ? (
        <QuillEditedContent>
          <T value={successMessage} supportHtml={true} />
        </QuillEditedContent>
      ) : (
        <Title variant="h2" textAlign="center" mt="0">
          <Box data-cy="e2e-survey-success-message">
            <FormattedMessage {...messages.onSurveySubmission} />
          </Box>
        </Title>
      )}
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

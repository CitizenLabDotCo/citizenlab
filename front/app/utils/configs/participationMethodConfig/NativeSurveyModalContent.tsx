import React from 'react';

import { Box, Title, Text } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

import { getMailLink } from './utils';

interface Props {
  ideaId?: string;
  showIdeaId?: boolean;
}

const NativeSurveyModalContent = ({ ideaId, showIdeaId }: Props) => {
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
          >
            {ideaId}
          </Text>
          <ButtonWithLink linkTo={getMailLink(ideaId, 'Identifier: ')}>
            Mail survey identifier
          </ButtonWithLink>
        </>
      )}
    </Box>
  );
};

export default NativeSurveyModalContent;

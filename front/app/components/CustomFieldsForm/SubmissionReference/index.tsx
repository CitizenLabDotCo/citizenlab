import React from 'react';

import {
  Box,
  Icon,
  stylingConsts,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import SubmissionIdContainer from './SubmissionIdContainer';
import { getMailLink } from './utils';

interface Props {
  inputId: string;
  postParticipationSignUpVisible: boolean;
}

const SubmissionReference = ({
  inputId,
  postParticipationSignUpVisible,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();

  return (
    <Box
      border={stylingConsts.border}
      borderRadius={stylingConsts.borderRadius}
      px="12px"
    >
      <Title variant="h4" as="h2">
        <FormattedMessage
          {...(postParticipationSignUpVisible
            ? messages.preferToStayAnonymous
            : messages.submissionIdentifier)}
        />
      </Title>
      <Text color="textSecondary" mb="12px">
        <FormattedMessage {...messages.saveThisCode} />
      </Text>
      <SubmissionIdContainer submissionId={inputId} />
      <Box w="100%" display="flex" alignItems="center" mt="4px">
        <Icon
          name="email"
          width="16px"
          mr="4px"
          fill={colors.textSecondary}
          transform="translate(0,-2px)"
        />
        <ButtonWithLink
          p="0"
          linkTo={getMailLink({
            email: authUser?.data.attributes.email,
            subject: formatMessage(messages.surveySubmission),
            body: formatMessage(messages.yourResponseHasTheFollowingId, {
              identifier: inputId,
            }),
          })}
          buttonStyle="text"
        >
          <Text fontSize="s" color="textSecondary">
            <FormattedMessage {...messages.sendThisCode} />
          </Text>
        </ButtonWithLink>
      </Box>
    </Box>
  );
};

export default SubmissionReference;

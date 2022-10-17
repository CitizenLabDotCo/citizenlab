import React from 'react';
import Link from 'utils/cl-router/Link';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// components
import { Box, Icon, Text } from '@citizenlab/cl2-component-library';

// intl
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';
import { injectIntl } from 'utils/cl-intl';

const StyledLink = styled(Link)`
  color: ${colors.teal700};
  font-size: ${fontSizes.m}px;
  text-decoration: underline;
  &:hover {
    color: inherit;
    text-decoration: underline;
  }
  white-space: nowrap;
`;

type Props = {
  projectId: string;
  redirectToSurveyPage?: boolean;
} & InjectedIntlProps;

const DeleteFormResultsNotice = ({
  projectId,
  redirectToSurveyPage,
  intl: { formatMessage },
}: Props) => (
  <Box
    width="100%"
    display="flex"
    flexDirection="row"
    background={colors.teal100}
    alignItems="center"
    mb="16px"
    px="16px"
    data-cy="e2e-form-delete-results-notice"
  >
    <Icon name="alert-circle" fill={colors.teal700} />
    <Text ml="16px" color="teal700" whiteSpace="nowrap">
      {formatMessage(messages.disabledSurveyEditingMessage)}
    </Text>
    &nbsp;
    {redirectToSurveyPage ? (
      <StyledLink
        to={`/admin/projects/${projectId}/native-survey`}
        data-cy="e2e-delete-form-results-notice-link"
        onlyActiveOnIndex
      >
        {formatMessage(messages.deleteResults)}
      </StyledLink>
    ) : (
      <Text color="teal700" whiteSpace="nowrap">
        {formatMessage(messages.deleteResults)}
      </Text>
    )}
    &nbsp;
    <Text color="teal700" whiteSpace="nowrap">
      {formatMessage(messages.deleteResultsCondition)}
    </Text>
  </Box>
);

export default injectIntl(DeleteFormResultsNotice);

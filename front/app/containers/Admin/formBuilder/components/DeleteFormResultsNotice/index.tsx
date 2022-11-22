import React from 'react';
import Link from 'utils/cl-router/Link';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// components
import { Box, Icon, Text } from '@citizenlab/cl2-component-library';

// intl
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from '../messages';

const StyledLink = styled(Link)`
  color: ${colors.teal700};
  font-size: ${fontSizes.m}px;
  text-decoration: underline;
  &:hover {
    color: inherit;
    text-decoration: underline;
  }
`;

type Props = {
  projectId: string;
  redirectToSurveyPage?: boolean;
} & WrappedComponentProps;

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
    <Box width="20px">
      <Icon name="alert-circle" fill={colors.teal700} />
    </Box>

    <Text ml="16px" color="teal700">
      {formatMessage(messages.disabledSurveyMessage)}
      &nbsp;
      {redirectToSurveyPage ? (
        <StyledLink
          to={`/admin/projects/${projectId}/native-survey`}
          data-cy="e2e-delete-form-results-notice-link"
          onlyActiveOnIndex
        >
          {formatMessage(messages.deleteResultsLink)}
        </StyledLink>
      ) : (
        formatMessage(messages.deleteResultsLink)
      )}
    </Text>
  </Box>
);

export default injectIntl(DeleteFormResultsNotice);

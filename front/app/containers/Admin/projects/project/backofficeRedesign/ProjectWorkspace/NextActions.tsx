import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import { useIntl } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';

import messages from './messages';

const Row = typedStyled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 0;
  text-decoration: none;
  border-bottom: 1px solid ${colors.grey200};

  &:last-child {
    border-bottom: none;
  }
`;

interface Props {
  project: IProjectData;
}

const NextActions = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const projectId = project.id;

  const participants = project.attributes.participants_count;

  return (
    <Box>
      <Box
        display="flex"
        alignItems="baseline"
        justifyContent="space-between"
        gap="8px"
        mb="6px"
      >
        <Text m="0" fontSize="s" fontWeight="bold" color="textPrimary">
          {formatMessage(messages.nextActions)}
        </Text>
        <Text m="0" fontSize="xs" color="textSecondary">
          {participants === 0
            ? formatMessage(messages.noParticipantsYet)
            : formatMessage(messages.participantCount, {
                count: participants,
              })}
        </Text>
      </Box>

      <Box display="flex" flexDirection="column">
        <Row to="/admin/projects/$projectId/messaging" params={{ projectId }}>
          <Box display="flex" alignItems="center" gap="12px" minWidth="0">
            <Icon
              name="email"
              width="20px"
              height="20px"
              fill={colors.textPrimary}
              my="0px"
            />
            <Text as="span" m="0" fontSize="s" color="textPrimary">
              {formatMessage(messages.actionMessageParticipants)}
            </Text>
          </Box>
          <Icon
            name="chevron-right"
            width="16px"
            height="16px"
            fill={colors.textSecondary}
            my="0px"
          />
        </Row>
      </Box>
    </Box>
  );
};

export default NextActions;

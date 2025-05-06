import React from 'react';

import {
  Box,
  Button,
  defaultCardStyle,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useCommonGroundProgress from 'api/common_ground/useCommonGroundProgress';
import useReactToStatement from 'api/common_ground/useReactToStatement';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const StatementCard = styled.div`
  ${defaultCardStyle};
  padding: 16px;
  position: relative;
  z-index: 1;
  background: white;
`;

const PeekCard = styled.div`
  ${defaultCardStyle};
  position: absolute;
  top: 100%;
  left: 8px;
  right: 8px;
  height: 12px;
  margin-top: -4px;
  background: white;
  border-radius: 8px;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.12);
  z-index: 0;
`;

interface Props {
  phaseId: string;
}

const CommonGroundStatements = ({ phaseId }: Props) => {
  // Fetch progress data
  const { data: progressData } = useCommonGroundProgress(phaseId);
  // Mutation for reacting to a statement
  const { mutate: reactToIdea } = useReactToStatement(phaseId);
  // Current statement to react to
  const current = progressData?.data.attributes.nextIdea;
  const { formatMessage } = useIntl();

  if (!current) {
    return <Box mt="24px">{formatMessage(messages.noMoreStatements)}</Box>;
  }

  return (
    <Box mt="8px" position="relative">
      {/* Main Statement Card */}
      <StatementCard id={`statement-${current.id}`}>
        <Box display="flex" justifyContent="space-between" mb="8px">
          <Box as="span">{current.author}</Box>
          <Box as="span">{current.publishedAt}</Box>
        </Box>

        <Box mb="12px" id={`statement-body-${current.id}`}>
          <T value={current.body} supportHtml />
        </Box>

        <Box display="flex" w="100%" justifyContent="space-between">
          <Button
            buttonStyle="text"
            icon="check-circle"
            iconColor={colors.green500}
            onClick={() => reactToIdea({ ideaId: current.id, mode: 'agree' })}
          >
            {formatMessage(messages.agreeLabel)}
          </Button>
          <Button
            buttonStyle="text"
            icon="sentiment-neutral"
            onClick={() => reactToIdea({ ideaId: current.id, mode: 'unsure' })}
          >
            {formatMessage(messages.unsureLabel)}
          </Button>
          <Button
            buttonStyle="text"
            icon="cancel"
            iconColor={colors.red600}
            onClick={() =>
              reactToIdea({ ideaId: current.id, mode: 'disagree' })
            }
          >
            {formatMessage(messages.disagreeLabel)}
          </Button>
        </Box>
      </StatementCard>

      {/* Simulated second card underneath */}
      <PeekCard aria-hidden="true" />
    </Box>
  );
};

export default CommonGroundStatements;

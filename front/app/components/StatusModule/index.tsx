import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import React from 'react';
import { VotingMethod } from 'services/participationContexts';
import { useTheme } from 'styled-components';
import messages from './messages';
import { getVotingMethodConfig } from 'utils/votingMethodUtils/votingMethodUtils';
import { useIntl } from 'utils/cl-intl';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import useBasket from 'hooks/useBasket';
import { pastPresentOrFuture, toFullMonth } from 'utils/dateUtils';

type StatusModuleProps = {
  votingMethod?: VotingMethod | null;
  phase?: IPhaseData;
  project: IProjectData;
};

const StatusModule = ({ votingMethod, phase, project }: StatusModuleProps) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const config = getVotingMethodConfig(votingMethod);
  const basket = useBasket(
    phase
      ? phase?.relationships?.user_basket?.data?.id
      : project.relationships?.user_basket?.data?.id
  );
  const phaseHasEnded = phase?.attributes
    ? pastPresentOrFuture(phase?.attributes.end_at) === 'past'
    : false;
  const basketStatus = phaseHasEnded
    ? 'submissionEnded'
    : basket?.attributes?.submitted_at
    ? 'hasSubmitted'
    : 'hasNotSubmitted';

  return (
    <Box
      mb="16px"
      p="20px"
      borderLeft={`4px solid ${theme.colors.tenantPrimary}`}
      background="white"
    >
      <Title mt="4px" color="tenantPrimary" variant="h4">
        {config?.getStatusTitle &&
          formatMessage(config.getStatusTitle(basketStatus))}
      </Title>
      <>
        <Text>
          {config?.getStatusDescription &&
            config.getStatusDescription({
              project,
              phase,
              SubmissionState: basketStatus,
            })}
        </Text>
        {phase && (
          <Text>
            {config?.getSubmissionTerm &&
              formatMessage(config.getSubmissionTerm())}{' '}
            {formatMessage(messages.submittedUntil)}{' '}
            <b>{toFullMonth(phase.attributes.end_at, 'day')}</b>.
          </Text>
        )}
      </>
      <Text m="0px" fontSize="xxxxl">
        {/* TODO: Get submission count from BE once endpoint implemented*/}
        127
      </Text>
      <Text m="0px">
        {config?.getStatusSubmissionCountCopy &&
          formatMessage(config?.getStatusSubmissionCountCopy())}
      </Text>
    </Box>
  );
};

export default StatusModule;

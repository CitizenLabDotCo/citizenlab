import React from 'react';

// components
import {
  Box,
  Button,
  Text,
  Title,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import ConfettiSvg from './ConfettiSvg';

// api
import { VotingMethod } from 'services/participationContexts';
import { useTheme } from 'styled-components';
import { useIntl } from 'utils/cl-intl';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import useBasket from 'hooks/useBasket';
import { updateBasket } from 'services/baskets';
import streams from 'utils/streams';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// utils
import { getVotingMethodConfig } from 'utils/votingMethodUtils/votingMethodUtils';
import { pastPresentOrFuture, toFullMonth } from 'utils/dateUtils';

// intl
import messages from './messages';

type StatusModuleProps = {
  votingMethod?: VotingMethod | null;
  phase?: IPhaseData;
  project: IProjectData;
};

const unsubmitBasket = async (basketId?: string) => {
  if (basketId) {
    try {
      await updateBasket(basketId, {
        submitted_at: null,
      });
      streams.fetchAllWith({ dataId: [basketId] });
    } catch (error) {
      streams.fetchAllWith({ dataId: [basketId] });
    }
  }
};

const StatusModule = ({ votingMethod, phase, project }: StatusModuleProps) => {
  const theme = useTheme();
  const { data: appConfig } = useAppConfiguration();
  const isSmallerThanPhone = useBreakpoint('phone');
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
  const showDate = !phaseHasEnded && basketStatus === 'hasNotSubmitted';

  return (
    <Box>
      <Title variant="h2" style={{ fontWeight: 600 }}>
        {config?.getStatusTitle &&
          formatMessage(config.getStatusHeader(basketStatus))}
      </Title>
      <Box
        mb="16px"
        p="20px"
        borderLeft={`4px solid ${theme.colors.tenantPrimary}`}
        background="white"
      >
        {basketStatus === 'hasSubmitted' && !phaseHasEnded && (
          <Box m="-12px" display="flex" justifyContent="flex-end">
            <ConfettiSvg />
          </Box>
        )}
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
                appConfig,
              })}
          </Text>
          {phase && showDate && (
            <Text>
              {config?.getSubmissionTerm &&
                formatMessage(config.getSubmissionTerm('plural'))}{' '}
              {formatMessage(messages.submittedUntil)}{' '}
              <b>{toFullMonth(phase.attributes.end_at, 'day')}</b>.
            </Text>
          )}
        </>
        <Text m="0px" fontSize="xxxxl" style={{ fontWeight: '700' }}>
          {/* TODO: Get submission count from BE once endpoint implemented*/}
          127
        </Text>
        <Text m="0px">
          {config?.getStatusSubmissionCountCopy &&
            formatMessage(config?.getStatusSubmissionCountCopy())}
        </Text>
        {basketStatus === 'hasSubmitted' && (
          <Box display={isSmallerThanPhone ? 'block' : 'flex'}>
            <Button
              buttonStyle="secondary"
              bgColor="white"
              bgHoverColor="white"
              borderColor={colors.grey400}
              icon="edit"
              mt="16px"
              onClick={() => {
                unsubmitBasket(basket?.id);
              }}
            >
              {formatMessage(messages.modifyYour)}{' '}
              {config?.getSubmissionTerm &&
                formatMessage(
                  config.getSubmissionTerm('singular')
                ).toLowerCase()}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default StatusModule;

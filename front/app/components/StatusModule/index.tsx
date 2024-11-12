import React from 'react';

import {
  Box,
  Button,
  Text,
  Title,
  colors,
  useBreakpoint,
  defaultStyles,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useBasket from 'api/baskets/useBasket';
import useUpdateBasket from 'api/baskets/useUpdateBasket';
import { IPhaseData, VotingMethod } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getVotingMethodConfig } from 'utils/configs/votingMethodConfig';
import { getLocalisedDateString, pastPresentOrFuture } from 'utils/dateUtils';

import ConfettiSvg from './ConfettiSvg';
import messages from './messages';

type StatusModuleProps = {
  votingMethod?: VotingMethod | null;
  phase: IPhaseData;
  project: IProjectData;
};

const unsubmitBasket = async (
  basketId: string,
  updateBasket: ReturnType<typeof useUpdateBasket>['mutate']
) => {
  updateBasket({
    id: basketId,
    submitted: false,
  });
};

const StatusModule = ({ votingMethod, phase, project }: StatusModuleProps) => {
  const { data: appConfig } = useAppConfiguration();

  const theme = useTheme();
  const isSmallerThanPhone = useBreakpoint('phone');

  const localize = useLocalize();
  const { formatMessage } = useIntl();

  // phase
  const config = getVotingMethodConfig(votingMethod);
  const phaseHasEnded = phase.attributes.end_at
    ? pastPresentOrFuture(phase.attributes.end_at) === 'past'
    : false;
  const phaseHasNotStartedYet =
    pastPresentOrFuture(phase.attributes.start_at) === 'future';

  // basket
  const { data: basket } = useBasket(phase.relationships.user_basket?.data?.id);
  const { mutate: updateBasket } = useUpdateBasket();
  const basketStatus = phaseHasEnded
    ? 'submissionEnded'
    : // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    basket?.data.attributes?.submitted_at
    ? 'hasSubmitted'
    : 'hasNotSubmitted';
  const showDate = !phaseHasEnded && basketStatus === 'hasNotSubmitted';
  const basketCount =
    phase.attributes.baskets_count || project.attributes.baskets_count;

  return (
    <Box boxShadow={defaultStyles.boxShadow} id="voting-status-module">
      {phaseHasNotStartedYet && (
        <Box mb="40px">
          <Warning icon="lock">
            <FormattedMessage {...messages.futurePhase} />
          </Warning>
        </Box>
      )}
      <Title variant="h2" color="tenantText">
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
        <Title mt="4px" color="tenantPrimary" variant="h4" as="h3">
          {config?.getStatusTitle &&
            formatMessage(config.getStatusTitle(basketStatus))}
        </Title>
        <>
          <Box style={{ fontSize: fontSizes.m }}>
            {config?.getStatusDescription &&
              config.getStatusDescription({
                project,
                phase,
                submissionState: basketStatus,
                appConfig,
                localize,
                formatMessage,
              })}
          </Box>
          {showDate && phase.attributes.end_at && (
            <Text>
              {formatMessage(messages.submittedUntil)}{' '}
              <b>{getLocalisedDateString(phase.attributes.end_at)}</b>.
            </Text>
          )}
        </>
        {basketCount > 0 && (
          <>
            <Text m="0px" fontSize="xxxxl" style={{ fontWeight: '700' }}>
              {basketCount}
            </Text>
            <Text m="0px">
              {config?.getStatusSubmissionCountCopy &&
                formatMessage(
                  // TODO: Fix this the next time the file is edited.
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  config?.getStatusSubmissionCountCopy(basketCount)
                )}
            </Text>
          </>
        )}
        {basket && basketStatus === 'hasSubmitted' && (
          <Box display={isSmallerThanPhone ? 'block' : 'flex'}>
            <Button
              buttonStyle="secondary-outlined"
              bgColor="white"
              bgHoverColor="white"
              borderColor={colors.grey400}
              icon="edit"
              mt="16px"
              id="e2e-modify-votes"
              onClick={() => {
                unsubmitBasket(basket.data.id, updateBasket);
              }}
            >
              {config &&
                formatMessage(messages.modifyYourSubmission, {
                  submissionTerm: formatMessage(
                    config.getSubmissionTerm('singular')
                  ).toLowerCase(),
                })}
            </Button>
          </Box>
        )}
      </Box>
      {basketStatus !== 'hasSubmitted' &&
        !phaseHasEnded &&
        !phaseHasNotStartedYet && (
          <Box mb="16px">
            <Warning>
              <FormattedMessage
                values={{
                  b: (chunks) => (
                    <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
                  ),
                }}
                {...(config?.preSubmissionWarning &&
                  config.preSubmissionWarning())}
              />
            </Warning>
          </Box>
        )}
    </Box>
  );
};

export default StatusModule;

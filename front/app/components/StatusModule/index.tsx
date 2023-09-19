import React from 'react';

// components
import {
  Box,
  Button,
  Text,
  Title,
  colors,
  useBreakpoint,
  defaultStyles,
} from '@citizenlab/cl2-component-library';
import ConfettiSvg from './ConfettiSvg';
import Warning from 'components/UI/Warning';

// api
import { VotingMethod } from 'services/participationContexts';
import { useTheme } from 'styled-components';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import useBasket from 'api/baskets/useBasket';
import useUpdateBasket from 'api/baskets/useUpdateBasket';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// utils
import { getVotingMethodConfig } from 'utils/configs/votingMethodConfig';
import { pastPresentOrFuture, toFullMonth } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';

// styling
import { fontSizes } from 'utils/styleUtils';

// intl
import messages from './messages';
import useLocalize from 'hooks/useLocalize';

type StatusModuleProps = {
  votingMethod?: VotingMethod | null;
  phase?: IPhaseData;
  project: IProjectData;
};

const unsubmitBasket = async (
  basketId: string,
  updateBasket: ReturnType<typeof useUpdateBasket>['mutate'],
  participation_context_type: 'Phase' | 'Project'
) => {
  updateBasket({
    id: basketId,
    submitted: false,
    participation_context_type,
  });
};

const StatusModule = ({ votingMethod, phase, project }: StatusModuleProps) => {
  const { data: appConfig } = useAppConfiguration();

  // style
  const theme = useTheme();
  const isSmallerThanPhone = useBreakpoint('phone');

  // intl
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  // participation context
  const config = getVotingMethodConfig(votingMethod);
  const phaseHasEnded = phase?.attributes
    ? pastPresentOrFuture(phase?.attributes.end_at) === 'past'
    : false;
  const phaseHasNotStartedYet = phase?.attributes
    ? pastPresentOrFuture(phase?.attributes.start_at) === 'future'
    : false;

  // basket
  const { data: basket } = useBasket(
    phase
      ? phase?.relationships?.user_basket?.data?.id
      : project.relationships?.user_basket?.data?.id
  );
  const { mutate: updateBasket } = useUpdateBasket();
  const basketStatus = phaseHasEnded
    ? 'submissionEnded'
    : basket?.data.attributes?.submitted_at
    ? 'hasSubmitted'
    : 'hasNotSubmitted';
  const showDate = !phaseHasEnded && basketStatus === 'hasNotSubmitted';
  const basketCount =
    phase?.attributes.baskets_count || project?.attributes.baskets_count;

  return (
    <Box boxShadow={defaultStyles.boxShadow} id="voting-status-module">
      {phaseHasNotStartedYet && (
        <Box mb="40px">
          <Warning icon="lock">
            <FormattedMessage {...messages.futurePhase} />
          </Warning>
        </Box>
      )}
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
          {phase && showDate && (
            <Text>
              {config?.getSubmissionTerm &&
                formatMessage(config.getSubmissionTerm('plural'))}{' '}
              {formatMessage(messages.submittedUntil)}{' '}
              <b>{toFullMonth(phase.attributes.end_at, 'day')}</b>.
            </Text>
          )}
        </>
        {!isNilOrError(basketCount) && basketCount > 0 && (
          <>
            <Text m="0px" fontSize="xxxxl" style={{ fontWeight: '700' }}>
              {basketCount}
            </Text>
            <Text m="0px">
              {config?.getStatusSubmissionCountCopy &&
                formatMessage(
                  config?.getStatusSubmissionCountCopy(basketCount)
                )}
            </Text>
          </>
        )}
        {basket && basketStatus === 'hasSubmitted' && (
          <Box display={isSmallerThanPhone ? 'block' : 'flex'}>
            <Button
              buttonStyle="secondary"
              bgColor="white"
              bgHoverColor="white"
              borderColor={colors.grey400}
              icon="edit"
              mt="16px"
              id="e2e-modify-votes"
              onClick={() => {
                unsubmitBasket(
                  basket?.data.id,
                  updateBasket,
                  phase ? 'Phase' : 'Project'
                );
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

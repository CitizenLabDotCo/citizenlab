import React, { useMemo } from 'react';

import {
  Box,
  Image,
  Input,
  Text,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useIdeaById from 'api/ideas/useIdeaById';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useAuthUser from 'api/me/useAuthUser';
import { VotingMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import useUserById from 'api/users/useUserById';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from '../messages';
import tracks from '../tracks';

import tooltipPreview from './assets/preview_for_tooltip.png';

interface Props {
  ideaId: string;
  phaseId: string;
  votingMethod: VotingMethod;
}

const OfflineVoteSettings = ({ ideaId, votingMethod, phaseId }: Props) => {
  const { data: authUser } = useAuthUser();

  const { data: appConfig } = useAppConfiguration();
  const { data: phase } = usePhase(phaseId);
  const tenantId = appConfig?.data.id;
  const { data: idea } = useIdeaById(ideaId);
  const { data: userLastModifiedVotes } = useUserById(
    idea?.data.relationships.manual_votes_last_updated_by?.data?.id
  );
  const { data: userLastModifiedVoters } = useUserById(
    phase?.data.relationships.manual_voters_last_updated_by?.data?.id
  );
  const { mutate: updateIdea } = useUpdateIdea();
  const { mutate: updatePhase } = useUpdatePhase();
  const [manualVotesAmount, setManualVotesAmount] = React.useState<
    number | null
  >(idea?.data.attributes.manual_votes_amount || null);
  const [manualVotersAmount, setManualVotersAmount] = React.useState<
    number | null
  >(phase?.data.attributes.manual_voters_amount || null);
  const isBudgeting = votingMethod === 'budgeting';

  const handleOfflineVotesChangedDebounced = useMemo(() => {
    return debounce(() => {
      updateIdea({
        id: ideaId,
        requestBody: { manual_votes_amount: manualVotesAmount },
        skipRefetchCounts: true,
      });

      trackEventByName(tracks.changeManualVoteAmount, {
        tenant: tenantId,
        location: 'Manual vote input',
        idea: ideaId,
        phase: phaseId,
        currentUser: authUser?.data.id || null,
      });
    }, 300);
  }, [
    authUser?.data.id,
    ideaId,
    manualVotesAmount,
    phaseId,
    tenantId,
    updateIdea,
  ]);

  const handleOfflineVotersChangedDebounced = useMemo(() => {
    return debounce(() => {
      manualVotersAmount !== null &&
        updatePhase({
          phaseId,
          manual_voters_amount: manualVotersAmount,
        });

      trackEventByName(tracks.changeManualVoterAmount, {
        tenant: tenantId,
        location: 'Manual voters input',
        phase: phaseId,
        currentUser: authUser?.data.id || null,
      });
    }, 300);
  }, [authUser?.data.id, manualVotersAmount, phaseId, tenantId, updatePhase]);

  return (
    <Box mt="20px">
      {votingMethod === 'budgeting' && (
        <Box mb="20px">
          <Input
            type="number"
            value={manualVotersAmount?.toString() || ''}
            label={<FormattedMessage {...messages.manualVotersLabel} />}
            labelTooltipText={
              <Box>
                <FormattedMessage
                  {...messages.manualVotersTooltip1}
                  values={{
                    b: (chunks) => (
                      <strong style={{ fontWeight: 'bold' }}>{chunks}</strong>
                    ),
                  }}
                />{' '}
                <Box mt="12px">
                  <FormattedMessage {...messages.manualVotersTooltip2} />
                </Box>
              </Box>
            }
            onChange={(value) => {
              setManualVotersAmount(parseInt(value, 10));
            }}
            onBlur={() => {
              handleOfflineVotersChangedDebounced();
            }}
          />
          {userLastModifiedVoters?.data.attributes.first_name && (
            <Text pt="4px" m="0px" color="textSecondary" fontSize="s">
              <FormattedMessage
                {...messages.modifiedBy}
                values={{
                  name: `${userLastModifiedVoters.data.attributes.first_name} ${userLastModifiedVoters.data.attributes.last_name}`,
                }}
              />
            </Text>
          )}
        </Box>
      )}
      <Tooltip
        disabled={!!manualVotersAmount || !isBudgeting}
        content={<FormattedMessage {...messages.manualVotersDisabledTooltip} />}
      >
        <>
          <Input
            type="number"
            value={manualVotesAmount?.toString() || ''}
            disabled={!manualVotersAmount && isBudgeting}
            labelTooltipText={
              <Box>
                <Box mb="12px">
                  <Image src={tooltipPreview} alt="info" />
                </Box>
                <FormattedMessage {...messages.manualVoteAdjustmentTooltip1} />
                <li>
                  <FormattedMessage
                    {...messages.manualVoteAdjustmentTooltip2}
                  />
                </li>
                <li>
                  <FormattedMessage
                    {...messages.manualVoteAdjustmentTooltip3}
                  />
                </li>
                <li>
                  <FormattedMessage
                    {...messages.manualVoteAdjustmentTooltip4}
                  />
                </li>
                <li>
                  <FormattedMessage
                    {...messages.manualVoteAdjustmentTooltip5}
                  />
                </li>
              </Box>
            }
            label={
              <Box display="flex" gap="4px">
                {votingMethod === 'budgeting' ? (
                  <FormattedMessage {...messages.manualPickAdjustment} />
                ) : (
                  <FormattedMessage {...messages.manualVoteAdjustment} />
                )}
              </Box>
            }
            onChange={(value) => {
              setManualVotesAmount(parseInt(value, 10));
            }}
            onBlur={() => {
              handleOfflineVotesChangedDebounced();
            }}
          />
          {userLastModifiedVotes?.data.attributes.first_name && (
            <Text pt="4px" m="0px" color="textSecondary" fontSize="s">
              <FormattedMessage
                {...messages.modifiedBy}
                values={{
                  name: getFullName(userLastModifiedVotes.data),
                }}
              />
            </Text>
          )}
        </>
      </Tooltip>
    </Box>
  );
};

export default OfflineVoteSettings;

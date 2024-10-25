import React, { useMemo } from 'react';

import {
  Box,
  IconTooltip,
  Image,
  Input,
} from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useIdeaById from 'api/ideas/useIdeaById';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useAuthUser from 'api/me/useAuthUser';
import { VotingMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';
import tracks from '../tracks';

import tooltipPreview from './assets/preview_for_tooltip.png';
import ListItemWithBullet from './ListItemWithBullet';

interface Props {
  ideaId: string;
  phaseId: string;
  votingMethod: VotingMethod;
}

const OfflineVoteSettings = ({ ideaId, votingMethod, phaseId }: Props) => {
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();
  const { data: phase } = usePhase(phaseId);
  const tenantId = appConfig?.data.id;
  const { data: idea } = useIdeaById(ideaId);
  const { mutate: updateIdea } = useUpdateIdea();
  const { mutate: updatePhase } = useUpdatePhase();
  const [manualVotesAmount, setManualVotesAmount] = React.useState<
    number | null
  >(idea?.data.attributes.manual_votes_amount || null);
  const [manualVotersAmount, setManualVotersAmount] = React.useState<
    number | null
  >(phase?.data.attributes.manual_voters_amount || null);

  const handleOfflineVotesChangedDebounced = useMemo(() => {
    return debounce(() => {
      updateIdea({
        id: ideaId,
        requestBody: { manual_votes_amount: manualVotesAmount },
      });

      trackEventByName(tracks.changeManualVoteAmount, {
        tenant: tenantId,
        location: 'Manual vote input',
        idea: ideaId,
        currentUser: authUser?.data?.id || null,
      });
    }, 300);
  }, [authUser?.data?.id, ideaId, manualVotesAmount, tenantId, updateIdea]);

  const handleOfflineVotersChangedDebounced = useMemo(() => {
    return debounce(() => {
      manualVotersAmount &&
        updatePhase({
          phaseId,
          manual_voters_amount: manualVotersAmount,
        });

      trackEventByName(tracks.changeManualVoterAmount, {
        tenant: tenantId,
        location: 'Manual voters input',
        phase: phaseId,
        currentUser: authUser?.data?.id || null,
      });
    }, 300);
  }, [authUser?.data?.id, manualVotersAmount, phaseId, tenantId, updatePhase]);

  return (
    <Box mt="20px">
      {votingMethod === 'budgeting' && (
        <Box mb="20px">
          <Input
            type="number"
            value={manualVotersAmount?.toString() || ''}
            label={
              <Box display="flex" gap="4px">
                <FormattedMessage {...messages.manualVotersLabel} />
                <IconTooltip
                  content={
                    <Box>
                      <FormattedMessage {...messages.manualVotersTooltip} />
                    </Box>
                  }
                />
              </Box>
            }
            onChange={(value) => {
              setManualVotersAmount(parseInt(value, 10));
            }}
            onBlur={() => {
              handleOfflineVotersChangedDebounced();
            }}
          />
        </Box>
      )}
      <Input
        type="number"
        value={manualVotesAmount?.toString() || ''}
        label={
          <Box display="flex" gap="4px">
            {votingMethod === 'budgeting' ? (
              <FormattedMessage {...messages.manualPickAdjustment} />
            ) : (
              <FormattedMessage {...messages.manualVoteAdjustment} />
            )}
            <IconTooltip
              content={
                <Box>
                  <Box mb="12px">
                    <Image src={tooltipPreview} alt="info" />
                  </Box>
                  <FormattedMessage
                    {...messages.manualVoteAdjustmentTooltip1}
                  />
                  <ListItemWithBullet
                    message={messages.manualVoteAdjustmentTooltip2}
                  />
                  <ListItemWithBullet
                    message={messages.manualVoteAdjustmentTooltip3}
                  />
                  <ListItemWithBullet
                    message={messages.manualVoteAdjustmentTooltip4}
                  />
                  <ListItemWithBullet
                    message={messages.manualVoteAdjustmentTooltip5}
                  />
                </Box>
              }
            />
          </Box>
        }
        onChange={(value) => {
          setManualVotesAmount(parseInt(value, 10));
        }}
        onBlur={() => {
          handleOfflineVotesChangedDebounced();
        }}
      />
      {/* <Text>{formatMessage(messages.modifiedBy, {  TODO: Add this once BE supported.
        name: idea?.data.attributes.manual_votes_last_updated_by,
      })}</Text> */}
    </Box>
  );
};

export default OfflineVoteSettings;

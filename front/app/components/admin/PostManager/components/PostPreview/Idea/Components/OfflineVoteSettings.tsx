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

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import tracks from '../tracks';

import tooltipPreview from './assets/preview_for_tooltip.png';
import ListItemWithBullet from './ListItemWithBullet';

interface Props {
  ideaId: string;
}

const OfflineVoteSettings = ({ ideaId }: Props) => {
  const { data: authUser } = useAuthUser();
  const { data: appConfig } = useAppConfiguration();
  const tenantId = appConfig?.data.id;
  const { data: idea } = useIdeaById(ideaId);
  const { mutate: updateIdea } = useUpdateIdea();
  const [manualVotesAmount, setManualVotesAmount] = React.useState<
    string | null
  >(idea?.data.attributes.manual_votes_amount || null);

  const handleOfflineChangedDebounced = useMemo(() => {
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

  return (
    <Box mt="20px">
      <Input
        type="number"
        value={manualVotesAmount || ''}
        label={
          <Box display="flex" gap="4px">
            <FormattedMessage {...messages.manualVoteAdjustment} />
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
          setManualVotesAmount(value);
        }}
        onBlur={() => {
          handleOfflineChangedDebounced();
        }}
      />
    </Box>
  );
};

export default OfflineVoteSettings;

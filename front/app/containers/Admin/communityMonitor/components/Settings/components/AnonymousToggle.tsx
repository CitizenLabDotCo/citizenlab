import React from 'react';

import { Box, Text, IconTooltip } from '@citizenlab/cl2-component-library';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';
import usePhase from 'api/phases/usePhase';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import AnonymousPostingToggle from 'components/admin/AnonymousPostingToggle/AnonymousPostingToggle';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

const AnonymousToggle = () => {
  const { formatMessage } = useIntl();

  const { data: project } = useCommunityMonitorProject();
  const phaseId = project?.data.relationships.current_phase?.data?.id;
  const { data: phase } = usePhase(phaseId);
  const { mutate: updatePhase } = useUpdatePhase();

  const allowAnonymousParticipation =
    phase?.data.attributes.allow_anonymous_participation;

  const handleAllowAnonymousParticipationOnChange = () => {
    phaseId &&
      updatePhase({
        phaseId,
        allow_anonymous_participation: !allowAnonymousParticipation,
      });
  };

  return (
    <AnonymousPostingToggle
      allow_anonymous_participation={allowAnonymousParticipation}
      handleAllowAnonymousParticipationOnChange={
        handleAllowAnonymousParticipationOnChange
      }
      toggleLabel={
        <Box ml="8px">
          <Box display="flex">
            <Text color="primary" mb="0px" fontSize="m" fontWeight="semi-bold">
              <FormattedMessage {...messages.userAnonymityLabelMain} />
            </Text>
            <Box ml="4px" mt="16px">
              <IconTooltip
                placement="top-start"
                content={formatMessage(messages.userAnonymityLabelTooltip)}
              />
            </Box>
          </Box>

          <Text color="coolGrey600" mt="0px" fontSize="m">
            <FormattedMessage {...messages.userAnonymityLabelSubtext} />
          </Text>
        </Box>
      }
    />
  );
};

export default AnonymousToggle;

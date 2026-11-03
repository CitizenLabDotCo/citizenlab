import React from 'react';

import { Box, Toggle } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useUpdateAppConfiguration from 'api/app_configuration/useUpdateAppConfiguration';

import { SubSectionTitle } from 'components/admin/Section';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

// Same markup and styles as the other toggles on the general settings page (e.g. the profanity blocker)
const StyledToggle = styled(Toggle)`
  margin-right: 15px;
`;

const ToggleLabel = styled.label`
  display: flex;
`;

const LabelContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const LabelTitle = styled.div`
  font-weight: bold;
`;

const ExcludeAdminsAndModeratorsFromStatistics = () => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();
  const { mutate: updateAppConfiguration } = useUpdateAppConfiguration();

  if (!appConfiguration) return null;

  const enabled =
    !!appConfiguration.data.attributes.settings.core
      .exclude_admins_and_moderators_from_statistics;

  const onToggle = () => {
    updateAppConfiguration({
      settings: {
        core: { exclude_admins_and_moderators_from_statistics: !enabled },
      },
    });
  };

  return (
    <Box mt="30px" mb="20px">
      <SubSectionTitle>{formatMessage(messages.title)}</SubSectionTitle>
      <ToggleLabel>
        <StyledToggle checked={enabled} onChange={onToggle} />
        <LabelContent>
          <LabelTitle>{formatMessage(messages.toggleLabel)}</LabelTitle>
          <div>{formatMessage(messages.toggleDescription)}</div>
        </LabelContent>
      </ToggleLabel>
    </Box>
  );
};

export default ExcludeAdminsAndModeratorsFromStatistics;

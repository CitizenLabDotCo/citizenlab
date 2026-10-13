import React, { useId } from 'react';

import { Box, Toggle } from '@citizenlab/cl2-component-library';

import useProjectById from 'api/projects/useProjectById';
import useUpdateProject from 'api/projects/useUpdateProject';

import topicsMessages from 'containers/Admin/projects/project/topics/messages';

import SettingsSection from 'components/UI/SettingsModal/SettingsSection';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

interface Props {
  projectId: string;
}

const PerspectivesSection = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const toggleId = useId();
  const { data: project } = useProjectById(projectId);
  const { mutate: updateProject } = useUpdateProject();

  if (!project) return null;

  const { live_auto_input_topics_enabled } = project.data.attributes;
  const title = formatMessage(topicsMessages.perspectives);

  return (
    <SettingsSection
      title={title}
      tooltip={formatMessage(topicsMessages.liveAutoInputTopicsLabel)}
      description={formatMessage(topicsMessages.liveAutoInputTopicsDescription)}
      action={
        <Box>
          <label htmlFor={toggleId}>
            <ScreenReaderOnly>{title}</ScreenReaderOnly>
          </label>
          <Toggle
            id={toggleId}
            size="small"
            checked={live_auto_input_topics_enabled}
            onChange={() =>
              updateProject({
                projectId,
                live_auto_input_topics_enabled: !live_auto_input_topics_enabled,
              })
            }
          />
        </Box>
      }
    />
  );
};

export default PerspectivesSection;

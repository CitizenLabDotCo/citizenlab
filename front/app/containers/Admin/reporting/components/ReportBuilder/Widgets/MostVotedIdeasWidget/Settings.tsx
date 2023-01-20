import React, { useCallback } from 'react';

// hooks
import { useNode } from '@craftjs/core';

// components
import { Box, Input } from '@citizenlab/cl2-component-library';
import ProjectFilter from '../_shared/ProjectFilter';
import PhaseFilter from '../_shared/PhaseFilter';
import NumberOfIdeasDropdown from './NumberOfIdeasDropdown';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// typings
import { Props } from './typings';
import { IOption } from 'typings';

const Settings = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    title,
    projectId,
    phaseId,
    numberOfIdeas,
    collapseLongText,
  } = useNode<Props>((node) => ({
    title: node.data.props.title,
    projectId: node.data.props.projectId,
    phaseId: node.data.props.phaseId,
    numberOfIdeas: node.data.props.numberOfIdeas,
    collapseLongText: node.data.props.collapseLongText,
  }));

  const setTitle = useCallback(
    (value: string) => {
      setProp((props) => {
        props.title = value;
      });
    },
    [setProp]
  );

  const handleProjectFilter = useCallback(
    ({ value }: IOption) => {
      setProp((props) => {
        props.projectId = value;
        props.phaseId = undefined;
      });
    },
    [setProp]
  );

  const handlePhaseFilter = useCallback(
    ({ value }: IOption) => {
      setProp((props) => {
        props.phaseId = value;
      });
    },
    [setProp]
  );

  const handleChangeNumberOfIdeas = useCallback(
    (numberOfIdeas: number) => {
      setProp((props) => {
        props.numberOfIdeas = numberOfIdeas;
      });
    },
    [setProp]
  );

  return (
    <Box>
      <Box mb="20px">
        <Input
          label={formatMessage(messages.title)}
          type="text"
          value={title}
          onChange={setTitle}
        />
      </Box>

      <ProjectFilter
        projectId={projectId}
        phaseId={phaseId}
        onPhaseFilter={handlePhaseFilter}
        onProjectFilter={handleProjectFilter}
      />

      {projectId !== undefined && (
        <PhaseFilter
          label={formatMessage(messages.ideationPhases)}
          projectId={projectId}
          phaseId={phaseId}
          onPhaseFilter={handlePhaseFilter}
        />
      )}

      <NumberOfIdeasDropdown
        numberOfIdeas={numberOfIdeas}
        onChange={handleChangeNumberOfIdeas}
      />
    </Box>
  );
};

export default Settings;

import React, { useCallback } from 'react';

// hooks
import { useNode } from '@craftjs/core';

// components
import { Box, Input } from '@citizenlab/cl2-component-library';
import ProjectFilter from '../../_shared/ProjectFilter';
import PhaseFilter from '../../_shared/PhaseFilter';
import NumberOfIdeasDropdown from './NumberOfIdeasDropdown';
import CollapseLongTextToggle from './CollapseLongTextToggle';

// i18n
import messages from '../messages';
import widgetMessages from '../../messages';
import { useIntl } from 'utils/cl-intl';

// typings
import { Props } from '../typings';
import { IOption } from 'typings';
import { IProjectData } from 'api/projects/types';

const isContinuousIdeationOrTimelineProject = ({ attributes }: IProjectData) =>
  attributes.process_type === 'timeline' ||
  attributes.participation_method === 'ideation';

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
      setProp((props: Props) => {
        props.title = value;
      });
    },
    [setProp]
  );

  const handleProjectFilter = useCallback(
    ({ value }: IOption) => {
      setProp((props: Props) => {
        props.projectId = value;
        props.phaseId = undefined;
      });
    },
    [setProp]
  );

  const handlePhaseFilter = useCallback(
    ({ value }: IOption) => {
      setProp((props: Props) => {
        props.phaseId = value;
      });
    },
    [setProp]
  );

  const handleChangeNumberOfIdeas = useCallback(
    (numberOfIdeas: number) => {
      setProp((props: Props) => {
        props.numberOfIdeas = numberOfIdeas;
      });
    },
    [setProp]
  );

  const handleChangeCollapseLongText = useCallback(
    (collapseLongText: boolean) => {
      setProp((props: Props) => {
        props.collapseLongText = collapseLongText;
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
        filter={isContinuousIdeationOrTimelineProject}
        emptyValueMessage={widgetMessages.noProject}
        onProjectFilter={handleProjectFilter}
      />

      {projectId !== undefined && (
        <PhaseFilter
          label={formatMessage(messages.ideationPhases)}
          projectId={projectId}
          phaseId={phaseId}
          participationMethod="ideation"
          onPhaseFilter={handlePhaseFilter}
        />
      )}

      <NumberOfIdeasDropdown
        numberOfIdeas={numberOfIdeas}
        onChange={handleChangeNumberOfIdeas}
      />

      <Box my="28px">
        <CollapseLongTextToggle
          collapseLongText={collapseLongText}
          onChange={handleChangeCollapseLongText}
        />
      </Box>
    </Box>
  );
};

export default Settings;

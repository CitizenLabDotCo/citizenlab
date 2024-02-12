import React, { useCallback } from 'react';

// hooks
import { useNode } from '@craftjs/core';

// components
import { Box } from '@citizenlab/cl2-component-library';
import ProjectFilter from '../../_shared/ProjectFilter';
import PhaseFilter from '../../_shared/PhaseFilter';
import CollapseLongTextToggle from './CollapseLongTextToggle';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

// i18n
import messages from '../messages';
import widgetMessages from '../../messages';
import { useIntl } from 'utils/cl-intl';

// typings
import { Props } from '../typings';
import { IOption, Multiloc } from 'typings';
import IdeaFilter from './IdeaFilter';

const Settings = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    title,
    projectId,
    phaseId,
    ideaId,
    collapseLongText,
  } = useNode<Props>((node) => ({
    title: node.data.props.title,
    projectId: node.data.props.projectId,
    phaseId: node.data.props.phaseId,
    ideaId: node.data.props.ideaId,
    collapseLongText: node.data.props.collapseLongText,
  }));

  const setTitle = useCallback(
    (value: Multiloc) => {
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

  const handleChangeIdeaId = useCallback(
    (ideaId: string) => {
      setProp((props: Props) => {
        props.ideaId = ideaId;
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
        <InputMultilocWithLocaleSwitcher
          label={formatMessage(messages.title)}
          type="text"
          valueMultiloc={title}
          onChange={setTitle}
        />
      </Box>

      <ProjectFilter
        projectId={projectId}
        emptyOptionMessage={widgetMessages.noProject}
        onProjectFilter={handleProjectFilter}
      />

      {projectId !== undefined && (
        <PhaseFilter
          label={formatMessage(messages.ideationPhase)}
          projectId={projectId}
          phaseId={phaseId}
          participationMethod="ideation"
          onPhaseFilter={handlePhaseFilter}
        />
      )}

      {/* <IdeaFilter
        ideaId={ideaId}
        onChange={handleChangeIdeaId}
      /> */}

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

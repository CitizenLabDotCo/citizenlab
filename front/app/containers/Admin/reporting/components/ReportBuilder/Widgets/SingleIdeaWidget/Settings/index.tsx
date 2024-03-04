import React, { useCallback } from 'react';

// hooks
import { useNode } from '@craftjs/core';
import usePhases from 'api/phases/usePhases';

// components
import { Box, Toggle, colors } from '@citizenlab/cl2-component-library';
import ProjectFilter from '../../_shared/ProjectFilter';
import PhaseFilter from 'components/UI/PhaseFilter';
import CollapseLongTextToggle from './CollapseLongTextToggle';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

// i18n
import messages from '../messages';
import widgetMessages from '../../messages';
import { useIntl } from 'utils/cl-intl';

// typings
import { Props } from '../typings';
import { IOption, Multiloc } from 'typings';
import IdeaSelect from 'components/UI/IdeaSelect';
import { IIdeaData } from 'api/ideas/types';

const Settings = () => {
  const { formatMessage } = useIntl();

  const {
    actions: { setProp },
    title,
    showAuthor,
    showContent,
    showReactions,
    showVotes,
    collapseLongText,
    projectId,
    phaseId,
    ideaId,
  } = useNode<Props>((node) => ({
    title: node.data.props.title,
    showAuthor: node.data.props.showAuthor,
    showContent: node.data.props.showContent,
    showReactions: node.data.props.showReactions,
    showVotes: node.data.props.showVotes,
    collapseLongText: node.data.props.collapseLongText,
    projectId: node.data.props.projectId,
    phaseId: node.data.props.phaseId,
    ideaId: node.data.props.ideaId,
  }));

  const { data: phases } = usePhases(projectId);

  const setTitle = useCallback(
    (value: Multiloc) => {
      setProp((props: Props) => {
        props.title = value;
      });
    },
    [setProp]
  );

  const handleChangeShowAuthor = useCallback(
    (showAuthor: boolean) => {
      setProp((props: Props) => {
        props.showAuthor = showAuthor;
      });
    },
    [setProp]
  );

  const handleChangeShowDescription = useCallback(
    (showContent: boolean) => {
      setProp((props: Props) => {
        props.showContent = showContent;
      });
    },
    [setProp]
  );

  const handleChangeShowReactions = useCallback(
    (showReactions: boolean) => {
      setProp((props: Props) => {
        props.showReactions = showReactions;
      });
    },
    [setProp]
  );

  const handleChangeShowVotes = useCallback(
    (showVotes: boolean) => {
      setProp((props: Props) => {
        props.showVotes = showVotes;
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

  const handleProjectFilter = useCallback(
    ({ value }: IOption) => {
      setProp((props: Props) => {
        props.projectId = value;
        props.phaseId = undefined;
        props.ideaId = undefined;
      });
    },
    [setProp]
  );

  const handlePhaseFilter = useCallback(
    ({ value }: IOption) => {
      setProp((props: Props) => {
        props.phaseId = value;
        props.ideaId = undefined;

        const phase = phases?.data.find((phase) => phase.id === value);
        const phaseAttrs = phase?.attributes;
        if (!phaseAttrs) return;

        if (phaseAttrs.participation_method === 'ideation') {
          props.showReactions = true;
          props.showVotes = false;
        }
        if (phaseAttrs.participation_method === 'voting') {
          props.showReactions = false;
          props.showVotes = true;
        }
      });
    },
    [setProp, phases?.data]
  );

  const handleChangeIdeaId = useCallback(
    (ideaData?: IIdeaData) => {
      setProp((props: Props) => {
        props.ideaId = ideaData?.id;
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
          label={formatMessage(messages.selectPhase)}
          projectId={projectId}
          phaseId={phaseId}
          participationMethods={['ideation', 'voting']}
          onPhaseFilter={handlePhaseFilter}
        />
      )}

      {phaseId && (
        <Box mb="20px">
          <IdeaSelect
            selectedIdeaId={ideaId}
            onChange={handleChangeIdeaId}
            phaseId={phaseId}
          />
        </Box>
      )}

      <Box mb="20px">
        <Toggle
          checked={showAuthor}
          label={formatMessage(messages.showAuthor)}
          labelTextColor={colors.primary}
          onChange={() => handleChangeShowAuthor(!showAuthor)}
        />
      </Box>

      <Box mb="20px">
        <Toggle
          checked={showContent}
          label={formatMessage(messages.showContent)}
          labelTextColor={colors.primary}
          onChange={() => handleChangeShowDescription(!showContent)}
        />
      </Box>

      <Box mb="20px">
        <CollapseLongTextToggle
          collapseLongText={collapseLongText}
          onChange={handleChangeCollapseLongText}
        />
      </Box>

      <Box mb="20px">
        <Toggle
          checked={showReactions}
          label={formatMessage(messages.showReactions)}
          labelTextColor={colors.primary}
          onChange={() => handleChangeShowReactions(!showReactions)}
        />
      </Box>

      <Box mb="20px">
        <Toggle
          checked={showVotes}
          label={formatMessage(messages.showVotes)}
          labelTextColor={colors.primary}
          onChange={() => handleChangeShowVotes(!showVotes)}
        />
      </Box>
    </Box>
  );
};

export default Settings;

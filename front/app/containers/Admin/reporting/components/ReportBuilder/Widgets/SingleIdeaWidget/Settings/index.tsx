import React, { useCallback } from 'react';

// hooks
import { useNode } from '@craftjs/core';

// components
import { Box, Toggle, colors } from '@citizenlab/cl2-component-library';
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
    ({ value }: IOption) => {
      setProp((props: Props) => {
        props.ideaId = value;
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
          participationMethod="ideation"
          onPhaseFilter={handlePhaseFilter}
        />
      )}

      {phaseId && (
        <IdeaFilter
          label={formatMessage(messages.selectIdea)}
          phaseId={phaseId}
          ideaId={ideaId}
          onIdeaFilter={handleChangeIdeaId}
        />
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

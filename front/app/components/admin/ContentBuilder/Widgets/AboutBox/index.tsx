import React from 'react';

import { Box, colors, Toggle } from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import useFeatureFlag from 'hooks/useFeatureFlag';

import projectMessages from 'containers/ProjectsShowPage/messages';
import {
  excludeHidden,
  groupSpotlightSurveys,
  phaseHasPrimaryCTA,
} from 'containers/ProjectsShowPage/shared/header/participationOptions';
import ProjectInfoSideBar from 'containers/ProjectsShowPage/shared/header/ProjectInfoSideBar';

import useWidgetProjectId from 'components/ProjectPageBuilder/Widgets/useWidgetProjectId';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';

import messages from './messages';
import OptionGroup from './OptionGroup';

type AboutBoxProps = {
  hideParticipationAvatars?: boolean;
  hiddenOptionIds?: string[];
  collapsedButtonTitleMultiloc?: Multiloc;
};

const AboutBox = ({
  hideParticipationAvatars,
  hiddenOptionIds,
  collapsedButtonTitleMultiloc,
}: AboutBoxProps) => {
  const projectID = useWidgetProjectId();
  const componentDefaultPadding = useCraftComponentDefaultPadding();

  return (
    <Box
      id="e2e-about-box"
      maxWidth="1200px"
      margin="0 auto"
      px={componentDefaultPadding}
    >
      {projectID && (
        <ProjectInfoSideBar
          projectId={projectID}
          hideParticipationAvatars={hideParticipationAvatars}
          hiddenOptionIds={hiddenOptionIds}
          collapsedButtonTitleMultiloc={collapsedButtonTitleMultiloc}
        />
      )}
    </Box>
  );
};

const AboutBoxSettings = () => {
  const { formatMessage } = useIntl();
  const isParallelParticipationEnabled = useFeatureFlag({
    name: 'parallel_participation',
  });
  const {
    actions: { setProp },
    hideParticipationAvatars,
    hiddenOptionIds,
    collapsedButtonTitleMultiloc,
  } = useNode<AboutBoxProps & { hiddenOptionIds: string[] }>((node) => ({
    hideParticipationAvatars: node.data.props.hideParticipationAvatars,
    hiddenOptionIds: node.data.props.hiddenOptionIds ?? [],
    collapsedButtonTitleMultiloc: node.data.props.collapsedButtonTitleMultiloc,
  }));

  const projectId = useWidgetProjectId();
  const { data: project } = useProjectById(
    isParallelParticipationEnabled ? projectId : undefined
  );
  const { data: phases } = usePhases(
    isParallelParticipationEnabled ? projectId : undefined
  );
  const { data: standalonePhases } = usePhases(
    isParallelParticipationEnabled ? projectId : undefined,
    'standalone'
  );

  const toggleOption = (phaseId: string) => {
    setProp((props: AboutBoxProps) => {
      const hidden = props.hiddenOptionIds ?? [];
      props.hiddenOptionIds = hidden.includes(phaseId)
        ? hidden.filter((id) => id !== phaseId)
        : [...hidden, phaseId];
    });
  };

  const currentPhase = getCurrentPhase(phases?.data);
  const { open, upcoming } = groupSpotlightSurveys(standalonePhases?.data);

  const timelinePhases =
    currentPhase && phaseHasPrimaryCTA(currentPhase) ? [currentPhase] : [];
  const isArchived = project?.data.attributes.publication_status === 'archived';
  const visibleActiveCount = isArchived
    ? 0
    : excludeHidden(timelinePhases, hiddenOptionIds).length +
      excludeHidden(open, hiddenOptionIds).length;

  return (
    <Box
      background={colors.white}
      my="32px"
      display="flex"
      flexDirection="column"
      gap="24px"
    >
      <Toggle
        checked={!!hideParticipationAvatars}
        onChange={() => {
          setProp(
            (props: AboutBoxProps) =>
              (props.hideParticipationAvatars = !hideParticipationAvatars)
          );
        }}
        label={formatMessage(messages.hideParticipationAvatarsText)}
      />
      {isParallelParticipationEnabled && (
        <>
          <OptionGroup
            title={messages.participationOptionsTimeline}
            description={messages.participationOptionsTimelineDescription}
            phases={timelinePhases}
            hiddenOptionIds={hiddenOptionIds}
            onToggle={toggleOption}
          />
          <OptionGroup
            title={messages.participationOptionsCurrentlyOpen}
            description={messages.participationOptionsCurrentlyOpenDescription}
            phases={open}
            hiddenOptionIds={hiddenOptionIds}
            onToggle={toggleOption}
          />
          <OptionGroup
            title={messages.participationOptionsUpcoming}
            description={messages.participationOptionsUpcomingDescription}
            phases={upcoming}
            hiddenOptionIds={hiddenOptionIds}
            onToggle={toggleOption}
          />
          {visibleActiveCount > 2 && (
            <InputMultilocWithLocaleSwitcher
              id="e2e-participation-box-collapsed-title"
              label={formatMessage(messages.collapsedButtonTitleLabel)}
              placeholder={formatMessage(projectMessages.participate)}
              type="text"
              valueMultiloc={collapsedButtonTitleMultiloc}
              onChange={(value) => {
                setProp(
                  (props: AboutBoxProps) =>
                    (props.collapsedButtonTitleMultiloc = value)
                );
              }}
            />
          )}
        </>
      )}
    </Box>
  );
};

AboutBox.craft = {
  related: {
    settings: AboutBoxSettings,
  },
  custom: {
    title: messages.participationBox,
    noPointerEvents: true,
  },
};

export const aboutBoxTitle = messages.participationBox;

export default AboutBox;

import React from 'react';

import {
  Box,
  CheckboxWithLabel,
  colors,
  Text,
  Toggle,
} from '@citizenlab/cl2-component-library';
import { useNode } from '@craftjs/core';
import { Multiloc } from 'typings';

import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';

import useLocalize from 'hooks/useLocalize';
import useParallelParticipation from 'hooks/useParallelParticipation';

import projectMessages from 'containers/ProjectsShowPage/messages';
import {
  excludeHidden,
  groupExtraSurveys,
  phaseHasPrimaryCTA,
} from 'containers/ProjectsShowPage/shared/header/participationOptions';
import ProjectInfoSideBar from 'containers/ProjectsShowPage/shared/header/ProjectInfoSideBar';

import useWidgetProjectId from 'components/ProjectPageBuilder/Widgets/useWidgetProjectId';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import { getLocalisedDateString } from 'utils/dateUtils';

import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';

import messages from './messages';

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

const phaseDates = (phase: IPhaseData) => {
  const start = getLocalisedDateString(phase.attributes.start_at);
  const end = phase.attributes.end_at
    ? getLocalisedDateString(phase.attributes.end_at)
    : undefined;
  return end ? `${start} – ${end}` : start;
};

const OptionGroup = ({
  title,
  description,
  phases,
  hiddenOptionIds,
  onToggle,
}: {
  title: MessageDescriptor;
  description: MessageDescriptor;
  phases: IPhaseData[];
  hiddenOptionIds: string[];
  onToggle: (phaseId: string) => void;
}) => {
  const localize = useLocalize();

  if (phases.length === 0) return null;

  return (
    <Box>
      <Text m="0px" fontWeight="bold">
        <FormattedMessage {...title} />
      </Text>
      <Text m="0px" mb="8px" color="textSecondary" fontSize="s">
        <FormattedMessage {...description} />
      </Text>
      {phases.map((phase) => (
        <CheckboxWithLabel
          key={phase.id}
          mb="8px"
          checked={!hiddenOptionIds.includes(phase.id)}
          onChange={() => onToggle(phase.id)}
          label={
            <Box ml="8px">
              <Text m="0px">{localize(phase.attributes.title_multiloc)}</Text>
              <Text m="0px" color="textSecondary" fontSize="s">
                {phaseDates(phase)}
              </Text>
            </Box>
          }
        />
      ))}
    </Box>
  );
};

const AboutBoxSettings = () => {
  const { formatMessage } = useIntl();
  const {
    actions: { setProp },
    hideParticipationAvatars,
    hiddenOptionIds,
    collapsedButtonTitleMultiloc,
  } = useNode((node) => ({
    hideParticipationAvatars: node.data.props.hideParticipationAvatars,
    hiddenOptionIds: (node.data.props.hiddenOptionIds ?? []) as string[],
    collapsedButtonTitleMultiloc: node.data.props
      .collapsedButtonTitleMultiloc as Multiloc | undefined,
    id: node.id,
  }));

  const parallelParticipation = useParallelParticipation();
  const projectId = useWidgetProjectId();
  const { data: phases } = usePhases(
    parallelParticipation ? projectId : undefined
  );
  const { data: standalonePhases } = usePhases(
    parallelParticipation ? projectId : undefined,
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
  const { open, upcoming } = groupExtraSurveys(standalonePhases?.data);

  const timelinePhases =
    currentPhase && phaseHasPrimaryCTA(currentPhase) ? [currentPhase] : [];
  const visibleActiveCount =
    excludeHidden(timelinePhases, hiddenOptionIds).length +
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
        checked={hideParticipationAvatars}
        onChange={() => {
          setProp(
            (props: AboutBoxProps) =>
              (props.hideParticipationAvatars = !hideParticipationAvatars)
          );
        }}
        label={formatMessage(messages.hideParticipationAvatarsText)}
      />
      {parallelParticipation && (
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
              placeholder={formatMessage(projectMessages.participateNWays, {
                count: visibleActiveCount,
              })}
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

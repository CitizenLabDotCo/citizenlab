import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IPhaseData } from 'api/phases/types';
import usePhasesByIds from 'api/phases/usePhasesByIds';
import { isActivePhase, isTimelinePhase } from 'api/phases/utils';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import useLocalize from 'hooks/useLocalize';

import { participationMethodMessage } from 'containers/Admin/projects/project/phase/PhaseHeader';

import { GanttItem } from 'components/UI/GanttChart/types';

import { useIntl } from 'utils/cl-intl';
import {
  getPeriodRemainingUntil,
  parseBackendDateString,
} from 'utils/dateUtils';

import messages from './messages';

const usePhaseLabelValues = () => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  return (phase: IPhaseData) => ({
    phaseName: localize(phase.attributes.title_multiloc),
    participationMethod: formatMessage(
      participationMethodMessage[phase.attributes.participation_method]
    ),
  });
};

type ActivePhasesInfoProps = {
  activePhases: IPhaseData[];
  tenantTimezone: string | undefined;
};

const ActivePhasesInfo = ({
  activePhases,
  tenantTimezone,
}: ActivePhasesInfoProps) => {
  const { formatMessage } = useIntl();
  const phaseLabelValues = usePhaseLabelValues();

  if (activePhases.length === 0) {
    return (
      <Box mt="8px">
        <Text fontWeight="bold" color="white" my="0px" variant="bodyS">
          {formatMessage(messages.noActivePhase)}
        </Text>
      </Box>
    );
  }

  return (
    <Box mt="8px">
      <Text fontWeight="bold" color="white" my="0px" variant="bodyS">
        {formatMessage(messages.activePhasesTitle)}
      </Text>
      {activePhases.map((phase) => {
        const daysLeft =
          tenantTimezone && phase.attributes.end_at
            ? getPeriodRemainingUntil(
                phase.attributes.end_at,
                tenantTimezone,
                'days'
              )
            : null;

        return (
          <Box key={phase.id} ml="8px">
            <Text fontWeight="bold" color="white" my="0px" variant="bodyS">
              {formatMessage(
                messages.activePhaseListItem,
                phaseLabelValues(phase)
              )}
            </Text>
            {daysLeft !== null && daysLeft > 0 && (
              <Text color="white" my="0px" variant="bodyS">
                {formatMessage(messages.daysLeft, { days: daysLeft })}
              </Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

const PhaseList = ({ phases }: { phases: IPhaseData[] }) => {
  const { formatMessage } = useIntl();
  const phaseLabelValues = usePhaseLabelValues();

  if (phases.length === 0) {
    return <Box mt="8px">{formatMessage(messages.noPhases)}</Box>;
  }

  const timelinePhases = phases.filter(isTimelinePhase);
  const extraPhases = phases.filter((phase) => !isTimelinePhase(phase));

  return (
    <Box mt="8px">
      <Box>
        <Text fontWeight="bold" color="white" my="0px">
          {formatMessage(messages.phaseListTitle)}
        </Text>
      </Box>
      {timelinePhases.map((phase, idx) => (
        <Box key={phase.id} ml="8px">
          {formatMessage(messages.phaseListItem, {
            number: idx + 1,
            ...phaseLabelValues(phase),
          })}
        </Box>
      ))}
      {extraPhases.map((phase) => (
        <Box key={phase.id} ml="8px">
          {formatMessage(messages.extraPhaseListItem, phaseLabelValues(phase))}
        </Box>
      ))}
    </Box>
  );
};

interface ProjectTooltipProps {
  ganttItem: GanttItem;
  projectsById: Record<string, ProjectMiniAdminData>;
}

const ProjectTooltip = ({ ganttItem, projectsById }: ProjectTooltipProps) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();
  const project = projectsById[ganttItem.id];

  const phaseIds = project.relationships.phases?.data.map((phase) => phase.id);
  const phasesMiniData = usePhasesByIds(phaseIds || []);
  const phases = phasesMiniData
    .map((query) => query.data?.data)
    .filter((data): data is IPhaseData => data !== undefined);

  const activePhases = phases.filter(isActivePhase);
  const folderName = ganttItem.folder || undefined;
  const tenantTimezone =
    appConfiguration?.data.attributes.settings.core.timezone;

  const startDate = ganttItem.start
    ? parseBackendDateString(ganttItem.start).toLocaleDateString()
    : undefined;
  const endDate = ganttItem.end
    ? parseBackendDateString(ganttItem.end).toLocaleDateString()
    : undefined;

  return (
    <Box p="8px">
      <Text fontWeight="bold" color="white" my="0px">
        {ganttItem.title}
      </Text>
      {folderName && (
        <Box>{formatMessage(messages.folder, { folderName })}</Box>
      )}
      {startDate && (
        <Box mt="4px">
          {formatMessage(messages.startDate, { date: startDate })}
        </Box>
      )}
      {endDate ? (
        <Box mt="4px">{formatMessage(messages.endDate, { date: endDate })}</Box>
      ) : (
        <Box mt="4px">{formatMessage(messages.noEndDate)}</Box>
      )}

      <ActivePhasesInfo
        activePhases={activePhases}
        tenantTimezone={tenantTimezone}
      />
      <PhaseList phases={phases} />
    </Box>
  );
};

export default ProjectTooltip;

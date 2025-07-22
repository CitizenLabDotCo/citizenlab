import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IPhaseData } from 'api/phases/types';
import usePhasesByIds from 'api/phases/usePhasesByIds';
import { getCurrentPhase } from 'api/phases/utils';
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

type CurrentPhaseInfoProps = {
  currentPhase: IPhaseData | undefined;
  tenantTimezone: string | undefined;
};

const CurrentPhaseInfo = ({
  currentPhase,
  tenantTimezone,
}: CurrentPhaseInfoProps) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  if (!currentPhase || !tenantTimezone) {
    return null;
  }

  const phaseName = localize(currentPhase.attributes.title_multiloc);
  const participationMethod = formatMessage(
    participationMethodMessage[currentPhase.attributes.participation_method]
  );

  let daysLeftNode: React.ReactNode = null;

  if (currentPhase.attributes.end_at) {
    const daysLeft = getPeriodRemainingUntil(
      currentPhase.attributes.end_at,
      tenantTimezone,
      'days'
    );
    if (daysLeft > 0) {
      daysLeftNode = (
        <Text fontWeight="bold" color="white" my="0px" variant="bodyS">
          {formatMessage(messages.daysLeft, { days: daysLeft })}
        </Text>
      );
    }
  }

  return (
    <Box mt="8px">
      <Text fontWeight="bold" color="white" my="0px" variant="bodyS">
        {formatMessage(messages.currentPhase, {
          phaseName,
          participationMethod,
        })}
      </Text>
      {daysLeftNode}
    </Box>
  );
};

const PhaseList = ({ phases }: { phases: IPhaseData[] }) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  if (phases.length === 0) {
    return <Box mt="8px">{formatMessage(messages.noPhases)}</Box>;
  }

  return (
    <Box mt="8px">
      <Box>
        <Text fontWeight="bold" color="white" my="0px">
          {formatMessage(messages.phaseListTitle)}
        </Text>
      </Box>
      {phases.map((phase, idx) => (
        <Box key={phase.id} ml="8px">
          {formatMessage(messages.phaseListItem, {
            number: idx + 1,
            phaseName: localize(phase.attributes.title_multiloc),
            participationMethod: formatMessage(
              participationMethodMessage[phase.attributes.participation_method]
            ),
          })}
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

  const currentPhase = getCurrentPhase(phases);
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
        <Box mt="4px">
          {formatMessage(messages.startDate, { date: endDate }).replace(
            'Start date',
            'End date'
          )}
        </Box>
      ) : (
        <Box mt="4px">{formatMessage(messages.noEndDate)}</Box>
      )}

      <CurrentPhaseInfo
        currentPhase={currentPhase}
        tenantTimezone={tenantTimezone}
      />
      <PhaseList phases={phases} />
    </Box>
  );
};

export default ProjectTooltip;

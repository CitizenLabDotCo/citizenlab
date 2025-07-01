import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';

import useLocalize from 'hooks/useLocalize';

import { participationMethodMessage } from 'containers/Admin/projects/project/phase/PhaseHeader';

import { GanttItem } from 'components/UI/GanttChart/types';

import { useIntl } from 'utils/cl-intl';
import { getPeriodRemainingUntil } from 'utils/dateUtils';

import messages from './messages';

const ProjectTooltip = ({ project }: { project: GanttItem }) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();
  const localize = useLocalize();
  const { data: phasesData } = usePhases(project.id);
  const phases = phasesData?.data || [];
  const currentPhase = getCurrentPhase(phases);
  const folderName = project.folder || undefined;
  const startDate = project.start
    ? new Date(project.start).toLocaleDateString()
    : undefined;
  const endDate = project.end
    ? new Date(project.end).toLocaleDateString()
    : undefined;

  const tenantTimezone =
    appConfiguration?.data.attributes.settings.core.timezone;

  if (!tenantTimezone) {
    return null;
  }

  let daysLeftBlock: React.ReactNode = undefined;
  let currentPhaseBlock: React.ReactNode = undefined;
  if (currentPhase) {
    const phaseName = localize(currentPhase.attributes.title_multiloc);
    const participationMethod = formatMessage(
      participationMethodMessage[currentPhase.attributes.participation_method]
    );
    if (currentPhase.attributes.end_at) {
      const daysLeft = getPeriodRemainingUntil(
        currentPhase.attributes.end_at,
        tenantTimezone,
        'days'
      );
      if (daysLeft > 0) {
        daysLeftBlock = (
          <Text fontWeight="bold" color="white" my="0px" variant="bodyS">
            {formatMessage(messages.daysLeft, { days: daysLeft })}
          </Text>
        );
      }
    }
    currentPhaseBlock = (
      <Box mt="8px">
        <Text fontWeight="bold" color="white" my="0px" variant="bodyS">
          {formatMessage(messages.currentPhase, {
            phaseName,
            participationMethod,
          })}
        </Text>
        {daysLeftBlock}
      </Box>
    );
  }

  let phasesBlock: React.ReactNode = undefined;
  if (phases.length > 0) {
    phasesBlock = (
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
                participationMethodMessage[
                  phase.attributes.participation_method
                ]
              ),
            })}
          </Box>
        ))}
      </Box>
    );
  } else {
    phasesBlock = <Box mt="8px">{formatMessage(messages.noPhases)}</Box>;
  }

  return (
    <Box p="8px">
      <Text fontWeight="bold" color="white" my="0px">
        {project.title}
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
      {currentPhaseBlock}
      {phasesBlock}
    </Box>
  );
};

export default ProjectTooltip;

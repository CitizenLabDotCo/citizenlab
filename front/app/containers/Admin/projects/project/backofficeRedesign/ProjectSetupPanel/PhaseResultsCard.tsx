import React from 'react';

import { Box, Icon, Text, bo, colors } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import StatCardLink from './StatCardLink';
import usePhaseResults from './usePhaseResults';

interface Props {
  project: IProjectData;
}

const PhaseResultsCard = ({ project }: Props) => {
  const { formatMessage, formatNumber } = useIntl();
  const { results, contributions } = usePhaseResults(project.id);

  const max = Math.max(1, ...results.map((result) => result.count));

  return (
    <StatCardLink
      to="/admin/projects/$projectId/audience"
      params={{ projectId: project.id }}
    >
      <Box display="flex" justifyContent="space-between" gap="8px">
        <Text variant="boMicro" m="0">
          {formatMessage(messages.phaseResultsTitle)}
        </Text>
        <Icon
          name="chevron-right"
          width="16px"
          height="16px"
          fill={colors.textSecondary}
          my="0px"
        />
      </Box>

      {results.map((result) => (
        <Box key={result.id} mt="12px">
          <Box display="flex" justifyContent="space-between" gap="8px">
            <Text variant="boLabel" m="0" color="textPrimary">
              {result.title}
            </Text>
            <Text variant="boLabel" m="0" fontWeight="bold">
              {formatNumber(result.count)}
            </Text>
          </Box>
          <Box
            mt="6px"
            h="4px"
            borderRadius={bo.borderRadius}
            background={colors.grey200}
            overflow="hidden"
          >
            <Box
              h="100%"
              w={`${(result.count / max) * 100}%`}
              background={colors.primary}
            />
          </Box>
          <Text variant="boMicro" mt="4px" mb="0">
            {`${formatMessage(result.method)} · ${formatMessage(result.unit)}`}
          </Text>
        </Box>
      ))}

      <Text variant="boMicro" mt="12px" mb="0">
        {formatMessage(messages.phaseResultsTotal, {
          contributions,
          people: project.attributes.participants_count,
        })}
      </Text>
    </StatCardLink>
  );
};

export default PhaseResultsCard;

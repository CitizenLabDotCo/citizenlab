import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from '../messages';

import StatCardLink from './StatCardLink';
import usePhaseResults from './usePhaseResults';

interface Props {
  project: IProjectData;
}

const FinalRecordCard = ({ project }: Props) => {
  const { formatMessage, formatNumber, formatDate } = useIntl();
  const { phases: phaseList, contributions } = usePhaseResults(project.id);
  const starts = phaseList.map((phase) => phase.attributes.start_at).sort();
  const ends = phaseList
    .map((phase) => phase.attributes.end_at)
    .filter((end): end is string => !!end)
    .sort();
  const openEnded = ends.length < phaseList.length;

  const formatDay = (date: string) =>
    formatDate(date, { day: 'numeric', month: 'long' });

  const getRan = () => {
    if (starts.length === 0) return undefined;
    if (openEnded) {
      return formatMessage(messages.finalRecordRanOpenEnded, {
        start: formatDay(starts[0]),
      });
    }
    return formatMessage(messages.finalRecordRanValue, {
      start: formatDay(starts[0]),
      end: formatDay(ends[ends.length - 1]),
    });
  };

  const rows: { label: MessageDescriptor; value?: string }[] = [
    { label: messages.finalRecordRan, value: getRan() },
    {
      label: messages.finalRecordPeople,
      value: formatNumber(project.attributes.participants_count),
    },
    {
      label: messages.finalRecordContributions,
      value: formatNumber(contributions),
    },
    {
      label: messages.finalRecordPhases,
      value: formatNumber(phaseList.length),
    },
  ];

  return (
    <StatCardLink
      to="/admin/projects/$projectId/audience"
      params={{ projectId: project.id }}
    >
      <Box display="flex" justifyContent="space-between" gap="8px">
        <Text variant="boMicro" m="0">
          {formatMessage(messages.finalRecord)}
        </Text>
        <Icon
          name="chevron-right"
          width="16px"
          height="16px"
          fill={colors.textSecondary}
          my="0px"
        />
      </Box>

      {rows.map(({ label, value }, index) => (
        <Box
          key={label.id}
          display="flex"
          justifyContent="space-between"
          gap="8px"
          py="8px"
          borderBottom={
            index === rows.length - 1 ? 'none' : `1px dashed ${colors.grey300}`
          }
        >
          <Text variant="boLabel" m="0" color="textSecondary">
            {formatMessage(label)}
          </Text>
          <Text variant="boLabel" m="0" fontWeight="semi-bold">
            {value ?? '—'}
          </Text>
        </Box>
      ))}
    </StatCardLink>
  );
};

export default FinalRecordCard;

import React from 'react';

import Icon from 'design-system/Icon';
import Text from 'design-system/Text';

import { IProjectData } from 'api/projects/types';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import styles from './FinalRecordCard.module.css';
import messages from './messages';
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
    <StatCardLink projectId={project.id}>
      <div className={styles.head}>
        <Text variant="small" tone="secondary">
          {formatMessage(messages.finalRecord)}
        </Text>
        <Icon name="chevron-right-16" className={styles.chevron} />
      </div>

      {rows.map(({ label, value }) => (
        <div key={label.id} className={styles.row}>
          <Text variant="ui" tone="secondary">
            {formatMessage(label)}
          </Text>
          <Text variant="uiStrong" tone="primary">
            {value ?? '—'}
          </Text>
        </div>
      ))}
    </StatCardLink>
  );
};

export default FinalRecordCard;

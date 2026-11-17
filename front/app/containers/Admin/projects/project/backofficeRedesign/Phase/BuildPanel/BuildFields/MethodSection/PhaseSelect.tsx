import React from 'react';

import { ListBoxOption } from 'design-system/ListBox';
import Select from 'design-system/Select';
import Spinner from 'design-system/Spinner';

import { IPhaseData, ParticipationMethod } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';

import useLocalize from 'hooks/useLocalize';

import phaseFilterMessages from 'components/UI/PhaseFilter/messages';

import { useIntl } from 'utils/cl-intl';

import styles from './PhaseSelect.module.css';
import 'design-system/tokens.css';

interface Props {
  label: string;
  projectId: string;
  phaseId?: string;
  participationMethods: ParticipationMethod[];
  filterPhases?: (phases: IPhaseData[]) => IPhaseData[];
  onChange: (phaseId: string) => void;
  'data-cy'?: string;
}

const PhaseSelect = ({
  label,
  projectId,
  phaseId,
  participationMethods,
  filterPhases,
  onChange,
  'data-cy': dataCy,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: phases } = usePhases(projectId);

  if (!phases) return <Spinner />;

  const methodPhases = phases.data.filter((phase) =>
    participationMethods.includes(phase.attributes.participation_method)
  );
  const options = (
    filterPhases ? filterPhases(methodPhases) : methodPhases
  ).map(({ id, attributes }) => ({
    id,
    label: localize(attributes.title_multiloc),
  }));

  if (options.length === 0) {
    return (
      <p className={styles.empty}>
        {formatMessage(phaseFilterMessages.noAppropriatePhases)}
      </p>
    );
  }

  return (
    <Select
      label={label}
      items={options}
      data-cy={dataCy}
      value={phaseId ?? null}
      onChange={(key) => {
        if (typeof key === 'string') onChange(key);
      }}
    >
      {(option: { id: string; label: string }) => (
        <ListBoxOption id={option.id}>{option.label}</ListBoxOption>
      )}
    </Select>
  );
};

export default PhaseSelect;

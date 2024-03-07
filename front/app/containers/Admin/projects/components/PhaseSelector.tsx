import React from 'react';

import { useParams } from 'react-router-dom';
import { IOption } from 'typings';

import usePhases from 'api/phases/usePhases';
import { canContainIdeas } from 'api/phases/utils';

import useLocalize from 'hooks/useLocalize';

import Select from 'components/HookForm/Select';

interface Props {
  label?: string | JSX.Element;
}

const PhaseSelector = ({ label }: Props) => {
  const localize = useLocalize();
  const { projectId } = useParams() as { projectId: string };

  const { data: phases } = usePhases(projectId);

  const phasesThatCanContainIdeas = phases?.data.filter(canContainIdeas);
  if (!phasesThatCanContainIdeas) return null;

  const options: IOption[] = phasesThatCanContainIdeas.map((phase) => ({
    value: phase.id,
    label: localize(phase.attributes.title_multiloc),
  }));

  return <Select name="phase_id" options={options} label={label} />;
};

export default PhaseSelector;

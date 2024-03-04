import React from 'react';

// router
import { useParams } from 'react-router-dom';

// api
import usePhases from 'api/phases/usePhases';

import useLocalize from 'hooks/useLocalize';

import Select from 'components/HookForm/Select';

import { canContainIdeas } from 'api/phases/utils';

import { IOption } from 'typings';

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

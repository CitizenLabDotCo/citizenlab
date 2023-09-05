import React from 'react';

// router
import { useParams } from 'react-router-dom';

// api
import usePhases from 'api/phases/usePhases';

// i18n
import useLocalize from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// components
import Select from 'components/HookForm/Select';

// utils
import { canContainIdeas } from 'api/phases/utils';

// typings
import { IOption } from 'typings';

const PhaseSelector = () => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { projectId } = useParams() as { projectId: string };

  const { data: phases } = usePhases(projectId);

  const phasesThatCanContainIdeas = phases?.data.filter(canContainIdeas);
  if (!phasesThatCanContainIdeas) return null;

  const options: IOption[] = phasesThatCanContainIdeas.map((phase) => ({
    value: phase.id,
    label: localize(phase.attributes.title_multiloc),
  }));

  return (
    <Select
      name="phase_id"
      options={options}
      label={formatMessage(messages.phase)}
    />
  );
};

export default PhaseSelector;

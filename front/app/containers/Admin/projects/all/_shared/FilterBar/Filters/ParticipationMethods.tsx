import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { ParticipationMethod } from 'api/phases/types';

import MultiSelect from 'components/UI/MultiSelect';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import { setParam, useParam } from '../../params';

import messages from './messages';
import tracks from './tracks';
import useParticipationMethodOptions from './useParticipationMethodOptions';

interface Props {
  onClear: () => void;
}

const ParticipationMethods = ({ onClear }: Props) => {
  const participationMethods = useParam('participation_methods') ?? [];
  const { formatMessage } = useIntl();
  const options = useParticipationMethodOptions();

  const handleOnChange = (selected: string[]) => {
    setParam('participation_methods', selected as ParticipationMethod[]);
    trackEventByName(tracks.setParticipationMethod, {
      participation_methods: JSON.stringify(selected),
    });
  };

  return (
    <Box display="flex" alignItems="center">
      <MultiSelect
        title={formatMessage(messages.participationMethodLabel)}
        selected={participationMethods}
        options={options}
        openedDefaultValue={participationMethods.length === 0}
        onChange={handleOnChange}
        onClear={onClear}
      />
    </Box>
  );
};

export default ParticipationMethods;

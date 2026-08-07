import React from 'react';

import {
  Box,
  CheckboxWithLabel,
  Text,
} from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import { getLocalisedDateString } from 'utils/dateUtils';

const phaseDates = (phase: IPhaseData) => {
  const start = getLocalisedDateString(phase.attributes.start_at);
  const end = phase.attributes.end_at
    ? getLocalisedDateString(phase.attributes.end_at)
    : undefined;
  return end ? `${start} – ${end}` : start;
};

type Props = {
  title: MessageDescriptor;
  description: MessageDescriptor;
  phases: IPhaseData[];
  hiddenOptionIds: string[];
  onToggle: (phaseId: string) => void;
};

const OptionGroup = ({
  title,
  description,
  phases,
  hiddenOptionIds,
  onToggle,
}: Props) => {
  const localize = useLocalize();

  if (phases.length === 0) return null;

  return (
    <Box>
      <Text m="0px" fontWeight="bold">
        <FormattedMessage {...title} />
      </Text>
      <Text m="0px" mb="8px" color="textSecondary" fontSize="s">
        <FormattedMessage {...description} />
      </Text>
      {phases.map((phase) => (
        <CheckboxWithLabel
          key={phase.id}
          mb="8px"
          checked={!hiddenOptionIds.includes(phase.id)}
          onChange={() => onToggle(phase.id)}
          label={
            <Box ml="8px">
              <Text m="0px">{localize(phase.attributes.title_multiloc)}</Text>
              <Text m="0px" color="textSecondary" fontSize="s">
                {phaseDates(phase)}
              </Text>
            </Box>
          }
        />
      ))}
    </Box>
  );
};

export default OptionGroup;

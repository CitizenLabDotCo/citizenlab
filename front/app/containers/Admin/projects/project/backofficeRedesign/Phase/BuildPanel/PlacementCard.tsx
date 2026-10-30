import React, { ReactNode } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { PhasePlacementType } from 'api/phases/types';

import messages from 'containers/Admin/projects/_shared/components/PhasePlacement/messages';

import { useIntl } from 'utils/cl-intl';

import ChoiceRadio from './ChoiceRadio';
import PanelField from './PanelField';

const OPTIONS = [
  {
    value: 'on_timeline',
    label: messages.timeline,
    description: messages.timelineDescription,
  },
  {
    value: 'standalone',
    label: messages.spotlight,
    description: messages.spotlightDescription,
  },
] as const;

interface Props {
  name: string;
  value: PhasePlacementType;
  disabled?: boolean;
  onChange: (placement: PhasePlacementType) => void;
  children?: ReactNode;
}

const PlacementCard = ({
  name,
  value,
  disabled,
  onChange,
  children,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <PanelField label={formatMessage(messages.surveyPlacement)}>
      <Box display="flex" gap="24px">
        {OPTIONS.map((option) => (
          <ChoiceRadio
            key={option.value}
            name={name}
            value={option.value}
            currentValue={value}
            title={formatMessage(option.label)}
            description={formatMessage(option.description)}
            disabled={disabled}
            onChange={() => {
              if (option.value !== value) onChange(option.value);
            }}
          />
        ))}
      </Box>
      {children}
    </PanelField>
  );
};

export default PlacementCard;

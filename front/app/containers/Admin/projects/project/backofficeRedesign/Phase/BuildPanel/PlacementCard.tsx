import React, { ReactNode } from 'react';

import RadioGroup from 'design-system/RadioGroup';

import { PhasePlacementType } from 'api/phases/types';

import ChoiceRadio from 'containers/Admin/projects/_shared/components/ChoiceRadio';
import messages from 'containers/Admin/projects/_shared/components/PhasePlacement/messages';

import { useIntl } from 'utils/cl-intl';

import styles from './BuildPanel.module.css';
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
  const label = formatMessage(messages.surveyPlacement);

  return (
    <PanelField reviewKey="survey_placement" label={label}>
      <RadioGroup
        aria-label={label}
        name={name}
        value={value}
        onChange={(newValue) => {
          const option = OPTIONS.find((option) => option.value === newValue);
          if (option && option.value !== value) onChange(option.value);
        }}
      >
        <div className={styles.placementChoices}>
          {OPTIONS.map((option) => (
            <ChoiceRadio
              key={option.value}
              value={option.value}
              title={formatMessage(option.label)}
              description={formatMessage(option.description)}
              disabled={disabled}
            />
          ))}
        </div>
      </RadioGroup>
      {children}
    </PanelField>
  );
};

export default PlacementCard;

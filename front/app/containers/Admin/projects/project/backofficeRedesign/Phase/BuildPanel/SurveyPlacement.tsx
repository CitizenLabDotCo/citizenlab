import React, { useState } from 'react';

import { Box, Radio, Text } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import messages from 'containers/Admin/projects/_shared/components/PhasePlacement/messages';
import MovePhaseModal from 'containers/Admin/projects/_shared/components/PhasePlacement/MovePhaseModal';
import { canChangePlacement } from 'containers/Admin/projects/_shared/components/PhasePlacement/utils';

import { useIntl } from 'utils/cl-intl';

import PanelField from './PanelField';

interface Props {
  phase: IPhaseData;
  hasUnsavedChanges: boolean;
  onMoved: (phase: IPhaseData) => void;
}

const SurveyPlacement = ({ phase, hasUnsavedChanges, onMoved }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);

  if (!canChangePlacement(phase)) return null;

  return (
    <PanelField label={formatMessage(messages.surveyPlacement)}>
      <Box display="flex" gap="24px">
        {[
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
        ].map(({ value, label, description }) => (
          <Radio
            key={value}
            variant="bo"
            name={`survey-placement-${phase.id}`}
            value={value}
            currentValue={phase.attributes.placement_type}
            disabled={hasUnsavedChanges}
            onChange={() => {
              if (value !== phase.attributes.placement_type) setOpened(true);
            }}
            label={
              <Box>
                <Text variant="boControl" m="0">
                  {formatMessage(label)}
                </Text>
                <Text variant="boMicro" m="0" color="coolGrey500">
                  {formatMessage(description)}
                </Text>
              </Box>
            }
          />
        ))}
      </Box>
      {hasUnsavedChanges && (
        <Text variant="boHelper">
          {formatMessage(messages.moveSaveChangesFirst)}
        </Text>
      )}
      {opened && (
        <MovePhaseModal
          phase={phase}
          onClose={() => setOpened(false)}
          onMoved={onMoved}
        />
      )}
    </PanelField>
  );
};

export default SurveyPlacement;

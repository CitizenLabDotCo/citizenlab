import React, { useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import { isTimelinePhase } from 'api/phases/utils';

import placementMessages from 'containers/Admin/projects/_shared/components/PhasePlacement/messages';
import { canChangePlacement } from 'containers/Admin/projects/_shared/components/PhasePlacement/utils';

import { SectionField, SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

import ConfirmMoveModal from './ConfirmMoveModal';

interface Props {
  phase: IPhaseData;
  hasUnsavedChanges: boolean;
}

const PhasePlacement = ({ phase, hasUnsavedChanges }: Props) => {
  const [modalOpened, setModalOpened] = useState(false);

  if (!canChangePlacement(phase)) return null;

  const onTimeline = isTimelinePhase(phase);

  return (
    <SectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.placementLabel} />
      </SubSectionTitle>
      <Text mt="0" color="textSecondary">
        <FormattedMessage
          {...(onTimeline
            ? messages.placementOnTimelineDescription
            : messages.placementSpotlightDescription)}
        />
      </Text>
      <Box display="flex">
        <Button
          type="button"
          buttonStyle="secondary-outlined"
          size="s"
          width="auto"
          icon="calendar"
          disabled={hasUnsavedChanges}
          data-cy="e2e-phase-placement-move"
          onClick={() => setModalOpened(true)}
        >
          <FormattedMessage
            {...(onTimeline
              ? placementMessages.moveToSpotlightSurveys
              : placementMessages.moveToTimeline)}
          />
        </Button>
      </Box>
      {hasUnsavedChanges && (
        <Text mb="0" fontSize="s" color="textSecondary">
          <FormattedMessage {...messages.moveSaveChangesFirst} />
        </Text>
      )}
      {modalOpened && (
        <ConfirmMoveModal phase={phase} onClose={() => setModalOpened(false)} />
      )}
    </SectionField>
  );
};

export default PhasePlacement;

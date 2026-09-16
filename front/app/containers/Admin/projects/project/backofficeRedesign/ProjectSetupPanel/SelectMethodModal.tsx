import React, { useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import { ParticipationMethod } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import surveyImage from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/assets/survey.png';
import pickerMessages from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/messages';
import ParticipationMethodChoice from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/ParticipationMethodChoice';
import ParticipationMethodPicker from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/ParticipationMethodPicker';
import projectPageMessages from 'containers/Admin/projects/project/projectPage/messages';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';

import PlacementTabs, { Placement } from './PlacementTabs';

interface Props {
  projectId: string;
  opened: boolean;
  onClose: () => void;
}

// Picking a method only opens the build view of a phase that isn't saved yet:
// the phase is created there once it has a title and dates. The picker needs a
// confirm step because the survey card only reveals the poll option after it
// is selected. An external survey is picked later, from the survey cards in the
// build view.
const SelectMethodModal = ({ projectId, opened, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const spotlightSurveysEnabled = useFeatureFlag({
    name: 'parallel_participation',
  });
  const [placement, setPlacement] = useState<Placement>('timeline');
  const [participationMethod, setParticipationMethod] =
    useState<ParticipationMethod>('ideation');

  const standalone = spotlightSurveysEnabled && placement === 'standalone';

  const handleContinue = () => {
    onClose();
    clHistory.push({
      pathname: `/admin/projects/${projectId}/phases/new`,
      search: standalone
        ? '?placement=standalone'
        : `?participation_method=${participationMethod}`,
    });
  };

  return (
    <Modal
      opened={opened}
      close={onClose}
      width={840}
      padding="0px"
      header={formatMessage(projectPageMessages.newParticipationMethod)}
      footer={
        <Box display="flex" justifyContent="flex-end" width="100%">
          <Button buttonStyle="admin-dark" onClick={handleContinue}>
            {formatMessage(messages.selectMethodContinue)}
          </Button>
        </Box>
      }
    >
      {spotlightSurveysEnabled && (
        <PlacementTabs selected={placement} onSelect={setPlacement} />
      )}
      <Box p="24px">
        {spotlightSurveysEnabled && (
          <Text mt="0" mb="16px" color="textSecondary">
            {formatMessage(
              standalone
                ? messages.placementStandaloneDescription
                : messages.placementTimelineDescription
            )}
          </Text>
        )}
        {standalone ? (
          // Only native surveys can run outside the timeline.
          <Box width="240px">
            <ParticipationMethodChoice
              selected
              title={formatMessage(pickerMessages.surveyTitle)}
              subtitle={formatMessage(pickerMessages.surveyDescription)}
              image={surveyImage}
              participation_method="native_survey"
            />
          </Box>
        ) : (
          <ParticipationMethodPicker
            participation_method={participationMethod}
            showSurveys={false}
            apiErrors={null}
            handleParticipationMethodOnChange={setParticipationMethod}
          />
        )}
      </Box>
    </Modal>
  );
};

export default SelectMethodModal;

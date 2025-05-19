import React, { useState } from 'react';

import {
  Title,
  Box,
  Text,
  Button,
  Input,
  colors,
  Icon,
} from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';
import usePhase from 'api/phases/usePhase';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import { triggerCommunityMonitorModal } from 'containers/App/CommunityMonitorModal/events';

import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const PopupSettings = () => {
  const { formatMessage } = useIntl();

  // Get Community Monitor project and phase
  const { data: project } = useCommunityMonitorProject({});
  const phaseId = project?.data.relationships.current_phase?.data?.id;
  const { data: phase } = usePhase(phaseId);
  const { mutate: updatePhase } = useUpdatePhase();

  // Local state
  const [popupFrequency, setPopupFrequency] = useState(
    typeof phase?.data.attributes.survey_popup_frequency === 'number'
      ? phase.data.attributes.survey_popup_frequency
      : 100
  );
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [savePossible, setSavePossible] = useState(
    phase?.data.attributes.survey_popup_frequency !== popupFrequency
  );

  const updateFrequency = () => {
    // Check that the frequency is a valid number
    if (popupFrequency > 100 || popupFrequency < 0) {
      setErrors({
        // If it's not, show an error
        base: [
          {
            error: 'number_invalid',
          },
        ],
      });
      return;
    }

    // Clear any current errors
    setErrors(null);

    // Update the phase with the new frequency value
    phase?.data.id &&
      updatePhase(
        {
          phaseId: phase.data.id,
          survey_popup_frequency: popupFrequency,
        },
        {
          onSuccess: () => {
            setSuccess(true);
          },
          onError: (error) => {
            setErrors(error.errors);
          },
        }
      );
  };

  return (
    <>
      <Box display="flex" mt="42px">
        <Title m="0px" mr="16px" variant="h2" color="primary">
          {formatMessage(messages.popup)}
        </Title>
        <Button
          bgColor={colors.teal}
          buttonStyle="admin-dark"
          mt="4px"
          px="12px"
          py="0px"
          onClick={() => {
            triggerCommunityMonitorModal({ preview: true });
          }}
        >
          {formatMessage(messages.preview)}
        </Button>
      </Box>

      <Text color="textSecondary">
        {formatMessage(messages.popupDescription)}
      </Text>
      <Text color="textSecondary">
        {formatMessage(messages.defaultFrequency)}
      </Text>
      <Text color="primary" fontWeight="bold">
        {formatMessage(messages.whatConditionsPopup)}
      </Text>

      <Text color="textSecondary">
        <ul>
          <li>{formatMessage(messages.acceptingSubmissions)}</li>
          <li>{formatMessage(messages.residentNotSeenPopup)}</li>
          <li>{formatMessage(messages.residentHasFilledOutSurvey)}</li>
          <li>{formatMessage(messages.uponLoadingPage)}</li>
          <li>{formatMessage(messages.afterResidentAction)}</li>
        </ul>
      </Text>

      <Box mt="32px" display="flex">
        <Box width="280px">
          <Input
            type="number"
            label={formatMessage(messages.frequencyInputLabel)}
            min="0"
            max="100"
            value={popupFrequency.toString()}
            onChange={(value) => {
              // Clear any states related to the value
              setSuccess(false);
              setErrors(null);
              setSavePossible(true);

              // Update the frequency value
              setPopupFrequency(parseFloat(value));
            }}
            placeholder="100"
          />
        </Box>
      </Box>

      <Box display="flex" mt="20px">
        <Button
          disabled={!savePossible}
          buttonStyle="admin-dark"
          onClick={updateFrequency}
        >
          {formatMessage(messages.save)}
        </Button>
      </Box>

      {errors && (
        <Box mt="12px" display="flex">
          <Error apiErrors={errors.base} />
        </Box>
      )}

      {success && (
        <Box mt="12px" display="flex">
          <Text m="0px" color="success">
            {formatMessage(messages.saved)}
          </Text>
          <Icon
            name="check-circle"
            fill={colors.success}
            height="16px"
            ml="4px"
            my="auto"
          />
        </Box>
      )}
    </>
  );
};

export default PopupSettings;

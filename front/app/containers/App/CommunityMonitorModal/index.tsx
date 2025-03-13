import React, { useState, useEffect } from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';
import { get, set } from 'js-cookie';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';
import useCustomFields from 'api/custom_fields/useCustomFields';
import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useInputSchema from 'hooks/useInputSchema';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import QuestionPreview from './components/QuestionPreview';
import messages from './messages';
import { calculateEstimatedSurveyTime } from './utils';

type CommunityMonitorModalProps = {
  showModal?: boolean;
};

const CommunityMonitorModal = ({
  showModal = false,
}: CommunityMonitorModalProps) => {
  const { formatMessage } = useIntl();

  // Check if we have already stored a cookie, indicating the user has seen the modal
  const hasSeenModal = get('community_monitor_modal');

  const [modalOpened, setModalOpened] = useState(
    hasSeenModal ? false : showModal // If the user has seen the modal already, don't show it again.
  );

  const isCommunityMonitorEnabled = useFeatureFlag({
    name: 'community_monitor',
  });

  // Get the community monitor project & check if the survey is currently active
  const { data: project } = useCommunityMonitorProject({
    enabled: isCommunityMonitorEnabled,
  });
  const phaseId = project?.data.relationships.current_phase?.data?.id;
  const { data: phase } = usePhase(phaseId);

  const isSurveyLive = phase?.data.attributes.submission_enabled;

  // Get the custom fields for the survey and calculate estimated time to complete
  const { data: customFields } = useCustomFields({
    projectId: project?.data.id || '',
    phaseId,
  });

  const estimatedMinutesToComplete = calculateEstimatedSurveyTime(customFields);

  // Get the form schema, so we can show the first question
  const { schema, uiSchema, isLoading } = useInputSchema({
    projectId: project?.data.id,
    phaseId,
  });

  // Show the modal if the feature flag is enabled and the survey is live
  useEffect(() => {
    const shouldShowModal = () => {
      const hasSeenModal = get('community_monitor_modal');
      const show =
        isCommunityMonitorEnabled && isSurveyLive && hasSeenModal !== 'true';
      // Math.random() < 1; // TODO: Set % chance of showing the modal
      return show;
    };

    if (shouldShowModal()) {
      setModalOpened(true);
    }
  }, [isCommunityMonitorEnabled, isSurveyLive]);

  const onClose = () => {
    setModalOpened(false);
    set('community_monitor_modal', 'true');
  };

  if (isLoading) {
    return null;
  }

  return (
    <Modal opened={modalOpened} close={onClose} width="420px">
      <Box mt="40px">
        <QuestionPreview
          projectSlug={project?.data.attributes.slug}
          schema={schema}
          uiSchema={uiSchema}
          onClose={onClose}
        />
        <Text textAlign="center" color="textSecondary" fontSize="s">
          {formatMessage(messages.surveyDescription)}
        </Text>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Icon
            my="auto"
            height="14px"
            fill={colors.teal}
            m="0px"
            name="clock-circle"
          />
          <Text
            fontSize="s"
            color="teal"
            textAlign="center"
            lineHeight="1"
            m="0px"
          >
            {formatMessage(messages.xMinutesToComplete, {
              minutes: estimatedMinutesToComplete,
            })}
          </Text>
        </Box>
      </Box>
    </Modal>
  );
};

export default CommunityMonitorModal;

import React, { useState, useCallback, useEffect } from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';
import { get, set } from 'js-cookie';
import { useLocation } from 'react-router-dom';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';
import useAuthUser from 'api/me/useAuthUser';
import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useInputSchema from 'hooks/useInputSchema';

import { PageCategorization } from 'components/Form/typings';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { isAdmin, isModerator } from 'utils/permissions/roles';
import { calculateEstimatedSurveyTime } from 'utils/surveyUtils';

import QuestionPreview from './components/QuestionPreview';
import { triggerCommunityMonitorModal$ } from './events';
import messages from './messages';
import { isAllowedOnUrl } from './utils';

type CommunityMonitorModalProps = {
  showModal?: boolean;
};

const CommunityMonitorModal = ({
  showModal = false,
}: CommunityMonitorModalProps) => {
  const { formatMessage } = useIntl();
  const location = useLocation();

  const { data: authUser } = useAuthUser();
  const isAdminOrModerator = isAdmin(authUser) || isModerator(authUser);

  const isDevelopmentOrCI =
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

  // If the user is on a custom page or the homepage, we can show the modal
  const allowedOnUrl = isAllowedOnUrl(location.pathname);

  // Check if the community monitor is enabled
  const isCommunityMonitorEnabled = useFeatureFlag({
    name: 'community_monitor',
  });

  // Check if we have already stored a cookie, indicating the user has seen the modal
  const hasSeenModal = get('community_monitor_modal_seen');

  const [modalOpened, setModalOpened] = useState(
    hasSeenModal ? false : showModal // If the user has seen the modal already, don't show it again.
  );

  // Get the community monitor project/phase & check if the survey is currently open
  const { data: project } = useCommunityMonitorProject({
    enabled: isCommunityMonitorEnabled,
  });
  const phaseId = project?.data.relationships.current_phase?.data?.id;
  const { data: phase } = usePhase(phaseId);

  const isSurveyLive = phase?.data.attributes.submission_enabled;

  // Check if the user is allowed to take the survey (based on action_descriptors)
  const userPermittedToTakeSurvey =
    !hasSeenModal &&
    project?.data.attributes.action_descriptors.posting_idea.disabled_reason !==
      'posting_limited_max_reached';

  // Get the survey schemas
  const { schema, uiSchema, isLoading } = useInputSchema({
    projectId: project?.data.id,
    phaseId,
  });

  // Calculate estimated time to complete survey
  const estimatedMinutesToComplete = calculateEstimatedSurveyTime(
    uiSchema as PageCategorization
  );

  // Get the survey popup frequency, so we can show the modal at a certain rate
  const surveyPopupFrequency =
    typeof phase?.data.attributes.survey_popup_frequency === 'number'
      ? phase.data.attributes.survey_popup_frequency
      : 100; // Default to 100% if not set

  const shouldShowModal = useCallback(
    (overrideAllowdOnUrl?: boolean) => {
      const show =
        !isAdminOrModerator &&
        (allowedOnUrl || overrideAllowdOnUrl) && // After certain actions or for admin preview, we can ovverride this check
        isCommunityMonitorEnabled &&
        isSurveyLive &&
        userPermittedToTakeSurvey &&
        Math.random() < surveyPopupFrequency / 100 &&
        !isDevelopmentOrCI;

      return show;
    },
    [
      isAdminOrModerator,
      allowedOnUrl,
      isCommunityMonitorEnabled,
      isSurveyLive,
      userPermittedToTakeSurvey,
      surveyPopupFrequency,
      isDevelopmentOrCI,
    ]
  );

  // Display the modal if it should be shown
  useEffect(() => {
    if (shouldShowModal()) {
      setModalOpened(true);
    }
  }, [shouldShowModal]);

  // Listen for any action that triggers the community monitor modal
  useEffect(() => {
    const subscription = triggerCommunityMonitorModal$.subscribe((event) => {
      event.eventValue['preview']
        ? setModalOpened(true) // If the admin is triggering a preview, we open the modal directly
        : shouldShowModal(true) && setModalOpened(true); // Otherwise, we check first if we should show it
    });

    return () => subscription.unsubscribe();
  }, [shouldShowModal]);

  const onClose = () => {
    // Set cookie expiration date to 3 months from today
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 3);

    set('community_monitor_modal_seen', 'true', {
      expires: expirationDate,
    });
    setModalOpened(false);
  };

  if (isLoading) {
    return null;
  }

  return (
    <Modal opened={modalOpened} close={onClose} width="460px">
      <Box mt="40px">
        <QuestionPreview
          projectSlug={project?.data.attributes.slug}
          phaseId={phaseId}
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

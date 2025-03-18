import React, { useState, useCallback, useEffect } from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';
import { get, set } from 'js-cookie';
import { useLocation } from 'react-router-dom';

import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';
import useAuthenticationRequirements from 'api/authentication/authentication_requirements/useAuthenticationRequirements';
import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';
import useCustomFields from 'api/custom_fields/useCustomFields';
import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useInputSchema from 'hooks/useInputSchema';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import QuestionPreview from './components/QuestionPreview';
import { triggerCommunityMonitorModal$ } from './events';
import messages from './messages';
import { calculateEstimatedSurveyTime, isAllowedOnUrl } from './utils';

type CommunityMonitorModalProps = {
  showModal?: boolean;
};

const CommunityMonitorModal = ({
  showModal = false,
}: CommunityMonitorModalProps) => {
  const { formatMessage } = useIntl();
  const location = useLocation();

  // ----- TODO: RE-ENABLE BEFORE RELEASE: -----
  // const { data: authUser } = useAuthUser();
  // const isAdminOrModerator = isAdmin(authUser) || isModerator(authUser);

  // ----- TODO: RE-ENABLE BEFORE RELEASE: -----
  // const isDevelopmentOrCI =
  //   process.env.CI === 'true' || process.env.NODE_ENV === 'development';

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

  // Check if the user is allowed to take the survey (based on requirements endpoint)
  const context: AuthenticationContext = {
    type: 'phase',
    action: 'posting_idea',
    id: phaseId || '',
  };
  const { data: authenticationRequirementsResponse } =
    useAuthenticationRequirements(context);
  const userPermittedToTakeSurvey =
    !hasSeenModal &&
    authenticationRequirementsResponse?.data.attributes.disabled_reason !==
      'already_responded';

  // Get the custom fields for the survey & JSON schemas
  const { data: customFields } = useCustomFields({
    projectId: project?.data.id || '',
    phaseId,
  });
  const { schema, uiSchema, isLoading } = useInputSchema({
    projectId: project?.data.id,
    phaseId,
  });

  // Calculate estimated time to complete survey
  const estimatedMinutesToComplete = calculateEstimatedSurveyTime(customFields);

  // Get the survey popup frequency, so we can show the modal at a certain rate
  const surveyPopupFrequency =
    typeof phase?.data.attributes.survey_popup_frequency === 'number'
      ? phase.data.attributes.survey_popup_frequency
      : 100; // Default to 100% if not set

  const shouldShowModal = useCallback(
    (overrideAllowdOnUrl?: boolean) => {
      const show =
        // ----- TODO: RE-ENABLE BEFORE RELEASE: -----
        // !isAdminOrModerator &&
        (allowedOnUrl || overrideAllowdOnUrl) && // After certain actions or for admin preview, we can ovverride this check
        isCommunityMonitorEnabled &&
        isSurveyLive &&
        userPermittedToTakeSurvey &&
        Math.random() < surveyPopupFrequency / 100;
      // ----- TODO: RE-ENABLE BEFORE RELEASE: -----
      // !isDevelopmentOrCI;
      return show;
    },
    [
      allowedOnUrl,
      isCommunityMonitorEnabled,
      isSurveyLive,
      userPermittedToTakeSurvey,
      surveyPopupFrequency,
    ]
  );

  // Display the modal if it should be shown
  useEffect(() => {
    if (shouldShowModal()) {
      set('community_monitor_modal_seen', 'true');
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
    setModalOpened(false);
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

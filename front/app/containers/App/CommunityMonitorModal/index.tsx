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
import { calculateEstimatedSurveyTime } from './utils';

type CommunityMonitorModalProps = {
  showModal?: boolean;
};

const CommunityMonitorModal = ({
  showModal = false,
}: CommunityMonitorModalProps) => {
  const { formatMessage } = useIntl();
  const location = useLocation();

  // const { data: authUser } = useAuthUser(); ToDo: Re-enable before release
  // const isAdminOrModerator = isAdmin(authUser) || isModerator(authUser); ToDo: Re-enable before release

  // const isDevelopmentOrCI = ToDo: Re-enable before release
  //   process.env.CI === 'true' || process.env.NODE_ENV === 'development';

  // If the user is on a custom page or the homepage, we can show the modal
  const customPageRegex = '/pages/';
  const homepageRegex = /^\/[a-zA-Z]{2}\/(?!\w)/;

  const allowedOnUrl =
    location.pathname.match(customPageRegex) ||
    location.pathname.match(homepageRegex);

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
    authenticationRequirementsResponse?.data.attributes.permitted;

  // Get the custom fields for the survey & JSON schemas
  const { data: customFields } = useCustomFields({
    projectId: project?.data.id || '',
    phaseId,
  });
  const { schema, uiSchema, isLoading } = useInputSchema({
    projectId: project?.data.id,
    phaseId,
  });

  // Calculate estimated time to complete survey:
  const estimatedMinutesToComplete = calculateEstimatedSurveyTime(customFields);

  const shouldShowModal = useCallback(
    (overrideAllowdOnUrl?: boolean) => {
      const show =
        // !isAdminOrModerator &&  ToDo: Re-enable this check when the feature is ready to release
        (allowedOnUrl || overrideAllowdOnUrl) &&
        isCommunityMonitorEnabled &&
        isSurveyLive &&
        userPermittedToTakeSurvey &&
        !hasSeenModal;
      // !isDevelopmentOrCI;
      // Math.random() < 0.01; // ToDo: Set % chance of showing the modal
      return show;
    },
    [
      hasSeenModal,
      allowedOnUrl,
      isCommunityMonitorEnabled,
      isSurveyLive,
      userPermittedToTakeSurvey,
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
        : shouldShowModal(true) && setModalOpened(true);
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

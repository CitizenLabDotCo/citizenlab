import React, { Suspense, useEffect, useRef } from 'react';

import { Spinner, Text } from '@citizenlab/cl2-component-library';
import { FormProvider, useForm } from 'react-hook-form';

import useCustomFields from 'api/custom_fields/useCustomFields';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';
import tracks from '../tracks';

const CustomFields = React.lazy(
  () => import('components/CustomFieldsForm/CustomFields')
);

type QuestionPreviewProps = {
  projectSlug?: string;
  phaseId?: string;
  onClose: () => void;
  projectId: string;
};

const QuestionPreview = ({
  projectSlug,
  phaseId,
  onClose,
  projectId,
}: QuestionPreviewProps) => {
  const { formatMessage } = useIntl();
  const methods = useForm();
  const { data: customFields } = useCustomFields({
    projectId,
    phaseId,
    publicFields: true,
  });

  const firstSentimentLinearScale = customFields?.find(
    (field) => field.input_type === 'sentiment_linear_scale'
  );

  // Extract the first sentiment question from the UI Schema
  const fieldValue = methods.watch(firstSentimentLinearScale?.key || '');

  // onClose gets a new identity on every parent render, so without this guard
  // the effect re-fires and pushes a duplicate history entry each time.
  const hasRedirected = useRef(false);

  // If the user has answered the question, redirect them to the full survey
  useEffect(() => {
    const redirectToFullSurvey = () => {
      hasRedirected.current = true;

      // Close the modal
      onClose();

      // Track the popup interaction
      trackEventByName(tracks.communityMonitorPopupAnsweredAndRedirected);

      // Redirect to full survey page. Pass go_back so leaving the survey
      // returns the user here rather than to the (non-public) project page.
      clHistory.push(
        `/projects/${projectSlug}/surveys/new?phase_id=${phaseId}&go_back=true`
      );
    };
    if (fieldValue && !hasRedirected.current) {
      redirectToFullSurvey();
    }
  }, [fieldValue, onClose, projectSlug, phaseId]);

  if (!customFields) {
    return <Spinner />;
  }

  // If there is no first sentiment linear scale, do not render anything
  if (!firstSentimentLinearScale) {
    return null;
  }

  return (
    <FormProvider {...methods}>
      <Suspense>
        <CustomFields
          questions={[{ ...firstSentimentLinearScale, required: true }]}
          projectId={projectId}
          participationMethod={'native_survey'}
        />
      </Suspense>
      <Text
        id="community-monitor-modal-title"
        textAlign="center"
        color="textSecondary"
        fontSize="s"
      >
        {formatMessage(messages.surveyDescription)}
      </Text>
    </FormProvider>
  );
};

export default QuestionPreview;

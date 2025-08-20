import React, { Suspense, useEffect } from 'react';

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

  // If the user has answered the question, redirect them to the full survey
  useEffect(() => {
    const redirectToFullSurvey = () => {
      // Close the modal
      onClose();

      // Track the popup interaction
      trackEventByName(tracks.communityMonitorPopupAnsweredAndRedirected);

      // Redirect to full survey page
      clHistory.push(
        `/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`
      );
    };
    if (fieldValue) {
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
      <Text textAlign="center" color="textSecondary" fontSize="s">
        {formatMessage(messages.surveyDescription)}
      </Text>
    </FormProvider>
  );
};

export default QuestionPreview;

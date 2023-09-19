import React, { lazy } from 'react';
import { useParams } from 'react-router-dom';
import useFormCustomFields from 'api/custom_fields/useCustomFields';
import { nativeSurveyConfig } from '../utils';
import { getUpdatedConfiguration } from 'components/FormBuilder/utils';

const FormBuilder = lazy(() => import('components/FormBuilder/edit'));

const SurveyFormBuilder = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };

  const { data: formCustomFields } = useFormCustomFields({
    projectId,
    phaseId,
  });
  const goBackUrl = `/admin/projects/${projectId}/native-survey`;

  return (
    <FormBuilder
      builderConfig={getUpdatedConfiguration(
        nativeSurveyConfig,
        formCustomFields,
        goBackUrl
      )}
    />
  );
};

export default SurveyFormBuilder;

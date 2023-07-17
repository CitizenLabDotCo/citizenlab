import React, { lazy } from 'react';
import { useParams } from 'react-router-dom';
import useFormCustomFields from 'hooks/useFormCustomFields';
import { nativeSurveyConfig } from '../utils';
import { getUpdatedConfiguration } from 'components/FormBuilder/utils';
import useCustomFields from 'api/custom_fields/useCustomFields';

const FormBuilder = lazy(() => import('components/FormBuilder/edit'));

const SurveyFormBuilder = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };

  const formCustomFields = useFormCustomFields({
    projectId,
    phaseId,
  });

  const { data: customFields } = useCustomFields({ projectId, phaseId });
  console.log('customFields', customFields);
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

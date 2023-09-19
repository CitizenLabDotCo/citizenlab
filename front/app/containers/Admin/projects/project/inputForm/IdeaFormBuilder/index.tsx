import React, { lazy } from 'react';

// components
import { getUpdatedConfiguration } from 'components/FormBuilder/utils';

// hooks
import useFormCustomFields from 'api/custom_fields/useCustomFields';
import { useParams } from 'react-router-dom';

// utils
import { ideationConfig } from '../utils';

const FormBuilder = lazy(() => import('components/FormBuilder/edit'));

const IdeaFormBuilder = () => {
  const { projectId } = useParams() as {
    projectId: string;
  };

  const { data: formCustomFields } = useFormCustomFields({
    projectId,
  });

  const goBackUrl = `/admin/projects/${projectId}/ideaform`;

  return (
    <FormBuilder
      builderConfig={getUpdatedConfiguration(
        ideationConfig,
        formCustomFields,
        goBackUrl
      )}
    />
  );
};

export default IdeaFormBuilder;

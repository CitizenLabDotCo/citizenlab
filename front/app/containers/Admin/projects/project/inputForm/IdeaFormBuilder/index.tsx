import React, { lazy } from 'react';

// components
import { getUpdatedConfiguration } from 'components/FormBuilder/utils';

// hooks
import useFormCustomFields from 'hooks/useFormCustomFields';
import { useParams } from 'react-router-dom';

// utils
import { ideationConfig } from '../utils';

const FormBuilder = lazy(() => import('components/FormBuilder/edit'));

const IdeaFormBuilder = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };

  const formCustomFields = useFormCustomFields({
    projectId,
    phaseId,
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

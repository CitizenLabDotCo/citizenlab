import { getUpdatedConfiguration } from 'components/FormBuilder/utils';
import useFormCustomFields from 'hooks/useFormCustomFields';
import React, { lazy } from 'react';
import { useParams } from 'react-router-dom';
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

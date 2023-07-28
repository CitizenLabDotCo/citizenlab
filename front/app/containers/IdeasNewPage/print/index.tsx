import React from 'react';

// api
import useInputSchema from 'hooks/useInputSchema';

// router
import { useParams, useSearchParams } from 'react-router-dom';

const IdeaFormPrintable = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const phaseId = searchParams.get('phase_id');

  const { schema /* uiSchema, inputSchemaError */ } = useInputSchema({
    projectId,
    phaseId,
  });

  return <>{schema}</>;
};

export default IdeaFormPrintable;

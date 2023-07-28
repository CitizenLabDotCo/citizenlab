import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

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

  return (
    <Box>
      Blablablalb
      <Box>{projectId}</Box>
      <Box>{phaseId}</Box>
    </Box>
  );
};

export default IdeaFormPrintable;

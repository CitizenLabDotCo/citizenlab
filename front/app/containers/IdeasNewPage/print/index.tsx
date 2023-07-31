import React from 'react';

// api
import useInputSchema from 'hooks/useInputSchema';
import useProjectById from 'api/projects/useProjectById';

// components
import { Box } from '@citizenlab/cl2-component-library';

// router
import { useParams, useSearchParams } from 'react-router-dom';

const IdeaFormPrintable = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const phaseId = searchParams.get('phase_id');

  const { data: project } = useProjectById(projectId);

  const { uiSchema } = useInputSchema({
    projectId,
    phaseId,
  });

  if (!uiSchema || !project) return null;
  console.log(uiSchema);

  return (
    <>
      {uiSchema.elements.map((page, i) => (
        <Box key={i} w="100%" h="500px" m="100px">
          {(page as any).elements.map((element) => (
            <>bla</>
          ))}
        </Box>
      ))}
    </>
  );
};

export default IdeaFormPrintable;

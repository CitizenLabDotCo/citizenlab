import React from 'react';

// api
import useInputSchema from 'hooks/useInputSchema';
import useProjectById from 'api/projects/useProjectById';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Text from './formElements/Text';

// router
import { useParams, useSearchParams } from 'react-router-dom';

// typings
import { Layout } from '@jsonforms/core';
import { Element } from './typings';

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

  return (
    <>
      {uiSchema.elements.map((page: Layout, pageIndex) => (
        <Box key={pageIndex} w="100%" h="500px" m="100px">
          {page.elements.map((element: Element, elementIndex) => (
            <Box key={`${pageIndex}-${elementIndex}`} mb="60px">
              {element.options.input_type === 'select' && (
                // <SingleChoice element={element} />
                <>Select</>
              )}

              {element.options.input_type === 'multiselect' && (
                <>Multi select</>
              )}

              {element.options.input_type === 'text' && (
                <Text element={element} lines={1} />
              )}

              {element.options.input_type === 'multiline_text' && (
                <Text element={element} lines={4} />
              )}
            </Box>
          ))}
        </Box>
      ))}
    </>
  );
};

export default IdeaFormPrintable;

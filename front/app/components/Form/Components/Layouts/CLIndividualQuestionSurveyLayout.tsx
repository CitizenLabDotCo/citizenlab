import React, { memo, useState } from 'react';
import {
  Categorization,
  isCategorization,
  LayoutProps,
  rankWith,
  UISchemaElement,
} from '@jsonforms/core';
import { JsonFormsDispatch, withJsonFormsLayoutProps } from '@jsonforms/react';
import { Box, Button } from '@citizenlab/cl2-component-library';
import StepWrapper from './StepWrapper';
import Step from './Step';

const CLIndividualQuestionSurveyLayout = memo(
  // here we can cast types because the tester made sure we only get categorization layouts
  ({ schema, uischema, path, renderers, cells, enabled }: LayoutProps) => {

    const [currentStep, setCurrentStep] = useState(1);
    let renderableElements: UISchemaElement[] = []

    const uiSchemaElements = (uischema as Categorization).elements.forEach((e) => {
      renderableElements = [...renderableElements, ...e.elements];
    })

    const onClickNext = () => {
      setCurrentStep(currentStep + 1);
    }

    const onClickPrevious = () => {
      setCurrentStep(currentStep - 1);
    }

    return (
      <Box>
          <StepWrapper currentStep={currentStep}>
            {renderableElements.map((e, index, allElements) => (
              <Step key={index}>
                <JsonFormsDispatch
                  renderers={renderers}
                  cells={cells}
                  uischema={e}
                  schema={schema}
                  path={path}
                  enabled={enabled}
                />
                <Box display='flex' flexDirection='row' ml='0px' mb='0px' position='absolute' bottom='0px' right='0px'>
                  {currentStep > 1 && <Button onClick={onClickPrevious} icon="arrow-back" mr="4px" />}
                  {currentStep < allElements.length && <Button onClick={onClickNext} icon="arrowLeft" />}
                </Box>
              </Step>
            ))}
          </StepWrapper>
      </Box>
    );
  }
);

export default withJsonFormsLayoutProps(CLIndividualQuestionSurveyLayout);

export const clIndividualQuestionCategoryTester = rankWith(3, isCategorization);

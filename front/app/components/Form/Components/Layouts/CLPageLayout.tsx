import React, { memo, useState, useEffect, useContext } from 'react';
import { LayoutProps, RankedTester, rankWith } from '@jsonforms/core';
import { JsonFormsDispatch, withJsonFormsLayoutProps } from '@jsonforms/react';
import { Box, fontSizes, media } from '@citizenlab/cl2-component-library';
import { FormSection } from 'components/UI/FormComponents';
import Button from 'components/UI/Button';
import styled from 'styled-components';
import { FormElement } from 'components/IdeaForm';
import { FormContext } from 'components/Form/contexts';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import Ajv from 'ajv';
import {
  getSanitizedFormData,
  getPageSchema,
  PageCategorization,
  isPageCategorization,
} from 'components/Form/Components/Layouts/utils';
import { useTheme } from 'styled-components';

const StyledFormSection = styled(FormSection)`
  max-width: 100%;
  width: 100%;

  ${media.phone`
    padding-left: 25px;
    padding-right: 25px;
  `}

  ${media.phone`
    padding-left: 18px;
    padding-right: 18px;
  `}
`;

const FormSectionTitleStyled = styled.h2`
  font-size: ${fontSizes.xl}px;
  font-weight: 600;
  line-height: 28px;
  margin-bottom: 30px;
`;

const StyledBox = styled(Box)`
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  width: 100%;

  ${media.phone`
    flex-direction: column;
  `}
`;

const PreviousButton = styled(Button)`
  margin-right: 16px;

  ${media.phone`
    margin-right: 0;
  `}
`;

const customAjv = new Ajv({ useDefaults: 'empty', removeAdditional: true });

const CLPageLayout = memo(
  // here we can cast types because the tester made sure we only get categorization layouts
  ({
    schema,
    uischema,
    path,
    renderers,
    cells,
    enabled,
    data,
  }: LayoutProps) => {
    const { setShowSubmitButton, onSubmit, setShowAllErrors } =
      useContext(FormContext);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const uiCategories = (uischema as PageCategorization).elements;
    const theme: any = useTheme();

    useEffect(() => {
      setShowSubmitButton(false);
    }, [setShowSubmitButton]);

    const showSubmit = currentStep === uiCategories.length - 1;

    const handleNextAndSubmit = () => {
      if (showSubmit) {
        onSubmit();
        return;
      }

      const currentPageCategorization = uiCategories[currentStep];
      if (
        customAjv.validate(
          getPageSchema(schema, currentPageCategorization),
          getSanitizedFormData(data)
        )
      ) {
        setShowAllErrors(false);
        setCurrentStep(currentStep + 1);
      } else {
        setShowAllErrors(true);
      }
    };

    return (
      <Box
        width="100%"
        maxWidth="700px"
        display="flex"
        flexDirection="column"
        padding="0 20px 30px 20px"
        margin="auto"
      >
        {uiCategories.map((e, index) => {
          return (
            currentStep === index && (
              <StyledFormSection key={index}>
                <FormSectionTitleStyled>{e.label}</FormSectionTitleStyled>
                {e.elements.map((e, index) => (
                  <FormElement key={index}>
                    <JsonFormsDispatch
                      renderers={renderers}
                      cells={cells}
                      uischema={e}
                      schema={schema}
                      path={path}
                      enabled={enabled}
                    />
                  </FormElement>
                ))}
              </StyledFormSection>
            )
          );
        })}
        <StyledBox>
          <Button
            onClick={handleNextAndSubmit}
            mb="20px"
            icon="chevron-right"
            iconPos="right"
            key={currentStep.toString()}
            bgColor={showSubmit ? theme.colors.green500 : theme.colors.primary}
            width="100%"
          >
            <FormattedMessage
              {...(showSubmit ? messages.submitSurvey : messages.next)}
            />
          </Button>
          {currentStep !== 0 && (
            <PreviousButton
              onClick={() => {
                setCurrentStep(currentStep - 1);
              }}
              mb="20px"
              icon="chevron-left"
              bgColor="white"
              buttonStyle="secondary-outlined"
              width="100%"
            >
              <FormattedMessage {...messages.previous} />
            </PreviousButton>
          )}
        </StyledBox>
      </Box>
    );
  }
);

export default withJsonFormsLayoutProps(CLPageLayout);

export const clPageTester: RankedTester = rankWith(5, isPageCategorization);

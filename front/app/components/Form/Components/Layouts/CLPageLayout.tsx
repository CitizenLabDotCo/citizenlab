import React, { memo, useState, useEffect, useContext } from 'react';
import { LayoutProps, RankedTester, rankWith } from '@jsonforms/core';
import { JsonFormsDispatch, withJsonFormsLayoutProps } from '@jsonforms/react';
import styled, { useTheme } from 'styled-components';
import Ajv from 'ajv';

// Components
import {
  Box,
  Title,
  useBreakpoint,
  media,
} from '@citizenlab/cl2-component-library';
import { FormSection } from 'components/UI/FormComponents';
import Button from 'components/UI/Button';

// Context
import { FormContext } from 'components/Form/contexts';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// Utils
import {
  getSanitizedFormData,
  getPageSchema,
  PageCategorization,
  isPageCategorization,
} from 'components/Form/Components/Layouts/utils';

const StyledFormSection = styled(FormSection)`
  max-width: 100%;
  width: 100%;

  ${media.phone`
    padding-left: 18px;
    padding-right: 18px;
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
    const { setShowSubmitButton, onSubmit, setShowAllErrors, formSubmitText } =
      useContext(FormContext);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const uiCategories = (uischema as PageCategorization).elements;
    const theme: any = useTheme();
    const isSmallerThanXlPhone = useBreakpoint('phone');
    const submitText = formSubmitText || messages.submit;

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
                <Title fontSize="xl" mb="32px">
                  {e.label}
                </Title>
                {e.elements.map((e, index) => (
                  <Box width="100%" mb="40px" key={index}>
                    <JsonFormsDispatch
                      renderers={renderers}
                      cells={cells}
                      uischema={e}
                      schema={schema}
                      path={path}
                      enabled={enabled}
                    />
                  </Box>
                ))}
              </StyledFormSection>
            )
          );
        })}
        <Box
          display="flex"
          flexDirection={isSmallerThanXlPhone ? 'column' : 'row-reverse'}
          justifyContent="space-between"
          width="100%"
        >
          <Button
            onClick={handleNextAndSubmit}
            mb="20px"
            icon="chevron-right"
            iconPos="right"
            key={currentStep.toString()}
            bgColor={showSubmit ? theme.colors.green500 : theme.colors.primary}
            width="100%"
          >
            <FormattedMessage {...(showSubmit ? submitText : messages.next)} />
          </Button>
          {currentStep !== 0 && (
            <Button
              onClick={() => {
                setCurrentStep(currentStep - 1);
              }}
              mb="20px"
              icon="chevron-left"
              bgColor="white"
              buttonStyle="secondary-outlined"
              width="100%"
              marginRight={isSmallerThanXlPhone ? '0px' : '16px'}
            >
              <FormattedMessage {...messages.previous} />
            </Button>
          )}
        </Box>
      </Box>
    );
  }
);

export default withJsonFormsLayoutProps(CLPageLayout);

export const clPageTester: RankedTester = rankWith(5, isPageCategorization);

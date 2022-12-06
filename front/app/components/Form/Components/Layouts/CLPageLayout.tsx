import React, { memo, useState, useEffect, useContext } from 'react';
import { LayoutProps, RankedTester, rankWith } from '@jsonforms/core';
import {
  JsonFormsDispatch,
  withJsonFormsLayoutProps,
  useJsonForms,
} from '@jsonforms/react';
import styled, { useTheme } from 'styled-components';
import Ajv from 'ajv';

// Components
import {
  Box,
  Button,
  Title,
  useBreakpoint,
  media,
} from '@citizenlab/cl2-component-library';
import { FormSection } from 'components/UI/FormComponents';
import QuillEditedContent from 'components/UI/QuillEditedContent';

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
  PageType,
} from 'components/Form/Components/Layouts/utils';
import { isVisible } from '../Controls/visibilityUtils';

const StyledFormSection = styled(FormSection)`
  max-width: 100%;
  width: 100%;
  padding-top: 0px;

  ${media.phone`
    padding-left: 16px;
    padding-right: 16px;
  `}
`;

const customAjv = new Ajv({ useDefaults: 'empty', removeAdditional: true });

const CLPageLayout = memo(
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
    // We can cast types because the tester made sure we only get correct values
    const pageTypeElements = (uischema as PageCategorization)
      .elements as PageType[];
    const [uiPages, setUiPages] = useState<PageType[]>(pageTypeElements);
    const theme = useTheme();
    const formState = useJsonForms();
    const isSmallerThanXlPhone = useBreakpoint('phone');
    const submitText = formSubmitText || messages.submit;
    const showSubmit = currentStep === uiPages.length - 1;
    const dataCyValue = showSubmit ? 'e2e-submit-form' : 'e2e-next-page';
    const hasPreviousPage = currentStep !== 0;

    useEffect(() => {
      // We can cast types because the tester made sure we only get correct values
      const allPageTypeElements = (uischema as PageCategorization)
        .elements as PageType[];
      const visiblePages = allPageTypeElements.filter((element) => {
        const isPageVisible = isVisible(
          element,
          formState.core?.data,
          '',
          customAjv
        );
        return isPageVisible;
      });
      setUiPages(visiblePages);
      setShowSubmitButton(false);
    }, [setShowSubmitButton, formState.core?.data, uischema]);

    const handleNextAndSubmit = () => {
      if (showSubmit) {
        onSubmit();
        return;
      }

      const currentPageCategorization = uiPages[currentStep];
      if (
        customAjv.validate(
          getPageSchema(
            schema,
            currentPageCategorization,
            formState.core?.data,
            customAjv
          ),
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
        {uiPages.map((page, index) => {
          return (
            currentStep === index && (
              <StyledFormSection key={index}>
                <Title variant="h2" mb="32px" color="tenantText">
                  {page.options.title}
                </Title>
                {page.options?.description && (
                  <Box mb="16px">
                    <QuillEditedContent
                      fontWeight={400}
                      textColor={theme.colors.tenantText}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: page.options.description,
                        }}
                      />
                    </QuillEditedContent>
                  </Box>
                )}
                {page.elements.map((elementUiSchema, index) => (
                  <Box width="100%" mb="40px" key={index}>
                    <JsonFormsDispatch
                      renderers={renderers}
                      cells={cells}
                      uischema={elementUiSchema}
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
            data-cy={dataCyValue}
            mb="20px"
            icon="chevron-right"
            iconPos="right"
            key={currentStep.toString()}
            bgColor={showSubmit ? theme.colors.green500 : theme.colors.primary}
            width="100%"
          >
            <FormattedMessage {...(showSubmit ? submitText : messages.next)} />
          </Button>
          {hasPreviousPage && (
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

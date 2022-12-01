import React, { memo, useState, useEffect, useContext } from 'react';
import { LayoutProps, RankedTester, rankWith } from '@jsonforms/core';
import { JsonFormsDispatch, withJsonFormsLayoutProps } from '@jsonforms/react';
import styled, { useTheme } from 'styled-components';
import { defaultStyles } from 'utils/styleUtils';
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
} from 'components/Form/Components/Layouts/utils';

const StyledFormSection = styled(FormSection)`
  max-width: 100%;
  width: 100%;
  padding: 32px 32px 0 32px;

  ${media.phone`
    padding: 24px 16px 0 16px;
  `}

  &:last-child {
    margin-bottom: 0;
  }
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
    const uiPages = (uischema as PageCategorization).elements;
    const theme: any = useTheme();
    const isSmallerThanXlPhone = useBreakpoint('phone');
    const submitText = formSubmitText || messages.submit;
    const showSubmit = currentStep === uiPages.length - 1;
    const dataCyValue = showSubmit ? 'e2e-submit-form' : 'e2e-next-page';
    const hasPreviousPage = currentStep !== 0;

    useEffect(() => {
      setShowSubmitButton(false);
    }, [setShowSubmitButton]);

    const handleNextAndSubmit = () => {
      if (showSubmit) {
        onSubmit();
        return;
      }

      const currentPageCategorization = uiPages[currentStep];
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
        padding="12px 20px 30px 20px"
        margin="auto"
      >
        {uiPages.map((page, index) => {
          return (
            currentStep === index && (
              <StyledFormSection key={index}>
                {page.options.title && (
                  <Title variant="h2" mt="0" mb="24px" color="tenantText">
                    {page.options.title}
                  </Title>
                )}
                {page.options.description && (
                  <Box mb="48px">
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
            boxShadow={defaultStyles.boxShadow}
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
              buttonStyle="white"
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

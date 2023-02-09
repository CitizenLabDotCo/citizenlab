import React, { memo, useState, useEffect, useContext, useRef } from 'react';
import { LayoutProps, RankedTester, rankWith } from '@jsonforms/core';
import {
  JsonFormsDispatch,
  withJsonFormsLayoutProps,
  useJsonForms,
} from '@jsonforms/react';
import { defaultStyles } from 'utils/styleUtils';
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
  getFilteredDataForUserPath,
} from 'components/Form/Components/Layouts/utils';
import { isVisible } from '../Controls/visibilityUtils';
import { isNilOrError } from 'utils/helperUtils';

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
    const topAnchorRef = useRef<HTMLInputElement>(null);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    // We can cast types because the tester made sure we only get correct values
    const pageTypeElements = (uischema as PageCategorization)
      .elements as PageType[];
    const [uiPages, setUiPages] = useState<PageType[]>(pageTypeElements);
    const [userPagePath] = useState<PageType[]>([]);
    const theme = useTheme();
    const formState = useJsonForms();
    const isSmallerThanXlPhone = useBreakpoint('phone');
    const submitText = formSubmitText || messages.submit;
    const showSubmit = currentStep === uiPages.length - 1;
    const dataCyValue = showSubmit ? 'e2e-submit-form' : 'e2e-next-page';
    const hasPreviousPage = currentStep !== 0;
    const useTopAnchor =
      isSmallerThanXlPhone &&
      !isNilOrError(topAnchorRef) &&
      topAnchorRef.current;

    useEffect(() => {
      // We can cast types because the tester made sure we only get correct values
      const allPageTypeElements = (uischema as PageCategorization)
        .elements as PageType[];
      const visiblePages = allPageTypeElements.filter((element) => {
        const isPageVisible = isVisible(
          element,
          formState.core?.data,
          '',
          customAjv,
          allPageTypeElements
        );
        return isPageVisible;
      });
      setUiPages(visiblePages);
      setShowSubmitButton(false);
    }, [setShowSubmitButton, formState.core?.data, uischema]);

    const scrollToTop = () => {
      if (useTopAnchor) {
        topAnchorRef.current.scrollIntoView();
      } else {
        window.scrollTo(0, 0);
      }
    };

    const handleNextAndSubmit = async () => {
      if (showSubmit) {
        setIsLoading(true);
        await onSubmit(getFilteredDataForUserPath(userPagePath, data));
        return;
      }

      const currentPageCategorization = uiPages[currentStep];
      userPagePath.push(uiPages[currentStep]);
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
        scrollToTop();
        setCurrentStep(currentStep + 1);
        setIsLoading(false);
      } else {
        setShowAllErrors(true);
      }
    };

    return (
      <>
        <Box
          ref={topAnchorRef}
          marginTop={'-140px'} // TODO: Find cleaner solution for mobile scrollTo behaviour.
          marginBottom={'140px'}
          id="top-anchor"
        />

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
                    <Title variant="h2" mt="0" mb="24px" color="tenantPrimary">
                      {page.options.title}
                    </Title>
                  )}
                  {page.options.description && (
                    <Box mb={page.elements.length >= 1 ? '48px' : '28px'}>
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
                    <Box width="100%" mb="28px" key={index}>
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
            mb="60px"
          >
            <Button
              onClick={handleNextAndSubmit}
              data-cy={dataCyValue}
              mb="20px"
              icon={showSubmit ? undefined : 'chevron-right'}
              iconPos="right"
              key={currentStep.toString()}
              bgColor={
                showSubmit
                  ? theme.colors.tenantSecondary
                  : theme.colors.tenantPrimary
              }
              width="100%"
              boxShadow={defaultStyles.boxShadow}
              processing={isLoading}
            >
              <FormattedMessage
                {...(showSubmit ? submitText : messages.next)}
              />
            </Button>
            {hasPreviousPage && (
              <Button
                onClick={() => {
                  setCurrentStep(currentStep - 1);
                  userPagePath.pop();
                  scrollToTop();
                }}
                data-cy="e2e-previous-page"
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
      </>
    );
  }
);

export default withJsonFormsLayoutProps(CLPageLayout);

export const clPageTester: RankedTester = rankWith(5, isPageCategorization);

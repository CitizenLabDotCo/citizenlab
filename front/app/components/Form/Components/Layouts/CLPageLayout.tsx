import React, { memo, useState, useEffect, useContext, useRef } from 'react';

import {
  Box,
  Title,
  useBreakpoint,
  media,
} from '@citizenlab/cl2-component-library';
import { LayoutProps, RankedTester, rankWith } from '@jsonforms/core';
import {
  JsonFormsDispatch,
  withJsonFormsLayoutProps,
  useJsonForms,
} from '@jsonforms/react';
import styled, { useTheme } from 'styled-components';

import { customAjv } from 'components/Form';
import {
  getSanitizedFormData,
  getPageSchema,
  PageCategorization,
  isPageCategorization,
  PageType,
  getFilteredDataForUserPath,
  getFormCompletionPercentage,
} from 'components/Form/Components/Layouts/utils';
import { FormContext } from 'components/Form/contexts';
import { FormSection } from 'components/UI/FormComponents';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { isNilOrError } from 'utils/helperUtils';

import {
  extractElementsByOtherOptionLogic,
  isVisible,
} from '../Controls/visibilityUtils';

import PageControlButtons from './PageControlButtons';

const StyledFormSection = styled(FormSection)`
  max-width: 100%;
  width: 100%;
  padding: 24px;
  flex-direction: column;
  ${media.phone`
    padding: 16px;
  `}
`;

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
    const { onSubmit, setShowAllErrors, setFormData, setCompletionPercentage } =
      useContext(FormContext);
    const topAnchorRef = useRef<HTMLInputElement>(null);
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    // We can cast types because the tester made sure we only get correct values
    const pageTypeElements = (uischema as PageCategorization)
      .elements as PageType[];
    const [uiPages, setUiPages] = useState<PageType[]>(pageTypeElements);
    const [userPagePath] = useState<PageType[]>([]);
    const [scrollToError, setScrollToError] = useState(false);
    const theme = useTheme();
    const formState = useJsonForms();
    const isSmallerThanPhone = useBreakpoint('phone');
    const showSubmit = currentStep === uiPages.length - 1;
    const dataCyValue = showSubmit ? 'e2e-submit-form' : 'e2e-next-page';
    const hasPreviousPage = currentStep !== 0;
    const useTopAnchor =
      isSmallerThanPhone && !isNilOrError(topAnchorRef) && topAnchorRef.current;
    const pagesRef = useRef<HTMLDivElement>(null);
    const [hasScrollBars, setHasScrollBars] = useState(false);

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
    }, [formState.core?.data, uischema]);

    useEffect(() => {
      if (scrollToError) {
        // Scroll to the first field with an error
        document
          .getElementById('error-display')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setScrollToError(false);
      }
    }, [scrollToError]);

    useEffect(() => {
      if (pagesRef.current) {
        const isScrollBarVisible =
          pagesRef.current.scrollHeight > pagesRef.current.clientHeight;
        setHasScrollBars(isScrollBarVisible);
      }
    }, [currentStep]);

    useEffect(() => {
      if (!setCompletionPercentage) return;

      if (currentStep === uiPages.length - 1) {
        setCompletionPercentage(100);
        return;
      }

      const percentage = getFormCompletionPercentage(
        schema,
        uiPages,
        formState.core?.data,
        currentStep
      );

      setCompletionPercentage(percentage);
    }, [
      formState.core?.data,
      uischema,
      schema,
      currentStep,
      uiPages,
      setCompletionPercentage,
    ]);

    const scrollToTop = () => {
      if (useTopAnchor) {
        topAnchorRef.current.scrollIntoView();
      } else {
        window.scrollTo(0, 0);
      }
    };

    const handleNextAndSubmit = async () => {
      if (showSubmit && onSubmit) {
        setIsLoading(true);
        data.publication_status = 'published';
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
        setShowAllErrors?.(false);
        scrollToTop();
        data.publication_status = 'draft';
        data.latest_complete_page = currentStep;
        onSubmit?.(data);
        setCurrentStep(currentStep + 1);

        setIsLoading(false);
      } else {
        setShowAllErrors?.(true);
        setScrollToError(true);
      }
    };

    const handlePrevious = () => {
      const currentPageCategorization = uiPages[currentStep];
      // Get scopes of elements with rules on the current page
      const ruleElementsScopes = currentPageCategorization.elements
        .filter((element) => {
          return element.options?.hasRule;
        })
        .flatMap((filteredElement) => {
          const elementScope = filteredElement.scope?.split('/').pop();
          return elementScope || '';
        });

      const dataWithoutRuleValues = Object.fromEntries(
        Object.entries(data).filter(
          ([key]) => !ruleElementsScopes.includes(key)
        )
      );

      /*
       * We remove the data of the elements with rules from the data object because it currently
       * causes an issue with page visibility when going back to a page and selecting different options and then going forward again
       * In that case, the data from the elements with rules can cause wrong pages being shown or hidden.
       * We need to find a better solution for this but keeping it like this for now. I'll probably come back to it when I have more time
       * to think about it. See https://www.notion.so/citizenlab/Bug-in-survey-flow-792a72efc35e44e58e1bb10ab631ecdf
       */
      setFormData?.(dataWithoutRuleValues);

      setCurrentStep(currentStep - 1);
      userPagePath.pop();
      scrollToTop();
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
          height="100%"
          pt="24px"
          pb="190px"
          maxWidth="700px"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          margin="auto"
          position="relative"
        >
          <Box
            display="flex"
            flex="1"
            height="100%"
            overflowY="auto"
            w="100%"
            ref={pagesRef}
          >
            {uiPages.map((page, index) => {
              const pageElements = extractElementsByOtherOptionLogic(
                page,
                data
              );
              return (
                currentStep === index && (
                  <StyledFormSection key={index}>
                    <Box
                      display="flex"
                      justifyContent="center"
                      h={hasScrollBars ? 'fit-content' : '100%'}
                      flexDirection="column"
                    >
                      {page.options.title && (
                        <Title
                          variant="h2"
                          mt="0"
                          mb="24px"
                          color="tenantPrimary"
                        >
                          {page.options.title}
                        </Title>
                      )}
                      {page.options.description && (
                        <Box mb={pageElements.length >= 1 ? '48px' : '28px'}>
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
                      {pageElements.map((elementUiSchema, index) => {
                        const key = elementUiSchema.scope.split('/').pop();
                        const hasOtherFieldBelow =
                          key &&
                          (Array.isArray(data[key])
                            ? data[key].includes('other')
                            : data[key] === 'other');

                        return (
                          <Box
                            width="100%"
                            mb={hasOtherFieldBelow ? undefined : '28px'}
                            key={index}
                          >
                            <JsonFormsDispatch
                              renderers={renderers}
                              cells={cells}
                              uischema={elementUiSchema}
                              schema={schema}
                              path={path}
                              enabled={enabled}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  </StyledFormSection>
                )
              );
            })}
          </Box>
          <PageControlButtons
            handleNextAndSubmit={handleNextAndSubmit}
            handlePrevious={handlePrevious}
            hasPreviousPage={hasPreviousPage}
            currentStep={currentStep}
            isLoading={isLoading}
            showSubmit={showSubmit}
            dataCyValue={dataCyValue}
          />
        </Box>
      </>
    );
  }
);

export default withJsonFormsLayoutProps(CLPageLayout);

export const clPageTester: RankedTester = rankWith(5, isPageCategorization);

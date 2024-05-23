import React, { memo, useState, useEffect, useContext, useRef } from 'react';

import {
  Box,
  colors,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { LayoutProps, RankedTester, rankWith } from '@jsonforms/core';
import {
  JsonFormsDispatch,
  withJsonFormsLayoutProps,
  useJsonForms,
} from '@jsonforms/react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from 'styled-components';

import usePhase from 'api/phases/usePhase';

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
import QuillEditedContent from 'components/UI/QuillEditedContent';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import {
  extractElementsByOtherOptionLogic,
  hasOtherTextFieldBelow,
  isVisible,
} from '../Controls/visibilityUtils';

import messages from './messages';
import PageControlButtons from './PageControlButtons';

// Handling survey pages in here. The more things that we have added to it,
// the more it has become a survey page layout. It also becomes extremely hard to understand
// if we continue to try and overload it to handle other scenarios. Survey headers are different
// and handling them here makes it easy style the entire page. That among other things.
const CLSurveyPageLayout = memo(
  ({
    schema,
    uischema,
    path,
    renderers,
    cells,
    enabled,
    data,
  }: LayoutProps) => {
    const { onSubmit, setShowAllErrors, setFormData } = useContext(FormContext);
    const { formatMessage } = useIntl();
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
    const pagesRef = useRef<HTMLDivElement>(null);
    const [queryParams] = useSearchParams();
    const phaseId = queryParams.get('phase_id') || undefined;
    const { data: phase } = usePhase(phaseId);
    const allowAnonymousPosting =
      phase?.data.attributes.allow_anonymous_participation;
    const [percentageAnswered, setPercentageAnswered] = useState<number>(1);

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
        document.getElementById('error-display')?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        });
        setScrollToError(false);
      }
    }, [scrollToError]);

    useEffect(() => {
      if (currentStep === uiPages.length - 1) {
        setPercentageAnswered(100);
        return;
      }

      const percentage = getFormCompletionPercentage(
        schema,
        uiPages,
        formState.core?.data,
        currentStep
      );

      setPercentageAnswered(percentage);
    }, [
      formState.core?.data,
      uischema,
      schema,
      currentStep,
      uiPages,
      setPercentageAnswered,
    ]);

    const scrollToTop = () => {
      // Scroll inner container to top
      if (pagesRef?.current) {
        pagesRef.current.scrollTop = 0;
      }
    };

    const handleNextAndSubmit = async () => {
      if (showSubmit && onSubmit) {
        setIsLoading(true);
        data.publication_status = 'published';
        await onSubmit(getFilteredDataForUserPath(userPagePath, data), true);
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
        scrollToTop();
        data.publication_status = 'draft';
        data.latest_complete_page = currentStep;
        onSubmit?.(data, false);
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
        <Box display="flex" flexDirection="column" height="100%">
          {allowAnonymousPosting && (
            <Box w="100%" px={isSmallerThanPhone ? '16px' : '24px'} mt="12px">
              <Warning icon="shield-checkered">
                {formatMessage(messages.anonymousSurveyMessage)}
              </Warning>
            </Box>
          )}
          <Box h="100%" display="flex" ref={pagesRef}>
            {uiPages.map((page, index) => {
              const pageElements = extractElementsByOtherOptionLogic(
                page,
                data
              );
              return (
                currentStep === index && (
                  <Box key={index} p="24px" w="100%">
                    <Box display="flex" flexDirection="column">
                      {page.options.title && (
                        <Title
                          as="h1"
                          variant={isSmallerThanPhone ? 'h2' : 'h1'}
                          m="0"
                          mb="8px"
                          color="tenantPrimary"
                        >
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
                      {pageElements.map((elementUiSchema, index) => {
                        const hasOtherFieldBelow = hasOtherTextFieldBelow(
                          elementUiSchema,
                          data
                        );

                        return (
                          <Box
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
                  </Box>
                )
              );
            })}
          </Box>
        </Box>
        <Box
          maxWidth="700px"
          w="100%"
          position="fixed"
          bottom={isSmallerThanPhone ? '0' : '40px'}
          zIndex="1010"
        >
          <Box background={colors.background}>
            <Box
              w={`${percentageAnswered}%`}
              h="4px"
              background={theme.colors.tenantSecondary}
              style={{ transition: 'width 0.3s ease-in-out' }}
            />
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

export default withJsonFormsLayoutProps(CLSurveyPageLayout);

export const clPageTester: RankedTester = rankWith(5, isPageCategorization);

import React, {
  memo,
  useState,
  useEffect,
  useContext,
  useRef,
  useMemo,
} from 'react';

import {
  Box,
  colors,
  Spinner,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { LayoutProps, RankedTester, rankWith } from '@jsonforms/core';
import {
  withJsonFormsLayoutProps,
  useJsonForms,
  JsonFormsDispatch,
} from '@jsonforms/react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTheme } from 'styled-components';

import { IMapConfig } from 'api/map_config/types';
import useMapConfigById from 'api/map_config/useMapConfigById';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';
import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import useLocalize from 'hooks/useLocalize';

import EsriMap from 'components/EsriMap';
import { parseLayers } from 'components/EsriMap/utils';
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
import { customAjv } from 'components/Form/utils';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';

import {
  extractElementsByOtherOptionLogic,
  hasOtherTextFieldBelow,
  isVisible,
} from '../Controls/visibilityUtils';
import { useErrorToRead } from '../Fields/ErrorToReadContext';

import { SURVEY_PAGE_CHANGE_EVENT } from './events';
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
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const isMobileOrSmaller = useBreakpoint('phone');
    const [searchParams] = useSearchParams();
    const { formatMessage } = useIntl();
    const formState = useJsonForms();
    const localize = useLocalize();
    const theme = useTheme();

    // We can cast types because the tester made sure we only get correct values
    const pageTypeElements = (uischema as PageCategorization)
      .elements as PageType[];
    const [uiPages, setUiPages] = useState<PageType[]>(pageTypeElements);
    const [userPagePath] = useState<PageType[]>([]);
    const [scrollToError, setScrollToError] = useState(false);
    const [percentageAnswered, setPercentageAnswered] = useState<number>(1);
    const showSubmit = currentStep === uiPages.length - 1;
    const dataCyValue = showSubmit ? 'e2e-submit-form' : 'e2e-next-page';
    const hasPreviousPage = currentStep !== 0;

    const draggableDivRef = useRef<HTMLDivElement>(null);
    const dragDividerRef = useRef<HTMLDivElement>(null);
    const pagesRef = useRef<HTMLDivElement>(null);
    const { announceError } = useErrorToRead();

    // Get project and relevant phase data
    const { slug } = useParams() as {
      slug: string;
    };
    const { data: project } = useProjectBySlug(slug);
    const { data: phases } = usePhases(project?.data.id);
    const phaseIdFromSearchParams = searchParams.get('phase_id');
    const phaseId =
      phaseIdFromSearchParams || getCurrentPhase(phases?.data)?.id;
    const { data: phase } = usePhase(phaseId);
    const allowAnonymousPosting =
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      phase?.data?.attributes.allow_anonymous_participation;

    // Map-related variables
    const { data: projectMapConfig } = useProjectMapConfig(project?.data.id);
    const isMapPage = uiPages[currentStep].options.page_layout === 'map';
    const mapConfigId =
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      uiPages[currentStep].options.map_config_id || projectMapConfig?.data?.id;
    const { data: fetchedMapConfig, isFetching: isFetchingMapConfig } =
      useMapConfigById(mapConfigId);
    const [mapConfig, setMapConfig] = useState<IMapConfig | null | undefined>(
      null
    );
    const mapLayers = useMemo(() => {
      return parseLayers(mapConfig, localize);
    }, [localize, mapConfig]);

    useEffect(() => {
      setMapConfig(mapConfigId ? fetchedMapConfig : null);
    }, [fetchedMapConfig, mapConfigId]);

    // Emit event when page changes and map is fetched
    useEffect(() => {
      eventEmitter.emit(SURVEY_PAGE_CHANGE_EVENT);
    }, [currentStep, isFetchingMapConfig]);

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
        // Select the first error element by its class name
        const firstErrorElement = document.querySelector(
          '.error-display-container'
        );
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'start',
          });

          announceError(firstErrorElement.id);
        }
        setScrollToError(false);
      }
    }, [scrollToError, announceError]);

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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (pagesRef?.current) {
        pagesRef.current.scrollIntoView({
          block: 'start',
        });
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
        onSubmit?.({ data }, false);
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
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

    const onDragDivider = (event) => {
      event.preventDefault();
      // Change the height of the map container to match the drag event
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (draggableDivRef?.current) {
        const clientY = event?.changedTouches?.[0]?.clientY;
        // Don't allow the div to be dragged outside bounds of survey page
        if (clientY > 0 && clientY < document.body.clientHeight - 180) {
          draggableDivRef.current.style.height = `${clientY}px`;
        }
      }
    };

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    dragDividerRef?.current?.addEventListener('touchmove', onDragDivider);

    if (isFetchingMapConfig) {
      return (
        <Box h="100%" w="100%" display="flex">
          <Box mx="auto" my="auto">
            <Spinner />
          </Box>
        </Box>
      );
    }

    return (
      <>
        <Box
          id="container"
          display="flex"
          flexDirection={isMobileOrSmaller ? 'column' : 'row'}
          height="100%"
          w="100%"
        >
          {isMapPage && (
            <Box
              id="survey_page_map"
              w={isMobileOrSmaller ? '100%' : '60%'}
              minWidth="60%"
              h="100%"
              ref={draggableDivRef}
              key={`esri_map_${currentStep}`}
            >
              <EsriMap
                layers={mapLayers}
                initialData={{
                  showLegend: true,
                  showLayerVisibilityControl: true,
                  showLegendExpanded: true,
                  showZoomControls: isMobileOrSmaller ? false : true,
                  // TODO: Fix this the next time the file is edited.
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  zoom: Number(mapConfig?.data?.attributes.zoom_level),
                  // TODO: Fix this the next time the file is edited.
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  center: mapConfig?.data?.attributes.center_geojson,
                }}
                webMapId={mapConfig?.data.attributes.esri_web_map_id}
                height="100%"
              />
            </Box>
          )}

          <Box flex={'1 1 auto'} overflowY="auto" h="100%" ref={pagesRef}>
            {isMapPage && isMobileOrSmaller && (
              <Box
                aria-hidden={true}
                height="30px"
                py="20px"
                ref={dragDividerRef}
                position="absolute"
                background={colors.white}
                w="100%"
                zIndex="1000"
              >
                <Box
                  mx="auto"
                  w="40px"
                  h="4px"
                  bgColor={colors.grey400}
                  borderRadius="10px"
                />
              </Box>
            )}
            <Box
              display="flex"
              flexDirection="column"
              height="100%"
              mt={isMapPage && isMobileOrSmaller ? '20px' : undefined}
            >
              <Box h="100%" display="flex">
                {uiPages.map((page, index) => {
                  const pageElements = extractElementsByOtherOptionLogic(
                    page,
                    data
                  );
                  return (
                    currentStep === index && (
                      <Box key={index} p="24px" w="100%">
                        <Box display="flex" flexDirection="column">
                          {allowAnonymousPosting && (
                            <Box w="100%" mb="12px">
                              <Warning icon="shield-checkered">
                                {formatMessage(messages.anonymousSurveyMessage)}
                              </Warning>
                            </Box>
                          )}
                          {page.options.title && (
                            <Title
                              as="h1"
                              variant={isMobileOrSmaller ? 'h2' : 'h1'}
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
          </Box>
        </Box>

        {/*
        TODO:
        We should move the footer (progress bar and navigation buttons) into IdeasNewSurveyForm/index.tsx
        if possible. It doesn't belong here as it's not part of the form fields layout. This would also allow us
        to put the progress bar back on top of the form (as part of the survey header) without
        the scroll bar of the form fields interfering with it. This in turn would allow us to improve
        the form progress UX for screen readers. Our current stance is that it makes more sense to get a
        progress update before entering a new page, rather than after leaving it.
      */}
        <Box
          maxWidth={isMapPage ? '1100px' : '700px'}
          w="100%"
          position="fixed"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentageAnswered}
        >
          <Box background={colors.background}>
            <Box
              w={`${percentageAnswered}%`}
              h="4px"
              background={theme.colors.tenantSecondary}
              style={{ transition: 'width 0.3s ease-in-out' }}
            />
          </Box>
        </Box>
        <Box
          maxWidth={isMapPage ? '1100px' : '700px'}
          w="100%"
          position="fixed"
          bottom={isMobileOrSmaller ? '0' : '40px'}
        >
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

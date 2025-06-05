import React, {
  memo,
  useState,
  useMemo,
  useEffect,
  useContext,
  useRef,
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
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useTheme } from 'styled-components';

import { IIdea } from 'api/ideas/types';
import useIdeaById from 'api/ideas/useIdeaById';
import { IMapConfig } from 'api/map_config/types';
import useMapConfigById from 'api/map_config/useMapConfigById';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';
import useAuthUser from 'api/me/useAuthUser';
import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import useLocalize from 'hooks/useLocalize';

import { supportsNativeSurvey as methodSupportsNativeSurvey } from 'containers/Admin/projects/project/inputImporter/ReviewSection/utils';
import { triggerPostActionEvents } from 'containers/App/events';
import ProfileVisiblity from 'containers/IdeasNewPage/IdeasNewIdeationForm/ProfileVisibility';

import AnonymousParticipationConfirmationModal from 'components/AnonymousParticipationConfirmationModal';
import EsriMap from 'components/EsriMap';
import { parseLayers } from 'components/EsriMap/utils';
import { FormContext } from 'components/Form/contexts';
import { PageCategorization, PageType } from 'components/Form/typings';
import customAjv from 'components/Form/utils/customAjv';
import extractElementsByFollowUpLogic from 'components/Form/utils/extractElementsByFollowUpLogic';
import extractElementsByOtherOptionLogic from 'components/Form/utils/extractElementsByOtherOptionLogic';
import getFormCompletionPercentage from 'components/Form/utils/getFormCompletionPercentage';
import getPageVariant from 'components/Form/utils/getPageVariant';
import getVisiblePages from 'components/Form/utils/getVisiblePages';
import hasOtherTextFieldBelow from 'components/Form/utils/hasOtherTextFieldBelow';
import isPageCategorization from 'components/Form/utils/isPageCategorization';
import sanitizeFormData from 'components/Form/utils/sanitizeFormData';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import eventEmitter from 'utils/eventEmitter';
import { isPage } from 'utils/helperUtils';
import { isAdmin } from 'utils/permissions/roles';

import { useIdeaSelect } from '../../../../containers/IdeasNewPage/SimilarInputs/InputSelectContext';
import getPageSchema from '../../utils/getPageSchema';
import { useErrorToRead } from '../Fields/ErrorToReadContext';

import { FORM_PAGE_CHANGE_EVENT } from './events';
import messages from './messages';
import PageControlButtons from './PageControlButtons';
import SubmissionReference from './SubmissionReference';

// TODO: Edwin: This component is a bit of a mess. It should be refactored to be more readable and maintainable.
// This is on my TODO list for this tandem..
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
    const { onSubmit, setShowAllErrors, setFormData } = useContext(FormContext);
    const [isLoading, setIsLoading] = useState(false);
    const isMobileOrSmaller = useBreakpoint('phone');
    const [searchParams] = useSearchParams();
    const { formatMessage } = useIntl();
    const formState = useJsonForms();
    const localize = useLocalize();
    const theme = useTheme();
    const { pathname } = useLocation();
    const isAdminPage = isPage('admin', pathname);
    const { onIdeaSelect } = useIdeaSelect();
    const isIdeaEditPage = isPage('idea_edit', location.pathname);
    const { data: authUser } = useAuthUser();

    // We can cast types because the tester made sure we only get correct values
    const pageTypeElements = (uischema as PageCategorization).elements;

    const [userPagePath, setUserPagePath] = useState<PageType[]>([
      pageTypeElements[0],
    ]);
    const [scrollToError, setScrollToError] = useState(false);

    // This component is also accessible from the admin side via the idea edit preview in the input manager,
    // which follows a different URL structure:
    // Admin URL format: /admin/projects/:projectId/phases/:phaseId/ideas
    // We need to support both the public and admin URL structures.
    const {
      slug,
      ideaId: idea_id,
      phaseId: phaseFromAdminUrl,
      projectId: projectIdFromAdminUrl,
    } = useParams<{
      slug?: string;
      ideaId?: string;
      phaseId?: string;
      projectId?: string;
    }>();
    const ideaId = searchParams.get('idea_id') || idea_id;
    const { data: idea } = useIdeaById(ideaId ?? undefined);
    const projectId =
      idea?.data.relationships.project.data.id || projectIdFromAdminUrl;
    const projectById = useProjectById(projectId);
    const projectBySlug = useProjectBySlug(slug);
    const project = projectById.data ?? projectBySlug.data;

    // If the idea (survey submission) has no author relationship,
    // it was either created through 'anyone' permissions or with
    // the anonymous toggle on. In these cases, we show the idea id
    // on the success page.
    const showIdeaId = idea ? !idea.data.relationships.author?.data : false;

    const [postAnonymously, setPostAnonymously] = useState(
      idea?.data.attributes.anonymous || false
    );
    const [showAnonymousConfirmationModal, setShowAnonymousConfirmationModal] =
      useState(false);
    const draggableDivRef = useRef<HTMLDivElement>(null);
    const dragDividerRef = useRef<HTMLDivElement>(null);
    const pagesRef = useRef<HTMLDivElement>(null);
    const { announceError } = useErrorToRead();

    const { data: phases } = usePhases(project?.data.id);
    const phaseIdFromSearchParams = searchParams.get('phase_id');
    const phaseId =
      phaseIdFromSearchParams ||
      getCurrentPhase(phases?.data)?.id ||
      phaseFromAdminUrl;
    const { data: phase } = usePhase(phaseId);
    const participationMethod = phase?.data.attributes.participation_method;
    const supportsNativeSurvey =
      methodSupportsNativeSurvey(participationMethod);
    const allowAnonymousPosting =
      phase?.data.attributes.allow_anonymous_participation;

    /*
     * For native surveys, the admin enables anonymous posting for all responses,
     * so we display a message to the user. For other methods (e.g., ideation and proposals),
     * the admin can allow anonymous posting, but we provide a toggle for the user
     * to choose whether to post anonymously or not.
     */
    const allowsAnonymousPostingInNativeSurvey =
      supportsNativeSurvey && allowAnonymousPosting;
    const showTogglePostAnonymously =
      allowAnonymousPosting && !supportsNativeSurvey;

    // Map-related variables
    const { data: projectMapConfig } = useProjectMapConfig(project?.data.id);

    const visiblePages = useMemo(() => {
      return getVisiblePages(
        pageTypeElements,
        formState.core?.data,
        userPagePath
      );
    }, [formState.core?.data, pageTypeElements, userPagePath]);

    // This is the number of the step the user is currently on,
    // out of the number of visible steps
    const currentStepNumber = userPagePath.length - 1;
    const currentPage = userPagePath[currentStepNumber];

    const pageVariant = getPageVariant(
      currentStepNumber,
      visiblePages.length,
      participationMethod
    );
    const hasPreviousPage = currentStepNumber !== 0;

    const isMapPage = currentPage.options.page_layout === 'map';
    const mapConfigId =
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      currentPage.options.map_config_id || projectMapConfig?.data?.id;
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
      eventEmitter.emit(FORM_PAGE_CHANGE_EVENT);
    }, [currentStepNumber, isFetchingMapConfig]);

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

    const percentageAnswered = useMemo(() => {
      if (currentStepNumber === visiblePages.length - 1) {
        return 100;
      }

      return getFormCompletionPercentage(
        schema,
        visiblePages,
        formState.core?.data,
        currentStepNumber
      );
    }, [formState.core?.data, schema, currentStepNumber, visiblePages]);

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

    const handleOnChangeAnonymousPosting = () => {
      if (!postAnonymously) {
        setShowAnonymousConfirmationModal(true);
      }

      setPostAnonymously((postAnonymously) => !postAnonymously);
    };

    const handleNextAndSubmit = async () => {
      if (!onSubmit) return;

      // Hide idea details when going to the next page
      onIdeaSelect(null);
      const sanitizedData = sanitizeFormData(data);

      const isValid = customAjv.validate(
        getPageSchema(schema, currentPage, sanitizedData),
        sanitizedData
      );

      if (!isValid) {
        setShowAllErrors?.(true);
        setScrollToError(true);
        return;
      }

      if (
        participationMethod === 'common_ground' &&
        pageVariant === 'submission'
      ) {
        const isUserAdmin = authUser && isAdmin(authUser);
        const path = isUserAdmin
          ? `/admin/projects/${project?.data.id}/phases/${phaseId}/ideas`
          : `/projects/${project?.data.attributes.slug}`;
        clHistory.push({ pathname: path });
      }

      if (pageVariant === 'after-submission') {
        if (supportsNativeSurvey) {
          if (currentPage.options.page_button_link) {
            // Page is using a custom button link
            window.location.href = currentPage.options.page_button_link;
          } else {
            clHistory.push({
              pathname: `/projects/${project?.data.attributes.slug}`,
            });
          }
          triggerPostActionEvents({});
        } else {
          clHistory.push({
            pathname: `/ideas/${idea?.data.attributes.slug}`,
          });
        }
        return;
      }

      const goToNextPage = () => {
        scrollToTop();
        const nextPage = visiblePages[currentStepNumber + 1];

        setUserPagePath((userPagePath) => [...userPagePath, nextPage]);

        setIsLoading(false);
      };

      if (pageVariant === 'submission') {
        setIsLoading(true);
        const dataWithPublicationStatus = {
          ...data,
          publication_status: 'published',
          ...(showTogglePostAnonymously && { anonymous: postAnonymously }),
        };

        const idea: IIdea | undefined = await onSubmit(
          { data: dataWithPublicationStatus },
          true,
          userPagePath,
          goToNextPage
        );

        if (idea) {
          // We set this param so that we can fetch the idea
          // (see useIdeaById call above in this component)
          // We need the idea for the author relationship, so that
          // on the last page we can determine whether to show
          // the message for anonymous users
          updateSearchParams({ idea_id: idea.data.id });
        } else {
          console.error('Failed to submit idea and set idea_id param.');
        }
      } else {
        const dataWithPublicationStatus = {
          ...data,
          publication_status: 'draft',
          ...(showTogglePostAnonymously && { anonymous: postAnonymously }),
        };

        await onSubmit(
          { data: dataWithPublicationStatus },
          false,
          userPagePath
        );
        goToNextPage();
      }

      setIsLoading(false);
    };

    const handlePrevious = () => {
      // Hide idea details when going back to a previous page
      onIdeaSelect(null);
      // Get scopes of elements with rules on the current page
      const ruleElementsScopes = currentPage.elements
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
      setUserPagePath((userPagePath) => userPagePath.slice(0, -1));
      scrollToTop();
    };

    const onDragDivider = (event) => {
      event.preventDefault();
      // Change the height of the map container to match the drag event
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (draggableDivRef?.current) {
        const clientY = event?.changedTouches?.[0]?.clientY;
        // Don't allow the div to be dragged outside bounds of page
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

    // Extract elements depending on other option logic and follow-up logic
    // E.g. If a user selects 'other' in a multiple choice question, we show a text field, if they don't we should not show it.
    let pageElements = extractElementsByOtherOptionLogic(currentPage, data);
    pageElements = extractElementsByFollowUpLogic(pageElements, data);

    // This is the index of the current page in the pageTypeElements array,
    // which also includes non-visible pages.
    const currentPageIndex = pageTypeElements.findIndex(
      (page) => page === currentPage
    );

    return (
      <>
        <Box
          // Using an explicit key to force React to re-render the whole page component
          // tree when the page changes. This fixes an issue where the state of some
          // Control components was shared between consecutive pages with a similar
          // structure.
          key={`form-page-${currentPageIndex}`}
          id="container"
          display="flex"
          flexDirection={isMobileOrSmaller ? 'column' : 'row'}
          height="100%"
          w="100%"
          data-cy={`e2e-page-number-${currentPageIndex + 1}`}
        >
          {isMapPage && (
            <Box
              id="map_page"
              w={isMobileOrSmaller ? '100%' : '60%'}
              minWidth="60%"
              h="100%"
              ref={draggableDivRef}
              key={`esri_map_${currentStepNumber}`}
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
              <Box h="100%" display="flex" flexDirection="column">
                <Box p="24px" w="100%">
                  <Box display="flex" flexDirection="column">
                    {allowsAnonymousPostingInNativeSurvey && (
                      <Box w="100%" mb="12px">
                        <Warning icon="shield-checkered">
                          {formatMessage(messages.anonymousSurveyMessage)}
                        </Warning>
                      </Box>
                    )}
                    {currentPage.options.title && (
                      <Title
                        as="h1"
                        variant={isMobileOrSmaller ? 'h2' : 'h1'}
                        m="0"
                        mb="20px"
                        color="tenantPrimary"
                      >
                        {currentPage.options.title}
                      </Title>
                    )}
                    {currentPage.options.description && (
                      <Box mb="48px">
                        <QuillEditedContent
                          fontWeight={400}
                          textColor={theme.colors.tenantText}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: currentPage.options.description,
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
                    {pageVariant === 'submission' &&
                      showTogglePostAnonymously &&
                      !isIdeaEditPage && (
                        <ProfileVisiblity
                          postAnonymously={postAnonymously}
                          onChange={handleOnChangeAnonymousPosting}
                        />
                      )}
                    {pageVariant === 'after-submission' &&
                      ideaId &&
                      showIdeaId && (
                        <SubmissionReference
                          inputId={ideaId}
                          participationMethod={participationMethod}
                        />
                      )}
                  </Box>
                </Box>
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
          maxWidth={!isAdminPage ? (isMapPage ? '1100px' : '700px') : undefined}
          w="100%"
          position="fixed"
          bottom={isMobileOrSmaller || isAdminPage ? '0' : '40px'}
          display="flex"
          flexDirection="column"
          alignItems="center"
          zIndex="1000"
        >
          <Box
            w="100%"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentageAnswered}
            aria-label={formatMessage(messages.progressBarLabel)}
            zIndex="1000"
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

          <Box w="100%" zIndex="1000">
            <PageControlButtons
              handleNextAndSubmit={handleNextAndSubmit}
              handlePrevious={handlePrevious}
              hasPreviousPage={hasPreviousPage}
              isLoading={isLoading}
              pageVariant={pageVariant}
              phases={phases?.data}
              currentPhase={phase?.data}
              currentPage={currentPage}
            />
          </Box>
        </Box>
        {showAnonymousConfirmationModal && (
          <AnonymousParticipationConfirmationModal
            onCloseModal={() => {
              setShowAnonymousConfirmationModal(false);
            }}
          />
        )}
      </>
    );
  }
);

export default withJsonFormsLayoutProps(CLPageLayout);

export const clPageTester: RankedTester = rankWith(5, isPageCategorization);

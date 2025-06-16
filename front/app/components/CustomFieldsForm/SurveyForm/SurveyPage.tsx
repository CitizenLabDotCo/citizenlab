import React, { useState } from 'react';

import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';

import { IFlatCustomField } from 'api/custom_fields/types';
import { IdeaPublicationStatus } from 'api/ideas/types';
import useIdeaById from 'api/ideas/useIdeaById';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import AnonymousParticipationConfirmationModal from 'components/AnonymousParticipationConfirmationModal';
import PageControlButtons from 'components/Form/Components/Layouts/PageControlButtons';
import SubmissionReference from 'components/Form/Components/Layouts/SubmissionReference';
import Feedback from 'components/HookForm/Feedback';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { isPage } from 'utils/helperUtils';

import CustomFields from '../CustomFields';
import generateYupValidationSchema from '../generateYupSchema';
import ProgressBar from '../ProgressBar';
import { getFormCompletionPercentage } from '../util';

export interface FormValues {
  title_multiloc: Multiloc;
  body_multiloc?: Multiloc;
  author_id?: string;
  idea_images_attributes?: { image: string }[];
  idea_files_attributes?: {
    file_by_content: { content: string };
    name: string;
  }[];
  location_description?: string | null;
  location_point_geojson?: GeoJSON.Point | null;
  topic_ids?: string[];
  cosponsor_ids?: string[];
  publication_status?: IdeaPublicationStatus;
}

type SurveyPage = {
  page: IFlatCustomField;
  pages: IFlatCustomField[];
  pageQuestions: IFlatCustomField[];
  currentPageNumber: number;
  setCurrentPageNumber: React.Dispatch<React.SetStateAction<number>>;
  lastPageNumber: number;
  participationMethod?: ParticipationMethod;
  ideaId?: string;
  projectId: string;
  onSubmit: (formValues: FormValues) => Promise<void>;
  pageButtonLabelMultiloc?: Multiloc;
  phase?: IPhaseData;
  defaultValues?: any;
  customFields: IFlatCustomField[];
  pagesRef: React.RefObject<HTMLDivElement>;
};

const determineNextPageNumber = ({
  pages,
  currentPage,
  formData,
}: {
  pages: IFlatCustomField[];
  currentPage: IFlatCustomField;
  formData?: Record<string, any>;
}) => {
  let nextPageIndex: number | undefined;
  if (currentPage.logic.next_page_id) {
    pages.find((page) => page.id === currentPage.logic.next_page_id);
    nextPageIndex = pages.findIndex(
      (page) => page.id === currentPage.logic.next_page_id
    );
  } else {
    const currentPageIndex = pages.findIndex(
      (page) => page.id === currentPage.id
    );
    nextPageIndex = currentPageIndex + 1;
  }
  return nextPageIndex;
};

const determinePreviousPageNumber = ({
  pages,
  currentPage,
  formData,
}: {
  pages: IFlatCustomField[];
  currentPage: IFlatCustomField;
  formData?: Record<string, any>;
}) => {
  let previousPageIndex: number | undefined;
  const previousPage = pages.find(
    (page) => currentPage.id === page.logic.next_page_id
  );
  if (previousPage) {
    previousPageIndex = pages.findIndex((page) => page.id === previousPage.id);
  } else {
    const currentPageIndex = pages.findIndex(
      (page) => page.id === currentPage.id
    );
    previousPageIndex = currentPageIndex - 1;
  }
  return previousPageIndex;
};

const SurveyPage = ({
  page,
  pages,
  pageQuestions,
  lastPageNumber,
  participationMethod,
  ideaId: initialIdeaId,
  projectId,
  onSubmit,
  currentPageNumber,
  setCurrentPageNumber,
  pageButtonLabelMultiloc,
  phase,
  defaultValues,
  customFields,
  pagesRef,
}: SurveyPage) => {
  const [showFormFeedback, setShowFormFeedback] = useState(false);
  const { data: phases } = usePhases(projectId);
  const { data: project } = useProjectById(projectId);

  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const theme = useTheme();

  const { pathname } = useLocation();
  const isAdminPage = isPage('admin', pathname);
  const isMapPage = page.page_layout === 'map';
  const isMobileOrSmaller = useBreakpoint('phone');

  const [searchParams] = useSearchParams();
  const ideaId = (initialIdeaId || searchParams.get('idea_id')) ?? undefined;
  const { data: idea } = useIdeaById(ideaId);
  const [showAnonymousConfirmationModal, setShowAnonymousConfirmationModal] =
    useState(false);

  const schema = generateYupValidationSchema({
    pageQuestions,
    formatMessage,
    localize,
  });

  const methods = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
    defaultValues,
  });

  const previousPageNumber = determinePreviousPageNumber({
    pages,
    currentPage: page,
    formData: methods.getValues(),
  });

  const nextPageNumber = determineNextPageNumber({
    pages,
    currentPage: page,
    formData: methods.getValues(),
  });

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      setShowFormFeedback(false);
      await onSubmit(formValues);
    } catch (error) {
      // Only show feedback if the form submission failed
      // otherwise we rely on the field validation errors
      setShowFormFeedback(true);
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  // If the idea (survey submission) has no author relationship,
  // it was either created through 'anyone' permissions or with
  // the anonymous toggle on. In these cases, we show the idea id
  // on the success page.
  const showIdeaId = idea ? !idea.data.relationships.author?.data : false;

  const formCompletionPercentage = getFormCompletionPercentage({
    customFields,
    formValues: methods.getValues() ?? {},
    userIsEditing: false,
    userIsOnLastPage: currentPageNumber === lastPageNumber,
  });

  const handleNextAndSubmit = () => {
    pagesRef.current?.scrollTo(0, 0);

    methods.handleSubmit((e) => onFormSubmit(e))();

    // Go to the next page
    if (currentPageNumber < lastPageNumber) {
      setCurrentPageNumber(nextPageNumber);
    }

    // Go to the project page if this is the last page
    if (currentPageNumber === lastPageNumber) {
      clHistory.push({
        pathname: `/projects/${project?.data.attributes.slug}`,
      });
    }
  };

  const handlePrevious = () => {
    pagesRef.current?.scrollTo(0, 0);
    setCurrentPageNumber(previousPageNumber);
  };

  console.log(currentPageNumber, lastPageNumber, nextPageNumber);
  console.log(pages);

  return (
    <FormProvider {...methods}>
      {showFormFeedback && <Feedback />}

      <form id="idea-form">
        <Box
          id="container"
          display="flex"
          flexDirection={isMobileOrSmaller ? 'column' : 'row'}
          height="100%"
          w="100%"
          data-cy={`e2e-page-number-${currentPageNumber + 1}`}
        >
          {/* {isMapPage && (
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
      )} */}

          <Box flex={'1 1 auto'} h="100%" mb="40px">
            {/* {isMapPage && isMobileOrSmaller && (
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
        )} */}
            <Box
              display="flex"
              flexDirection="column"
              height="100%"
              mt={isMapPage && isMobileOrSmaller ? '20px' : undefined}
            >
              <Box h="100%" display="flex" flexDirection="column">
                <Box p="24px" w="100%">
                  <Box display="flex" flexDirection="column">
                    {/* {allowsAnonymousPostingInNativeSurvey && (
                  <Box w="100%" mb="12px">
                    <Warning icon="shield-checkered">
                      {formatMessage(messages.anonymousSurveyMessage)}
                    </Warning>
                  </Box>
                )} */}

                    <Title
                      as="h1"
                      variant={isMobileOrSmaller ? 'h2' : 'h1'}
                      m="0"
                      mb="20px"
                      color="tenantPrimary"
                    >
                      {localize(page.title_multiloc)}
                    </Title>

                    <Box mb="48px">
                      <QuillEditedContent
                        fontWeight={400}
                        textColor={theme.colors.tenantText}
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: localize(page.description_multiloc),
                          }}
                        />
                      </QuillEditedContent>
                    </Box>

                    <CustomFields
                      questions={pageQuestions}
                      projectId={projectId}
                      ideaId={ideaId}
                      phase={phase}
                    />
                    {currentPageNumber === lastPageNumber &&
                      idea &&
                      showIdeaId && (
                        <SubmissionReference
                          inputId={idea.data.id}
                          participationMethod={participationMethod}
                        />
                      )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
          {showAnonymousConfirmationModal && (
            <AnonymousParticipationConfirmationModal
              onCloseModal={() => {
                setShowAnonymousConfirmationModal(false);
              }}
            />
          )}

          <Box
            maxWidth={
              !isAdminPage ? (isMapPage ? '1100px' : '700px') : undefined
            }
            w="100%"
            position="fixed"
            bottom={isMobileOrSmaller || isAdminPage ? '0' : '40px'}
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <ProgressBar formCompletionPercentage={formCompletionPercentage} />

            <Box w="100%">
              <PageControlButtons
                handleNextAndSubmit={handleNextAndSubmit}
                handlePrevious={handlePrevious}
                hasPreviousPage={currentPageNumber > 0}
                isLoading={methods.formState.isSubmitting}
                pageVariant={
                  currentPageNumber === lastPageNumber
                    ? 'after-submission'
                    : nextPageNumber === lastPageNumber
                    ? 'submission'
                    : 'other'
                }
                phases={phases?.data}
                currentPhase={phase}
                pageButtonLabelMultiloc={pageButtonLabelMultiloc}
              />
            </Box>
          </Box>
        </Box>
      </form>
    </FormProvider>
  );
};

export default SurveyPage;

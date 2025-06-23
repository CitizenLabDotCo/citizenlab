import React, { useRef, useState } from 'react';

import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { useLocation, useSearchParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
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
import PageEsriDivider from '../Map/PageEsriDivider';
import PageEsriMap from '../Map/PageEsriMap';
import useEsriMapPage from '../Map/useEsriMapPage';
import ProgressBar from '../ProgressBar';
import { getFormCompletionPercentage, Pages } from '../util';

import { determineNextPageNumber, determinePreviousPageNumber } from './logic';

const StyledForm = styled.form`
  height: 100%;
`;

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
  pages: Pages;
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
}: SurveyPage) => {
  const pageRef = useRef<HTMLDivElement>(null);
  const draggableDivRef = useRef<HTMLDivElement>(null);
  const dragDividerRef = useRef<HTMLDivElement>(null);
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

  // Map logic
  const shouldShowMap = !isAdminPage && isMapPage;

  const { mapConfig, mapLayers } = useEsriMapPage({
    project,
    pages,
    currentPageNumber,
    draggableDivRef,
    dragDividerRef,
    localize,
  });

  const previousPageNumber = determinePreviousPageNumber({
    pages,
    currentPage: page,
    formData: methods.watch(),
  });

  const nextPageNumber = determineNextPageNumber({
    pages,
    currentPage: page,
    formData: methods.watch(),
  });

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      setShowFormFeedback(false);
      await onSubmit(formValues);
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
    pageRef.current?.scrollTo(0, 0);
    methods.handleSubmit((e) => onFormSubmit(e))();
  };

  const handlePrevious = () => {
    pageRef.current?.scrollTo(0, 0);
    setCurrentPageNumber(previousPageNumber);
  };

  return (
    <FormProvider {...methods}>
      {showFormFeedback && <Feedback />}

      <StyledForm id="idea-form">
        <Box
          id="container"
          display="flex"
          flexDirection={isMobileOrSmaller ? 'column' : 'row'}
          height="100%"
          w="100%"
          data-cy={`e2e-page-number-${currentPageNumber + 1}`}
        >
          {shouldShowMap && (
            <PageEsriMap
              currentPageNumber={currentPageNumber}
              mapConfig={mapConfig}
              mapLayers={mapLayers}
              draggableDivRef={draggableDivRef}
            />
          )}
          <Box
            flex={'1 1 auto'}
            h={shouldShowMap && isMobileOrSmaller ? '80%' : '100%'}
            position="relative"
            overflow="hidden"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Box
              display="flex"
              flexDirection="column"
              height="100%"
              overflowY="auto"
              overflowX="hidden"
              ref={pageRef}
            >
              {shouldShowMap && isMobileOrSmaller && (
                <PageEsriDivider dragDividerRef={dragDividerRef} />
              )}
              <Box
                h="100%"
                display="flex"
                flexDirection="column"
                mt={shouldShowMap && isMobileOrSmaller ? '20px' : undefined}
                mb="40px"
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
                project={project}
              />
            </Box>
          </Box>
        </Box>
      </StyledForm>
    </FormProvider>
  );
};

export default SurveyPage;

import React, { useEffect, useState } from 'react';

import { Box, colors, useBreakpoint } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useIdeaFiles from 'api/idea_files/useIdeaFiles';
import useIdeaImages from 'api/idea_images/useIdeaImages';
import { IdeaPublicationStatus } from 'api/ideas/types';
import useIdeaById from 'api/ideas/useIdeaById';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import useInputSchema from 'hooks/useInputSchema';

import EditIdeaHeading from 'containers/IdeaHeading/EditIdeaHeading';
import { calculateDynamicHeight } from 'containers/IdeasNewSurveyPage/IdeasNewSurveyForm/utils';

import CustomFieldsForm from 'components/CustomFieldsForm';
import { FORM_PAGE_CHANGE_EVENT } from 'components/Form/Components/Layouts/events';
import FullPageSpinner from 'components/UI/FullPageSpinner';

import { FormattedMessage } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';

import IdeasEditMeta from './IdeasEditMeta';
import messages from './messages';
import { getFormValues } from './utils';

export interface FormValues {
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  author_id?: string;
  idea_images_attributes?: { image: string }[];
  idea_files_attributes?: {
    file_by_content: { content: string };
    name: string;
  };
  location_description?: string;
  location_point_geojson?: GeoJSON.Point;
  topic_ids?: string[];
  cosponsor_ids?: string[];
  publication_status?: IdeaPublicationStatus;
}

interface Props {
  ideaId: string;
}

const IdeasEditForm = ({ ideaId }: Props) => {
  // const [isDisclaimerOpened, setIsDisclaimerOpened] = useState(false);
  // const [formData, setFormData] = useState<FormValues | null>(null);
  // const [loading, setLoading] = useState(false);
  const { data: idea } = useIdeaById(ideaId);
  // const { mutate: deleteIdeaImage } = useDeleteIdeaImage();
  const isSmallerThanPhone = useBreakpoint('phone');
  // const [title, setTitle] = useState('');
  // const [body, setBody] = useState('');
  // const { mutateAsync: updateIdea } = useUpdateIdea();
  const { data: remoteImages } = useIdeaImages(ideaId);
  const { data: remoteFiles } = useIdeaFiles(ideaId);
  const projectId = idea?.data.relationships.project.data.id;
  // const callbackRef = useRef<(() => void) | null>(null);
  const [usingMapView, setUsingMapView] = useState(false);
  // const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  // const isInputIQEnabled = useFeatureFlag({
  //   name: 'input_iq',
  // });
  const phaseId = idea?.data.relationships.phases.data[0].id;
  const { data: phase } = usePhase(phaseId);
  const { data: project } = useProjectById(projectId);

  const {
    schema,
    uiSchema,
    inputSchemaError,
    isLoading: isLoadingInputSchema,
  } = useInputSchema({
    projectId,
    inputId: ideaId,
  });
  const [initialFormData, setInitialFormData] = useState(
    getFormValues(idea, schema, remoteImages, remoteFiles)
  );

  useEffect(() => {
    if (idea && schema) {
      setInitialFormData(
        getFormValues(idea, schema, remoteImages, remoteFiles)
      );
    }
  }, [schema, idea, remoteImages, remoteFiles]);

  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent(FORM_PAGE_CHANGE_EVENT)
      .subscribe(() => {
        setUsingMapView(!!document.getElementById('map_page'));
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // const getApiErrorMessage: ApiErrorGetter = useCallback(
  //   (error) => {
  //     return (
  //       ideaFormMessages[
  //         `api_error_${uiSchema?.options?.inputTerm}_${error}`
  //       ] ||
  //       ideaFormMessages[`api_error_${error}`] ||
  //       ideaFormMessages[`api_error_invalid`]
  //     );
  //   },
  //   [uiSchema]
  // );

  // const getAjvErrorMessage: AjvErrorGetter = useCallback(
  //   (error) => {
  //     return (
  //       messages[
  //         `ajv_error_${uiSchema?.options?.inputTerm}_${
  //           getFieldNameFromPath(error.instancePath) ||
  //           // TODO: Fix this the next time the file is edited.
  //           // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  //           error?.params?.missingProperty
  //         }_${error.keyword}`
  //       ] ||
  //       messages[
  //         `ajv_error_${
  //           getFieldNameFromPath(error.instancePath) ||
  //           // TODO: Fix this the next time the file is edited.
  //           // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  //           error?.params?.missingProperty
  //         }_${error.keyword}`
  //       ] ||
  //       undefined
  //     );
  //   },
  //   [uiSchema]
  // );

  const { data: appConfiguration } = useAppConfiguration();
  const tenantTimezone =
    appConfiguration?.data.attributes.settings.core.timezone;
  if (!tenantTimezone) return null;
  // const showSimilarInputs = !!(
  //   phase?.data.attributes.similarity_enabled && isInputIQEnabled
  // );

  if (isLoadingInputSchema) return <FullPageSpinner />;
  if (
    // inputSchemaError should display an error page instead
    inputSchemaError ||
    !schema ||
    !uiSchema ||
    !projectId ||
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    !idea
  ) {
    return null;
  }

  // Set initial location point if exists

  if (idea.data.attributes.location_point_geojson) {
    initialFormData['location_point_geojson'] =
      idea.data.attributes.location_point_geojson;
  }

  // const handleDisclaimer = (
  //   data: FormValues,
  //   onSubmitCallback?: () => void
  // ) => {
  //   const disclaimerNeeded =
  //     data.idea_files_attributes ||
  //     data.idea_images_attributes ||
  //     Object.values(data.body_multiloc).some((value) => value.includes('<img'));

  //   setFormData(data);
  //   if (data.publication_status === 'published') {
  //     if (disclaimerNeeded) {
  //       callbackRef.current = onSubmitCallback || null;
  //       return setIsDisclaimerOpened(true);
  //     }
  //     return onSubmit(data, onSubmitCallback);
  //   } else {
  //     // Add handling draft ideas
  //   }
  // };

  // const onAcceptDisclaimer = (data: FormValues | null) => {
  //   if (!data) return;
  //   onSubmit(data);
  //   setIsDisclaimerOpened(false);
  //   callbackRef.current?.();
  //   callbackRef.current = null;
  // };

  // const onCancelDisclaimer = () => {
  //   setIsDisclaimerOpened(false);
  // };

  // const onSubmit = async (data: FormValues, onSubmitCallback?: () => void) => {
  //   setLoading(true);
  //   const { idea_images_attributes, ...ideaWithoutImages } = data;

  //   const location_point_geojson = await getLocationGeojson(
  //     initialFormData,
  //     data
  //   );

  //   const isImageNew =
  //     idea_images_attributes !== initialFormData.idea_images_attributes;

  //   // Delete remote images only on submission
  //   if (isImageNew && initialFormData.idea_images_attributes.length > 0) {
  //     initialFormData.idea_images_attributes.forEach((image) => {
  //       deleteIdeaImage({
  //         ideaId,
  //         imageId: image.id,
  //       });
  //     });
  //   }

  // const payload: IIdeaUpdate = {
  //   ...ideaWithoutImages,
  //   idea_images_attributes,
  //   location_point_geojson,
  //   project_id: projectId,
  // };

  //   // TODO: Change publication status handling when adding draft ideas
  //   const idea = await updateIdea({
  //     id: ideaId,
  //     requestBody: isImageNew
  //       ? omit(payload, ['idea_files_attributes', 'publication_status'])
  //       : omit(payload, [
  //           'idea_images_attributes',
  //           'idea_files_attributes',
  //           'publication_status',
  //         ]),
  //   });

  //   updateSearchParams({ idea_id: idea.data.id });
  //   onSubmitCallback?.();
  //   setLoading(false);
  //   return idea;
  // };

  const titleText = (
    <FormattedMessage
      {...{
        idea: messages.formTitle,
        option: messages.optionFormTitle,
        project: messages.projectFormTitle,
        question: messages.questionFormTitle,
        issue: messages.issueFormTitle,
        contribution: messages.contributionFormTitle,
        initiative: messages.initiativeFormTitle,
        petition: messages.petitionFormTitle,
        proposal: messages.proposalFormTitle,
      }[uiSchema.options?.inputTerm ? uiSchema.options.inputTerm : 'idea']}
    />
  );
  const maxWidth = usingMapView ? '1100px' : '700px';

  return (
    <>
      <IdeasEditMeta ideaId={ideaId} projectId={projectId} />
      <Box
        w="100%"
        bgColor={colors.grey100}
        h="100vh"
        position="fixed"
        zIndex="1010"
        overflow="hidden"
      >
        <Box display="flex" flexDirection="row" h="100%" w="100%">
          <Box
            flex="1"
            display="flex"
            mx="auto"
            justifyContent="center"
            w="100%"
          >
            <Box w="100%" maxWidth={maxWidth}>
              <Box
                w="100%"
                position="relative"
                top={isSmallerThanPhone ? '0' : '40px'}
              >
                <EditIdeaHeading
                  idea={idea.data}
                  titleText={titleText}
                  projectId={projectId}
                />
              </Box>
              <main id="e2e-idea-edit-page">
                <Box
                  display="flex"
                  justifyContent="center"
                  pt={isSmallerThanPhone ? '0' : '40px'}
                >
                  <Box
                    background={colors.white}
                    maxWidth={usingMapView ? '1100px' : '700px'}
                    w="100%"
                    // Height is recalculated on window resize via useWindowSize hook
                    h={calculateDynamicHeight(isSmallerThanPhone)}
                    pb={isSmallerThanPhone ? '0' : '80px'}
                    overflowY="auto"
                  >
                    {/* <InputSelectContext.Provider
                      value={{
                        onIdeaSelect: setSelectedIdeaId,
                        title,
                        body,
                        setTitle,
                        setBody,
                        selectedIdeaId,
                        showSimilarInputs,
                      }}
                    >
                      <Form
                        schema={schema}
                        uiSchema={uiSchema}
                        onSubmit={handleDisclaimer}
                        initialFormData={initialFormData}
                        inputId={idea.data.id}
                        getAjvErrorMessage={getAjvErrorMessage}
                        getApiErrorMessage={getApiErrorMessage}
                        config={'input'}
                        loading={loading}
                        showSubmitButton={false}
                      />
                    </InputSelectContext.Provider> */}
                    {project && (
                      <CustomFieldsForm
                        projectId={project.data.id}
                        phaseId={phaseId}
                        participationMethod={
                          phase?.data.attributes.participation_method
                        }
                        initialFormData={idea.data.attributes}
                      />
                    )}
                  </Box>
                </Box>
                {/* <ContentUploadDisclaimer
                  isDisclaimerOpened={isDisclaimerOpened}
                  onAcceptDisclaimer={() => onAcceptDisclaimer(formData)}
                  onCancelDisclaimer={onCancelDisclaimer}
                /> */}
              </main>
            </Box>
            {/* {selectedIdeaId && (
              <Box
                top={isSmallerThanPhone ? '0' : '40px'}
                width="375px"
                minWidth="375px"
                borderLeft={`1px solid ${colors.grey300}`}
                overflowY="auto"
                bgColor={colors.white}
                position="relative"
                mb="80px"
              >
                <InputDetailView ideaId={selectedIdeaId} />
              </Box>
            )} */}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default IdeasEditForm;

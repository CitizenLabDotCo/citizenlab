import React, { useState, useCallback, useEffect } from 'react';

import {
  Box,
  colors,
  stylingConsts,
  useBreakpoint,
  useWindowSize,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import { IdeaPublicationStatus } from 'api/ideas/types';
import useAddIdea from 'api/ideas/useAddIdea';
import useDraftIdeaByPhaseId, {
  clearDraftIdea,
} from 'api/ideas/useDraftIdeaByPhaseId';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useAuthUser from 'api/me/useAuthUser';
import { IPhases, IPhaseData } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import { IProject } from 'api/projects/types';

import useInputSchema from 'hooks/useInputSchema';
import useLocalize from 'hooks/useLocalize';

import ideaFormMessages from 'containers/IdeasNewPage/messages';

import Form from 'components/Form';
import { AjvErrorGetter, ApiErrorGetter } from 'components/Form/typings';
import FullPageSpinner from 'components/UI/FullPageSpinner';

import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import { isNilOrError } from 'utils/helperUtils';
import { getElementType, getFieldNameFromPath } from 'utils/JSONFormUtils';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import { getFormValues } from '../../IdeasEditPage/utils';
import IdeasNewSurveyMeta from '../IdeasNewSurveyMeta';

import SurveyHeading from './SurveyHeading';

const getConfig = (
  phaseFromUrl: IPhaseData | undefined,
  phases: IPhases | undefined
) => {
  const participationMethod = phaseFromUrl
    ? phaseFromUrl.attributes.participation_method
    : getCurrentPhase(phases?.data)?.attributes.participation_method;

  if (!participationMethod) return;
  return getMethodConfig(participationMethod);
};

interface FormValues {
  author_id?: string;
  idea_images_attributes?: { image: string }[];
  idea_files_attributes?: {
    file_by_content: { content: string };
    name: string;
  };
  publication_status?: IdeaPublicationStatus;
}

interface Props {
  project: IProject;
}

const IdeasNewSurveyForm = ({ project }: Props) => {
  const localize = useLocalize();
  const isSmallerThanPhone = useBreakpoint('phone');
  const { mutateAsync: addIdea } = useAddIdea();
  const { mutateAsync: updateIdea } = useUpdateIdea();
  const { data: authUser } = useAuthUser();
  const [queryParams] = useSearchParams();
  const phaseId = queryParams.get('phase_id') || undefined;
  const { data: phases } = usePhases(project.data.id);
  const { data: phaseFromUrl } = usePhase(phaseId);
  const {
    schema,
    uiSchema,
    inputSchemaError,
    isLoading: isLoadingInputSchema,
  } = useInputSchema({
    projectId: project.data.id,
    phaseId,
  });

  const { data: draftIdea, status: draftIdeaStatus } =
    useDraftIdeaByPhaseId(phaseId);
  const [loadingDraftIdea, setLoadingDraftIdea] = useState(true);
  const [ideaId, setIdeaId] = useState<string | undefined>();

  const [initialFormData, setInitialFormData] = useState({});
  const participationMethodConfig = getConfig(phaseFromUrl?.data, phases);
  const phase = phaseFromUrl
    ? phaseFromUrl.data
    : getCurrentPhase(phases?.data);
  const allowAnonymousPosting = phase?.attributes.allow_anonymous_participation;

  // Used only to rerender the component when window is resized https://stackoverflow.com/a/38641993
  useWindowSize();

  /*
    TODO: Both the api and ajv errors parts need a review. For now I've just copied this from the original (IdeasNewPage), but I'm not sure
    the survey form is using any of these errros.
  */
  const getApiErrorMessage: ApiErrorGetter = useCallback(
    (error) => {
      return (
        ideaFormMessages[
          `api_error_${uiSchema?.options?.inputTerm}_${error}`
        ] ||
        ideaFormMessages[`api_error_${error}`] ||
        ideaFormMessages[`api_error_invalid`]
      );
    },
    [uiSchema]
  );

  const getAjvErrorMessage: AjvErrorGetter = useCallback(
    (error) => {
      return (
        ideaFormMessages[
          `ajv_error_${uiSchema?.options?.inputTerm}_${
            getFieldNameFromPath(error.instancePath) ||
            error?.params?.missingProperty
          }_${error.keyword}`
        ] ||
        ideaFormMessages[
          `ajv_error_${
            getFieldNameFromPath(error.instancePath) ||
            error?.params?.missingProperty
          }_${error.keyword}`
        ] ||
        undefined
      );
    },
    [uiSchema]
  );

  // Try and load in a draft idea if one exists
  useEffect(() => {
    if (draftIdeaStatus === 'success' && !ideaId && schema) {
      const formValues = getFormValues(draftIdea, schema);
      setInitialFormData(formValues);
      setIdeaId(draftIdea.data.id);
      setLoadingDraftIdea(false);
    } else if (draftIdeaStatus === 'error') {
      setLoadingDraftIdea(false);
    }
  }, [draftIdeaStatus, draftIdea, schema, ideaId]);

  if (isLoadingInputSchema || loadingDraftIdea) return <FullPageSpinner />;
  if (
    // inputSchemaError should display an error page instead
    inputSchemaError ||
    !participationMethodConfig ||
    !phaseId ||
    !schema ||
    !uiSchema
  ) {
    return null;
  }

  const handleDraftIdeas = async (data: FormValues) => {
    if (data.publication_status === 'draft') {
      if (allowAnonymousPosting || isNilOrError(authUser)) {
        // Anonymous or not logged in surveys should not save drafts
        return;
      }

      return onSubmit(data, false);
    } else {
      return onSubmit(data, true);
    }
  };

  const onSubmit = async (data: FormValues, published?: boolean) => {
    const requestBody = {
      ...data,
      project_id: project.data.id,
      ...(canModerateProject(project.data.id, authUser)
        ? { phase_ids: [phaseId] }
        : {}), // Moderators can submit survey responses for inactive phases, in which case the backend cannot infer the correct phase (the current phase).
      publication_status: data.publication_status || 'published',
    };

    // Update or add the idea depending on if we have an existing draft idea
    const idea = ideaId
      ? await updateIdea({ id: ideaId, requestBody })
      : await addIdea(requestBody);
    setIdeaId(idea.data.id);

    const ideaAttributes = idea.data.attributes;
    const newData = { ...data };

    // Update the form data with the new idea attribute values. This is specifically important for
    // files at the moment where we add the id coming from the backend, but could be useful for other attributes in the future
    for (const key in ideaAttributes) {
      if (
        Object.prototype.hasOwnProperty.call(newData, key) &&
        typeof newData[key] === 'object' &&
        !Array.isArray(newData[key])
      ) {
        /* Merge objects while maintaining existing attributes and adding missing ones
         * 1. If the type is file_upload and the content attribute is present in newData and the id is present in ideaAttributes
         *    then we remove the content to avoid sending a big payload to the backend
         * 2. Otherwise, we merge newData[key] with ideaAttributes[key]
         * */
        if (
          getElementType(uiSchema, key) === 'file_upload' &&
          newData[key].content &&
          ideaAttributes[key].id
        ) {
          const { content: _removedContent, ...rest } = newData[key];
          newData[key] = { ...rest, ...ideaAttributes[key] };
        } else {
          newData[key] = { ...newData[key], ...ideaAttributes[key] };
        }
      }
    }

    setInitialFormData(newData);

    if (published) {
      clearDraftIdea(phaseId);
      participationMethodConfig.onFormSubmission({
        project: project.data,
        ideaId,
        idea,
      });
    }
  };

  function calculateDynamicHeight() {
    const viewportHeight = window.innerHeight;
    const menuHeight = stylingConsts.menuHeight;
    const mobileTopBarHeight = stylingConsts.mobileTopBarHeight;
    const extraSpace = 80;

    const dynamicHeight =
      viewportHeight -
      (isSmallerThanPhone ? mobileTopBarHeight : menuHeight) -
      extraSpace;

    return `${dynamicHeight}px`;
  }

  return (
    <>
      <IdeasNewSurveyMeta />
      <Box
        w="100%"
        bgColor={colors.grey100}
        h="100vh"
        position="fixed"
        zIndex="1010"
      >
        <Box
          mx="auto"
          position="relative"
          top={isSmallerThanPhone ? '0' : '40px'}
          maxWidth="700px"
        >
          <SurveyHeading
            titleText={localize(phase?.attributes.native_survey_title_multiloc)}
          />
        </Box>
        <main id="e2e-idea-new-page">
          <Box
            display="flex"
            justifyContent="center"
            pt={isSmallerThanPhone ? '0' : '40px'}
          >
            <Box
              background={colors.white}
              maxWidth="700px"
              w="100%"
              // Height is recalculated on window resize via useWindowSize hook
              h={calculateDynamicHeight()}
              pb={isSmallerThanPhone ? '0' : '80px'}
            >
              <Form
                schema={schema}
                uiSchema={uiSchema}
                onSubmit={handleDraftIdeas}
                initialFormData={initialFormData}
                getAjvErrorMessage={getAjvErrorMessage}
                getApiErrorMessage={getApiErrorMessage}
                inputId={ideaId}
                config={'survey'}
              />
            </Box>
          </Box>
        </main>
      </Box>
    </>
  );
};

export default IdeasNewSurveyForm;

import React, { useState, useCallback, useEffect } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
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

import Form from 'components/Form';
import { AjvErrorGetter, ApiErrorGetter } from 'components/Form/typings';
import FullPageSpinner from 'components/UI/FullPageSpinner';
import PageContainer from 'components/UI/PageContainer';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import { isNilOrError } from 'utils/helperUtils';
import { getElementType, getFieldNameFromPath } from 'utils/JSONFormUtils';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import { getFormValues } from '../../IdeasEditPage/utils';
import { Heading } from '../components/Heading';
import IdeasNewMeta from '../IdeasNewMeta';
import messages from '../messages';

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
  const { mutateAsync: addIdea } = useAddIdea();
  const { mutateAsync: updateIdea } = useUpdateIdea();
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const [queryParams] = useSearchParams();
  const phaseId = queryParams.get('phase_id') || undefined;
  const { data: phases } = usePhases(project.data.id);
  const { data: phaseFromUrl } = usePhase(phaseId);
  const { schema, uiSchema, inputSchemaError } = useInputSchema({
    projectId: project.data.id,
    phaseId,
  });
  const localize = useLocalize();

  const { data: draftIdea, status: draftIdeaStatus } =
    useDraftIdeaByPhaseId(phaseId);
  const [loadingDraftIdea, setLoadingDraftIdea] = useState(true);
  const [ideaId, setIdeaId] = useState<string | undefined>();

  const [initialFormData, setInitialFormData] = useState({});
  const participationMethodConfig = getConfig(phaseFromUrl?.data, phases);
  const allowAnonymousPosting =
    phaseFromUrl?.data.attributes.allow_anonymous_participation;

  const userIsModerator =
    !isNilOrError(authUser) &&
    canModerateProject(project.data.id, { data: authUser.data });

  const getApiErrorMessage: ApiErrorGetter = useCallback(
    (error) => {
      return (
        messages[`api_error_${uiSchema?.options?.inputTerm}_${error}`] ||
        messages[`api_error_${error}`] ||
        messages[`api_error_invalid`]
      );
    },
    [uiSchema]
  );

  const getAjvErrorMessage: AjvErrorGetter = useCallback(
    (error) => {
      return (
        messages[
          `ajv_error_${uiSchema?.options?.inputTerm}_${
            getFieldNameFromPath(error.instancePath) ||
            error?.params?.missingProperty
          }_${error.keyword}`
        ] ||
        messages[
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
    if (
      draftIdeaStatus === 'success' &&
      !isNilOrError(draftIdea) &&
      !ideaId &&
      schema
    ) {
      const formValues = getFormValues(draftIdea, schema);
      setInitialFormData(formValues);
      setIdeaId(draftIdea.data.id);
      setLoadingDraftIdea(false);
    } else if (draftIdeaStatus === 'error') {
      setLoadingDraftIdea(false);
    }
  }, [draftIdeaStatus, draftIdea, schema, ideaId]);

  if (!participationMethodConfig || !phaseId) {
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
      ...(userIsModerator ? { phase_ids: [phaseId] } : {}), // Moderators can submit survey responses for inactive phases, in which case the backend cannot infer the correct phase (the current phase).
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
      participationMethodConfig?.onFormSubmission({
        project: project.data,
        ideaId,
        idea,
      });
    }
  };

  return (
    <PageContainer id="e2e-idea-new-page" overflow="hidden">
      {!loadingDraftIdea && schema && uiSchema && participationMethodConfig ? (
        <>
          <IdeasNewMeta isSurvey={true} />
          <Form
            schema={schema}
            uiSchema={uiSchema}
            onSubmit={handleDraftIdeas}
            initialFormData={initialFormData}
            getAjvErrorMessage={getAjvErrorMessage}
            getApiErrorMessage={getApiErrorMessage}
            inputId={ideaId}
            title={
              <>
                <Heading
                  project={project.data}
                  titleText={localize(
                    participationContext?.attributes
                      .native_survey_title_multiloc
                  )}
                  isSurvey={true}
                  canUserEditProject={userIsModerator}
                  loggedIn={!isNilOrError(authUser)}
                />
                {allowAnonymousPosting && (
                  <Box mx="auto" p="20px" maxWidth="700px">
                    <Warning icon="shield-checkered">
                      {formatMessage(messages.anonymousSurveyMessage)}
                    </Warning>
                  </Box>
                )}
              </>
            }
            config={'survey'}
            formSubmitText={messages.submitSurvey}
          />
        </>
      ) : inputSchemaError ? null : (
        <FullPageSpinner />
      )}
    </PageContainer>
  );
};

export default IdeasNewSurveyForm;

import React, { useState, useCallback } from 'react';

// api
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import usePhase from 'api/phases/usePhase';
import useInputSchema from 'hooks/useInputSchema';
import { useSearchParams } from 'react-router-dom';
import useAddIdea from 'api/ideas/useAddIdea';
import useUpdateIdea from "api/ideas/useUpdateIdea";
import useDraftIdeaByPhaseId, {clearDraftIdea} from "api/ideas/useDraftIdeaByPhaseId";

// i18n
import messages from '../messages';
import { useIntl } from 'utils/cl-intl';

// components
import Form from 'components/Form';
import IdeasNewMeta from '../IdeasNewMeta';
import PageContainer from 'components/UI/PageContainer';
import FullPageSpinner from 'components/UI/FullPageSpinner';
import { Heading } from '../components/Heading';
import { Box } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';

// utils
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import { isNilOrError } from 'utils/helperUtils';
import { getCurrentPhase } from 'api/phases/utils';
import { getFieldNameFromPath } from 'utils/JSONFormUtils';
import { getFormValues } from "../../IdeasEditPage/utils";

// types
import { IPhases, IPhaseData } from 'api/phases/types';
import { AjvErrorGetter, ApiErrorGetter } from 'components/Form/typings';
import { IProject } from 'api/projects/types';
import { IdeaPublicationStatus } from "api/ideas/types";
import useIdeaFiles from "../../../api/idea_files/useIdeaFiles";

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
  const { data: draftIdea, status: draftIdeaStatus } = useDraftIdeaByPhaseId(phaseId);
  const { data: remoteFiles, status: remoteFilesStatus } = useIdeaFiles(draftIdea?.data.id);
  const [ideaId, setIdeaId] = useState<string|undefined>();

  const [initialFormData, setInitialFormData] = useState({});
  const participationContext = getCurrentPhase(phases?.data);
  const participationMethodConfig = getConfig(phaseFromUrl?.data, phases);
  const allowAnonymousPosting =
    participationContext?.attributes.allow_anonymous_participation;

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

  if (!participationMethodConfig || !phaseId) {
    return null;
  }

  // Try and load in a draft idea if one exists
  // TODO: Edwin - We've got the remote files here for attachments, but:
  // a) Need to get the form to load it when we load from draft
  // b) Need the form to change the value to the ID when it goes to the next screen
  const draftIdeaLoading = draftIdeaStatus === 'loading' || remoteFilesStatus === 'loading'
  if (!draftIdeaLoading && draftIdeaStatus === 'success' && !isNilOrError(draftIdea) && !ideaId && schema) {
    console.log(draftIdea);
    console.log(remoteFiles);
    setInitialFormData(
      getFormValues(
        draftIdea,
        schema,
        undefined,
        remoteFiles
      )
    );
    setIdeaId(draftIdea.data.id);
  }

  const handleDraftIdeas = async (data: FormValues) => {
    if (data.publication_status === 'draft') {
      if (isNilOrError(authUser)) {
        // Anonymous surveys should not save drafts
        return;
      }

      return onSubmit(data, false);
    } else {
      return onSubmit(data, true);
    }
  }

  const onSubmit = async (data: FormValues, published?: boolean) => {
    const requestBody = {
      ...data,
      project_id: project.data.id,
      publication_status: data.publication_status || 'published',
    };

    // Update or add the idea depending on if we have an existing draft idea
    const idea = ideaId ? await updateIdea({ id: ideaId, requestBody }) : await addIdea(requestBody);
    setIdeaId(idea.data.id);

    if (published) {
      clearDraftIdea(phaseId);
      participationMethodConfig?.onFormSubmission({project: project.data, ideaId, idea});
    }
  };

  const canUserEditProject =
    !isNilOrError(authUser) &&
    canModerateProject(project.data.id, { data: authUser.data });

  return (
    <PageContainer id="e2e-idea-new-page" overflow="hidden">
      {!draftIdeaLoading && schema && uiSchema && participationMethodConfig ? (
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
                  titleText={
                    participationMethodConfig.getFormTitle ? (
                      participationMethodConfig.getFormTitle({
                        project: project.data,
                        phases: phases?.data,
                        phaseFromUrl: phaseFromUrl?.data,
                      })
                    ) : (
                      <></>
                    )
                  }
                  isSurvey={true}
                  canUserEditProject={canUserEditProject}
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


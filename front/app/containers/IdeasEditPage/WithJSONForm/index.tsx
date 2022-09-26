import { PreviousPathnameContext } from 'context';
import React, { useCallback, useContext, useEffect } from 'react';

import clHistory from 'utils/cl-router/history';
import { WithRouterProps } from 'utils/cl-router/withRouter';

import useAuthUser from 'hooks/useAuthUser';
import useInputSchema from 'hooks/useInputSchema';
import usePhases from 'hooks/usePhases';
import useProject from 'hooks/useProject';
import { getInputTerm } from 'services/participationContexts';
import { isError, isNilOrError } from 'utils/helperUtils';

import ideaFormMessages from 'containers/IdeasNewPage/messages';
import { FormattedMessage } from 'react-intl';
import messages from '../messages';

import Form, { AjvErrorGetter, ApiErrorGetter } from 'components/Form';

import FullPageSpinner from 'components/UI/FullPageSpinner';
import PageContainer from 'components/UI/PageContainer';
import useIdea from 'hooks/useIdea';
import { updateIdea } from 'services/ideas';
import { usePermission } from 'services/permissions';
import { getFieldNameFromPath } from 'utils/JSONFormUtils';
import { geocode } from 'utils/locationTools';
import IdeasEditMeta from '../IdeasEditMeta';

const IdeasEditPageWithJSONForm = ({ params: { ideaId } }: WithRouterProps) => {
  const previousPathName = useContext(PreviousPathnameContext);
  const authUser = useAuthUser();
  const idea = useIdea({ ideaId });
  const project = useProject({
    projectId: isNilOrError(idea) ? null : idea.relationships.project.data.id,
  });

  const phases = usePhases(project?.id);
  const { schema, uiSchema, inputSchemaError } = useInputSchema(project?.id);
  const permisison = usePermission({
    item: isNilOrError(idea) ? null : idea,
    action: 'edit',
    context: idea,
  });

  useEffect(() => {
    if (!isNilOrError(idea) && !permisison) {
      clHistory.replace(previousPathName || (!authUser ? '/sign-up' : '/'));
    }
  }, [authUser, idea, previousPathName, permisison]);

  const initialFormData =
    isNilOrError(idea) || !schema
      ? null
      : Object.fromEntries(
          Object.keys(schema.properties).map((prop) => {
            if (idea.attributes?.[prop]) {
              return [prop, idea.attributes?.[prop]];
            } else if (
              prop === 'topic_ids' &&
              Array.isArray(idea.relationships?.topics?.data)
            ) {
              return [
                prop,
                idea.relationships?.topics?.data.map((rel) => rel.id),
              ];
            } else return [prop, undefined];
          })
        );

  const onSubmit = async (data) => {
    let location_point_geojson;

    if (data.location_description && !data.location_point_geojson) {
      location_point_geojson = await geocode(data.location_description);
    }

    const idea = await updateIdea(ideaId, {
      ...data,
      location_point_geojson,
      project_id: project?.id,
      publication_status: 'published',
    });

    clHistory.push({
      pathname: `/ideas/${idea.data.attributes.slug}`,
    });
  };

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

  return (
    <PageContainer overflow="hidden" id="e2e-idea-edit-page">
      {!isNilOrError(project) && !isNilOrError(idea) && schema && uiSchema ? (
        <>
          <IdeasEditMeta ideaId={ideaId} projectId={project.id} />
          <Form
            schema={schema}
            uiSchema={uiSchema}
            onSubmit={onSubmit}
            initialFormData={initialFormData}
            inputId={idea.id}
            getAjvErrorMessage={getAjvErrorMessage}
            getApiErrorMessage={getApiErrorMessage}
            title={
              <FormattedMessage
                {...{
                  idea: messages.formTitle,
                  option: messages.optionFormTitle,
                  project: messages.projectFormTitle,
                  question: messages.questionFormTitle,
                  issue: messages.issueFormTitle,
                  contribution: messages.contributionFormTitle,
                }[
                  getInputTerm(
                    project?.attributes.process_type,
                    project,
                    phases
                  )
                ]}
              />
            }
          />
        </>
      ) : isError(project) || inputSchemaError ? null : (
        <FullPageSpinner />
      )}
    </PageContainer>
  );
};

export default IdeasEditPageWithJSONForm;

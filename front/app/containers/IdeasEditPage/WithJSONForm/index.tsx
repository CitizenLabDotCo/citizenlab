import React, { useCallback, useContext, useEffect } from 'react';

// components
import PageContainer from 'components/UI/PageContainer';
import FullPageSpinner from 'components/UI/FullPageSpinner';
import { Box } from '@citizenlab/cl2-component-library';
import ideaFormMessages from 'containers/IdeasNewPage/messages';
import Form, { AjvErrorGetter, ApiErrorGetter } from 'components/Form';
import GoBackToIdeaPage from 'containers/IdeasEditPage/GoBackToIdeaPage';
import IdeasEditMeta from '../IdeasEditMeta';

// services
import { deleteIdeaImage } from 'services/ideaImages';
import { usePermission } from 'services/permissions';
import { updateIdea } from 'services/ideas';

// hooks
import useIdea from 'hooks/useIdea';
import useAuthUser from 'hooks/useAuthUser';
import useProject from 'hooks/useProject';
import useInputSchema from 'hooks/useInputSchema';
import useIdeaImages from 'hooks/useIdeaImages';
import useResourceFiles from 'hooks/useResourceFiles';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// utils
import { getLocationGeojson } from '../utils';
import { omit } from 'lodash-es';
import { isError, isNilOrError } from 'utils/helperUtils';
import { WithRouterProps } from 'utils/cl-router/withRouter';
import clHistory from 'utils/cl-router/history';
import { getFieldNameFromPath } from 'utils/JSONFormUtils';
import { PreviousPathnameContext } from 'context';

const IdeasEditPageWithJSONForm = ({ params: { ideaId } }: WithRouterProps) => {
  const previousPathName = useContext(PreviousPathnameContext);
  const authUser = useAuthUser();
  const idea = useIdea({ ideaId });
  const project = useProject({
    projectId: isNilOrError(idea) ? null : idea.relationships.project.data.id,
  });
  const remoteImages = useIdeaImages(ideaId);
  const remoteFiles = useResourceFiles({
    resourceId: ideaId,
    resourceType: 'idea',
  });

  const { schema, uiSchema, inputSchemaError } = useInputSchema({
    projectId: project?.id,
    inputId: ideaId,
  });
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
            if (prop === 'author_id') {
              return [prop, idea.relationships?.author?.data?.id];
            } else if (idea.attributes?.[prop]) {
              return [prop, idea.attributes?.[prop]];
            } else if (
              prop === 'topic_ids' &&
              Array.isArray(idea.relationships?.topics?.data)
            ) {
              return [
                prop,
                idea.relationships?.topics?.data.map((rel) => rel.id),
              ];
            } else if (
              prop === 'idea_images_attributes' &&
              Array.isArray(idea.relationships?.idea_images?.data)
            ) {
              return [prop, remoteImages];
            } else if (prop === 'idea_files_attributes') {
              const attachmentsValue =
                !isNilOrError(remoteFiles) && remoteFiles.length > 0
                  ? remoteFiles
                  : undefined;
              return [prop, attachmentsValue];
            } else return [prop, undefined];
          })
        );

  // Set initial location point if exists
  if (
    initialFormData &&
    !isNilOrError(idea) &&
    idea.attributes &&
    idea.attributes.location_point_geojson
  ) {
    initialFormData['location_point_geojson'] =
      idea.attributes.location_point_geojson;
  }

  const onSubmit = async (data) => {
    const { idea_images_attributes, ...ideaWithoutImages } = data;

    const location_point_geojson = await getLocationGeojson(
      initialFormData,
      data
    );

    const isImageNew =
      idea_images_attributes !== initialFormData?.idea_images_attributes;

    // Delete a remote image only on submission
    if (isImageNew && initialFormData?.idea_images_attributes !== undefined) {
      try {
        deleteIdeaImage(ideaId, initialFormData?.idea_images_attributes[0].id);
      } catch (e) {
        // TODO: Add graceful error handling
      }
    }

    const payload = {
      ...ideaWithoutImages,
      idea_images_attributes,
      location_point_geojson,
      project_id: project?.id,
      publication_status: 'published',
    };

    const idea = await updateIdea(
      ideaId,
      isImageNew
        ? omit(payload, 'idea_files_attributes')
        : omit(payload, ['idea_images_attributes', 'idea_files_attributes'])
    );
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

  if (isNilOrError(project)) {
    return null;
  }

  const TitleComponent = !isNilOrError(idea) ? (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      pt="60px"
      pb="40px"
    >
      <GoBackToIdeaPage idea={idea} />

      <FormattedMessage
        {...{
          idea: messages.formTitle,
          option: messages.optionFormTitle,
          project: messages.projectFormTitle,
          question: messages.questionFormTitle,
          issue: messages.issueFormTitle,
          contribution: messages.contributionFormTitle,
        }[
          uiSchema && uiSchema?.options?.inputTerm
            ? uiSchema.options.inputTerm
            : 'idea'
        ]}
      />
    </Box>
  ) : undefined;

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
            config={'input'}
            title={TitleComponent}
          />
        </>
      ) : isError(project) || inputSchemaError ? null : (
        <FullPageSpinner />
      )}
    </PageContainer>
  );
};

export default IdeasEditPageWithJSONForm;

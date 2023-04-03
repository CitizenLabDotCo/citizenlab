import React, { useCallback, useContext, useEffect } from 'react';

// components
import { Content, Top } from '../PostPreview';
import {
  Box,
  Button,
  colors,
  Spinner,
} from '@citizenlab/cl2-component-library';
import ideaFormMessages from 'containers/IdeasNewPage/messages';
import Form, { AjvErrorGetter, ApiErrorGetter } from 'components/Form';

// services
import { deleteIdeaImage } from 'services/ideaImages';
import { usePermission } from 'services/permissions';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
// hooks
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'hooks/useAuthUser';
import useProject from 'hooks/useProject';
import useInputSchema from 'hooks/useInputSchema';
import useIdeaImages from 'hooks/useIdeaImages';
import useResourceFiles from 'hooks/useResourceFiles';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// utils
import { getLocationGeojson } from 'containers/IdeasEditPage/utils';
import { omit } from 'lodash-es';
import { isError, isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import { getFieldNameFromPath } from 'utils/JSONFormUtils';
import { PreviousPathnameContext } from 'context';

const AdminIdeaEdit = ({
  ideaId,
  goBack,
}: {
  ideaId: string;
  goBack: () => void;
}) => {
  const previousPathName = useContext(PreviousPathnameContext);
  const authUser = useAuthUser();
  const { data: idea } = useIdeaById(ideaId);
  const granted = usePermission({
    item: idea?.data || null,
    action: 'edit',
    context: idea?.data || null,
  });

  const { mutate: updateIdea } = useUpdateIdea();
  const project = useProject({
    projectId: isNilOrError(idea)
      ? null
      : idea.data.relationships.project.data.id,
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

  useEffect(() => {
    if (idea && authUser !== undefined && !granted) {
      clHistory.replace(previousPathName || (!authUser ? '/sign-up' : '/'));
    }
  }, [idea, granted, previousPathName, authUser]);

  const initialFormData =
    isNilOrError(idea) || !schema
      ? null
      : Object.fromEntries(
          Object.keys(schema.properties).map((prop) => {
            if (prop === 'author_id') {
              return [prop, idea.data.relationships?.author?.data?.id];
            } else if (idea.data.attributes?.[prop]) {
              return [prop, idea.data.attributes?.[prop]];
            } else if (
              prop === 'topic_ids' &&
              Array.isArray(idea.data.relationships?.topics?.data)
            ) {
              return [
                prop,
                idea.data.relationships?.topics?.data.map((rel) => rel.id),
              ];
            } else if (
              prop === 'idea_images_attributes' &&
              Array.isArray(idea.data.relationships?.idea_images?.data)
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
    idea.data.attributes &&
    idea.data.attributes.location_point_geojson
  ) {
    initialFormData['location_point_geojson'] =
      idea.data.attributes.location_point_geojson;
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

    updateIdea(
      {
        id: ideaId,
        requestBody: isImageNew
          ? omit(payload, 'idea_files_attributes')
          : omit(payload, ['idea_images_attributes', 'idea_files_attributes']),
      },
      {
        onSuccess: () => {
          goBack();
        },
      }
    );
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

  return (
    <Box>
      <Top>
        <Button
          icon="arrow-left"
          buttonStyle="text"
          textColor={colors.primary}
          onClick={goBack}
        >
          <FormattedMessage {...messages.cancelEdit} />
        </Button>
      </Top>

      <Content className="idea-form">
        {!isNilOrError(project) && !isNilOrError(idea) && schema && uiSchema ? (
          <Form
            schema={schema}
            uiSchema={uiSchema}
            onSubmit={onSubmit}
            initialFormData={initialFormData}
            inputId={idea.data.id}
            getAjvErrorMessage={getAjvErrorMessage}
            getApiErrorMessage={getApiErrorMessage}
            config={'input'}
            layout={'inline'}
          />
        ) : isError(project) || inputSchemaError ? null : (
          <Spinner />
        )}
      </Content>
    </Box>
  );
};

export default AdminIdeaEdit;

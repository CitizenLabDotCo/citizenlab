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
import { usePermission } from 'services/permissions';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useDeleteIdeaImage from 'api/idea_images/useDeleteIdeaImage';

// hooks
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'hooks/useAuthUser';
import useProjectById from 'api/projects/useProjectById';
import useInputSchema from 'hooks/useInputSchema';
import useIdeaImages from 'api/idea_images/useIdeaImages';
import useIdeaFiles from 'api/idea_files/useIdeaFiles';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// utils
import { getLocationGeojson } from 'containers/IdeasEditPage/utils';
import { omit } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
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
  const { mutate: deleteIdeaImage } = useDeleteIdeaImage();
  const granted = usePermission({
    item: idea?.data || null,
    action: 'edit',
    context: idea?.data || null,
  });

  const { mutate: updateIdea } = useUpdateIdea();
  const { data: project, status: projectStatus } = useProjectById(
    idea?.data.relationships.project.data.id
  );
  const { data: remoteImages } = useIdeaImages(ideaId);
  const { data: remoteFiles } = useIdeaFiles(ideaId);

  const { schema, uiSchema, inputSchemaError } = useInputSchema({
    projectId: project?.data.id,
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
              return [prop, remoteImages?.data];
            } else if (prop === 'idea_files_attributes') {
              const attachmentsValue =
                !isNilOrError(remoteFiles) && remoteFiles.data.length > 0
                  ? remoteFiles.data
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
    if (isImageNew && initialFormData?.idea_images_attributes[0]?.id) {
      deleteIdeaImage({
        ideaId,
        imageId: initialFormData.idea_images_attributes[0].id,
      });
    }

    const payload = {
      ...ideaWithoutImages,
      idea_images_attributes,
      location_point_geojson,
      project_id: project?.data.id,
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
        {project && idea && schema && uiSchema ? (
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
        ) : projectStatus === 'error' || inputSchemaError ? null : (
          <Spinner />
        )}
      </Content>
    </Box>
  );
};

export default AdminIdeaEdit;

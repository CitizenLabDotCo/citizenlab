import React from 'react';

import { Box, Button, Spinner } from '@citizenlab/cl2-component-library';
import { omit } from 'lodash-es';
import { useTheme } from 'styled-components';

import useIdeaFiles from 'api/idea_files/useIdeaFiles';
import useDeleteIdeaImage from 'api/idea_images/useDeleteIdeaImage';
import useIdeaImages from 'api/idea_images/useIdeaImages';
import useIdeaById from 'api/ideas/useIdeaById';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useProjectById from 'api/projects/useProjectById';

import useInputSchema from 'hooks/useInputSchema';

import { getLocationGeojson } from 'containers/IdeasEditPage/utils';
import ideaFormMessages from 'containers/IdeasNewPage/messages';

import {
  Content,
  Top,
} from 'components/admin/PostManager/components/PostPreview';
import Form from 'components/Form';
import { AjvErrorGetter, ApiErrorGetter } from 'components/Form/typings';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { getFieldNameFromPath } from 'utils/JSONFormUtils';

import messages from '../messages';

const AdminIdeaEdit = ({
  ideaId,
  goBack,
}: {
  ideaId: string;
  goBack: () => void;
}) => {
  const theme = useTheme();
  const { data: idea } = useIdeaById(ideaId);
  const { mutate: deleteIdeaImage } = useDeleteIdeaImage();

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

  if (!idea || !project) return null;

  const initialFormData = !schema
    ? null
    : Object.fromEntries(
        Object.keys(schema.properties).map((prop) => {
          if (prop === 'author_id') {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            return [prop, idea.data.relationships?.author?.data?.id];
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          } else if (idea.data.attributes?.[prop]) {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            return [prop, idea.data.attributes?.[prop]];
          } else if (
            prop === 'topic_ids' &&
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            Array.isArray(idea.data.relationships?.topics?.data)
          ) {
            return [
              prop,
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              idea.data.relationships?.topics?.data.map((rel) => rel.id),
            ];
          } else if (
            prop === 'cosponsor_ids' &&
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            Array.isArray(idea.data.relationships?.cosponsors?.data)
          ) {
            return [
              prop,
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              idea.data.relationships?.cosponsors?.data.map((rel) => rel.id),
            ];
          } else if (
            prop === 'idea_images_attributes' &&
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
  if (initialFormData && idea.data.attributes.location_point_geojson) {
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

  const getApiErrorMessage: ApiErrorGetter = (error) => {
    return (
      ideaFormMessages[`api_error_${uiSchema?.options?.inputTerm}_${error}`] ||
      ideaFormMessages[`api_error_${error}`] ||
      ideaFormMessages['api_error_invalid']
    );
  };

  const getAjvErrorMessage: AjvErrorGetter = (error) => {
    return (
      messages[
        `ajv_error_${uiSchema?.options?.inputTerm}_${
          getFieldNameFromPath(error.instancePath) ||
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          error?.params?.missingProperty
        }_${error.keyword}`
      ] ||
      messages[
        `ajv_error_${
          getFieldNameFromPath(error.instancePath) ||
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          error?.params?.missingProperty
        }_${error.keyword}`
      ] ||
      undefined
    );
  };

  return (
    <Box border="1px solid white" borderRadius={theme.borderRadius}>
      <Top>
        <Button onClick={goBack}>
          <FormattedMessage {...messages.cancelEdit} />
        </Button>
      </Top>

      <Content className="idea-form">
        {schema && uiSchema ? (
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

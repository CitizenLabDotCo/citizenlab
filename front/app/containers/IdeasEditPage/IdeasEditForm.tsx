import React, { useCallback, useContext, useEffect, useState } from 'react';

// components
import PageContainer from 'components/UI/PageContainer';
import FullPageSpinner from 'components/UI/FullPageSpinner';
import { Box } from '@citizenlab/cl2-component-library';
import ideaFormMessages from 'containers/IdeasNewPage/messages';
import Form from 'components/Form';
import GoBackToIdeaPage from 'containers/IdeasEditPage/GoBackToIdeaPage';
import IdeasEditMeta from './IdeasEditMeta';
import ContentUploadDisclaimer from 'components/ContentUploadDisclaimer';

// services
import { usePermission } from 'utils/permissions';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
import useDeleteIdeaImage from 'api/idea_images/useDeleteIdeaImage';

// hooks
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'api/me/useAuthUser';
import useProjectById from 'api/projects/useProjectById';
import useInputSchema from 'hooks/useInputSchema';
import useIdeaImages from 'api/idea_images/useIdeaImages';
import useIdeaFiles from 'api/idea_files/useIdeaFiles';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { getLocationGeojson, getFormValues } from './utils';
import { omit } from 'lodash-es';
import { isError, isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import { getFieldNameFromPath } from 'utils/JSONFormUtils';
import { PreviousPathnameContext } from 'context';

// typings
import { IIdeaUpdate } from 'api/ideas/types';
import { Multiloc } from 'typings';
import { AjvErrorGetter, ApiErrorGetter } from 'components/Form/typings';
import { useParams } from 'react-router-dom';

interface FormValues {
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
}

const IdeasEditForm = () => {
  const { ideaId } = useParams() as { ideaId: string };
  const previousPathName = useContext(PreviousPathnameContext);
  const [isDisclaimerOpened, setIsDisclaimerOpened] = useState(false);
  const [formData, setFormData] = useState<FormValues | null>(null);

  const { data: authUser } = useAuthUser();
  const { data: idea } = useIdeaById(ideaId);
  const { mutate: deleteIdeaImage } = useDeleteIdeaImage();
  const granted = usePermission({
    item: idea?.data || null,
    action: 'edit',
    context: idea?.data || null,
  });

  const { mutateAsync: updateIdea } = useUpdateIdea();
  const { data: project } = useProjectById(
    isNilOrError(idea) ? null : idea.data.relationships.project.data.id
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
      : getFormValues(idea, schema, remoteImages, remoteFiles);

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

  const handleDisclaimer = (data: FormValues) => {
    const disclamerNeeded =
      data.idea_files_attributes ||
      data.idea_images_attributes ||
      Object.values(data.body_multiloc).some((value) => value.includes('<img'));

    setFormData(data);
    if (disclamerNeeded) {
      return setIsDisclaimerOpened(true);
    } else {
      return onSubmit(data);
    }
  };

  const onAcceptDisclaimer = (data: FormValues | null) => {
    if (!data) return;
    onSubmit(data);
    setIsDisclaimerOpened(false);
  };

  const onCancelDisclaimer = () => {
    setIsDisclaimerOpened(false);
  };

  const onSubmit = async (data: FormValues) => {
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

    const payload: IIdeaUpdate = {
      ...ideaWithoutImages,
      idea_images_attributes,
      location_point_geojson,
      project_id: project?.data.id,
      publication_status: 'published',
    };

    const idea = await updateIdea({
      id: ideaId,
      requestBody: isImageNew
        ? omit(payload, 'idea_files_attributes')
        : omit(payload, ['idea_images_attributes', 'idea_files_attributes']),
    });

    clHistory.push(
      {
        pathname: `/ideas/${idea.data.attributes.slug}`,
      },
      { scrollToTop: true }
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
      <GoBackToIdeaPage idea={idea.data} />

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
      {project && !isNilOrError(idea) && schema && uiSchema ? (
        <>
          <IdeasEditMeta ideaId={ideaId} projectId={project.data.id} />
          <Form
            schema={schema}
            uiSchema={uiSchema}
            onSubmit={handleDisclaimer}
            initialFormData={initialFormData}
            inputId={idea.data.id}
            getAjvErrorMessage={getAjvErrorMessage}
            getApiErrorMessage={getApiErrorMessage}
            config={'input'}
            title={TitleComponent}
          />
        </>
      ) : isError(project) || inputSchemaError ? null : (
        <FullPageSpinner />
      )}
      <ContentUploadDisclaimer
        isDisclaimerOpened={isDisclaimerOpened}
        onAcceptDisclaimer={() => onAcceptDisclaimer(formData)}
        onCancelDisclaimer={onCancelDisclaimer}
      />
    </PageContainer>
  );
};

export default IdeasEditForm;

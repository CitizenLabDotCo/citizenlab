import React, { useCallback, useState } from 'react';

import { Box, colors, useBreakpoint } from '@citizenlab/cl2-component-library';
import { omit } from 'lodash-es';
import { Multiloc } from 'typings';

import useIdeaFiles from 'api/idea_files/useIdeaFiles';
import useDeleteIdeaImage from 'api/idea_images/useDeleteIdeaImage';
import useIdeaImages from 'api/idea_images/useIdeaImages';
import { IdeaPublicationStatus, IIdeaUpdate } from 'api/ideas/types';
import useIdeaById from 'api/ideas/useIdeaById';
import useUpdateIdea from 'api/ideas/useUpdateIdea';

import useInputSchema from 'hooks/useInputSchema';

import EditIdeaHeading from 'containers/IdeaHeading/EditIdeaHeading';
import ideaFormMessages from 'containers/IdeasNewPage/messages';
import { calculateDynamicHeight } from 'containers/IdeasNewSurveyPage/IdeasNewSurveyForm/utils';

import ContentUploadDisclaimer from 'components/ContentUploadDisclaimer';
import Form from 'components/Form';
import { AjvErrorGetter, ApiErrorGetter } from 'components/Form/typings';
import FullPageSpinner from 'components/UI/FullPageSpinner';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { getFieldNameFromPath } from 'utils/JSONFormUtils';

import IdeasEditMeta from './IdeasEditMeta';
import messages from './messages';
import { getLocationGeojson, getFormValues } from './utils';

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
  cosponsor_ids?: string[];
  publication_status?: IdeaPublicationStatus;
}
interface Props {
  ideaId: string;
}

const IdeasEditForm = ({ ideaId }: Props) => {
  const [isDisclaimerOpened, setIsDisclaimerOpened] = useState(false);
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: idea } = useIdeaById(ideaId);
  const { mutate: deleteIdeaImage } = useDeleteIdeaImage();
  const isSmallerThanPhone = useBreakpoint('phone');

  const { mutateAsync: updateIdea } = useUpdateIdea();
  const { data: remoteImages } = useIdeaImages(ideaId);
  const { data: remoteFiles } = useIdeaFiles(ideaId);
  const projectId = idea?.data.relationships.project.data.id;

  const {
    schema,
    uiSchema,
    inputSchemaError,
    isLoading: isLoadingInputSchema,
  } = useInputSchema({
    projectId,
    inputId: ideaId,
  });

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
    },
    [uiSchema]
  );

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

  const initialFormData = getFormValues(
    idea,
    schema,
    remoteImages,
    remoteFiles
  );

  // Set initial location point if exists
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (initialFormData && idea.data.attributes.location_point_geojson) {
    initialFormData['location_point_geojson'] =
      idea.data.attributes.location_point_geojson;
  }

  const handleDisclaimer = (data: FormValues) => {
    const disclaimerNeeded =
      data.idea_files_attributes ||
      data.idea_images_attributes ||
      Object.values(data.body_multiloc).some((value) => value.includes('<img'));

    setFormData(data);
    if (data.publication_status === 'published') {
      if (disclaimerNeeded) {
        return setIsDisclaimerOpened(true);
      }
      return onSubmit(data);
    } else {
      // Add handling draft ideas
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
    setLoading(true);
    const { idea_images_attributes, ...ideaWithoutImages } = data;

    const location_point_geojson = await getLocationGeojson(
      initialFormData,
      data
    );

    const isImageNew =
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      idea_images_attributes !== initialFormData?.idea_images_attributes;

    // Delete a remote image only on submission
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
      project_id: projectId,
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
    setLoading(false);
  };

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
      }[
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        uiSchema && uiSchema?.options?.inputTerm
          ? uiSchema.options.inputTerm
          : 'idea'
      ]}
    />
  );

  return (
    <>
      <IdeasEditMeta ideaId={ideaId} projectId={projectId} />
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
              maxWidth="700px"
              w="100%"
              // Height is recalculated on window resize via useWindowSize hook
              h={calculateDynamicHeight(isSmallerThanPhone)}
              pb={isSmallerThanPhone ? '0' : '80px'}
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
            </Box>
          </Box>
          <ContentUploadDisclaimer
            isDisclaimerOpened={isDisclaimerOpened}
            onAcceptDisclaimer={() => onAcceptDisclaimer(formData)}
            onCancelDisclaimer={onCancelDisclaimer}
          />
        </main>
      </Box>
    </>
  );
};

export default IdeasEditForm;

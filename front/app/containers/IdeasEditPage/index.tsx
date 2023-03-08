import React, { useEffect, useState } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError, isUnauthorizedError } from 'utils/helperUtils';
import { isError } from 'lodash-es';

// router
import clHistory from 'utils/cl-router/history';

// hooks
import useProject from 'hooks/useProject';

// components
import IdeaForm, { IIdeaFormOutput } from 'components/IdeaForm';
import IdeasEditButtonBar from './IdeasEditButtonBar';
import IdeasEditMeta from './IdeasEditMeta';
import GoBackToIdeaPage from 'containers/IdeasEditPage/GoBackToIdeaPage';
import { Box } from '@citizenlab/cl2-component-library';
import Unauthorized from 'components/Unauthorized';
import PageNotFound from 'components/PageNotFound';

// feature flag variant
import IdeasEditPageWithJSONForm from './WithJSONForm';

// services
import { addIdeaImage, deleteIdeaImage } from 'services/ideaImages';
import { addIdeaFile, deleteIdeaFile } from 'services/ideaFiles';
import { getInputTerm } from 'services/participationContexts';
import useLocale from 'hooks/useLocale';
import useUpdateIdea from 'api/ideas/useUpdateIdea';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { getInputTermMessage } from 'utils/i18n';

// utils
import { geocode } from 'utils/locationTools';

// typings
import { UploadFile, Multiloc } from 'typings';

// style
import { media, fontSizes, colors } from 'utils/styleUtils';
import styled from 'styled-components';

// resource components
import GetRemoteFiles, {
  GetRemoteFilesChildProps,
} from 'resources/GetRemoteFiles';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetIdeaById, { GetIdeaByIdChildProps } from 'resources/GetIdeaById';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';

// tracks
import tracks from './tracks';
import { trackEventByName } from 'utils/analytics';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import useFeatureFlag from 'hooks/useFeatureFlag';

// typings
import { IIdeaData } from 'api/ideas/types';
import useIdeaImage from 'hooks/useIdeaImage';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { hasPermission } from 'services/permissions';

const Container = styled.div`
  background: ${colors.background};
`;

const FormContainer = styled.main`
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-bottom: 100px;
  padding-right: 30px;
  padding-left: 30px;
  margin-left: auto;
  margin-right: auto;

  ${media.tablet`
    padding-bottom: 80px;
  `}
`;

const Title = styled.h1`
  width: 100%;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.xxxxl}px;
  line-height: 42px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 40px;
`;

const ButtonBarContainer = styled.div`
  width: 100%;
  height: 68px;
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: solid 1px #ddd;
`;

interface InputProps {
  params: {
    ideaId: string;
  };
}

interface DataProps {
  remoteIdeaFiles: GetRemoteFilesChildProps;
  project: GetProjectChildProps;
  idea: GetIdeaByIdChildProps;
  appConfiguration: GetAppConfigurationChildProps;
  phases: GetPhasesChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

const IdeaEditPage = ({
  params: { ideaId },
  project,
  authUser,
  appConfiguration,
  remoteIdeaFiles,
  idea,
  phases,
}: Props) => {
  const locale = useLocale();
  const { mutate: updateIdea } = useUpdateIdea();

  const ideaImages = !isNilOrError(idea) && idea.relationships.idea_images.data;
  const ideaImageId =
    ideaImages && ideaImages.length > 0 ? ideaImages[0].id : null;

  const ideaImage = useIdeaImage({
    ideaId: !isNilOrError(idea) ? idea.id : null,
    ideaImageId,
  });

  const [ideaFiles, setIdeaFiles] = useState<UploadFile[]>([]);
  const [imageFileIsChanged, setImageFileIsChanged] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [titleProfanityError, setTitleProfanityError] = useState(false);
  const [descriptionProfanityError, setDescriptionProfanityError] =
    useState(false);
  const [fileOrImageError, setFileOrImageError] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [titleMultiloc, setTitleMultiloc] = useState<Multiloc | null>(null);
  const [descriptionMultiloc, setDescriptionMultiloc] =
    useState<Multiloc | null>(null);
  const [imageFile, setImageFile] = useState<UploadFile[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!isNilOrError(idea)) {
      const granted = hasPermission({
        item: idea,
        action: 'edit',
        context: idea,
      });

      if (!granted) {
        clHistory.push('/');
      }
    }
  }, [idea]);

  useEffect(() => {
    if (!isNilOrError(ideaImage)) {
      (async () => {
        const imageUrl = ideaImage.attributes.versions.large;
        if (imageUrl) {
          const imageFile = await convertUrlToUploadFile(imageUrl);
          if (imageFile) {
            setImageFile([imageFile]);
          }
        }
      })();
    }
  }, [ideaImage]);

  if (isNilOrError(locale) || isNilOrError(idea)) {
    return null;
  }

  if (isNilOrError(locale) || isNilOrError(idea) || isNilOrError(project)) {
    return null;
  }

  const authorId = idea.relationships.author.data?.id || null;
  const budget = idea.attributes.budget;
  const proposedBudget = idea.attributes.proposed_budget;

  const handleIdeaFormOutput = async (ideaFormOutput: IIdeaFormOutput) => {
    const {
      title,
      description,
      selectedTopics,
      budget,
      proposedBudget,
      ideaFiles,
      ideaFilesToRemove,
      address,
    } = ideaFormOutput;
    const oldImageId = ideaImageId;
    const newImage =
      ideaFormOutput.imageFile && ideaFormOutput.imageFile.length > 0
        ? ideaFormOutput.imageFile[0]
        : null;
    const newImageBase64 = newImage ? newImage.base64 : null;
    const imageToAddPromise =
      imageFileIsChanged && newImageBase64
        ? addIdeaImage(ideaId, newImageBase64, 0)
        : Promise.resolve(null);
    const filesToAddPromises = ideaFiles
      .filter((file) => !file.remote)
      .map((file) => addIdeaFile(ideaId, file.base64, file.name));
    const filesToRemovePromises = ideaFilesToRemove
      .filter((file) => !!(file.remote && file.id))
      .map((file) => deleteIdeaFile(ideaId, file.id as string));
    const finalAuthorId = ideaFormOutput?.authorId || authorId;
    const addressDiff: Partial<IIdeaData['attributes']> = {
      location_point_geojson: null,
      location_description: null,
    };

    if (address && address.length > 0) {
      addressDiff.location_point_geojson = await geocode(address);
      addressDiff.location_description = address;
    }

    updateIdea({
      id: ideaId,
      requestBody: {
        budget,
        proposed_budget: proposedBudget,
        title_multiloc: {
          ...titleMultiloc,
          [locale]: title,
        },
        body_multiloc: {
          ...descriptionMultiloc,
          [locale]: description,
        },
        topic_ids: selectedTopics,
        author_id: finalAuthorId,
        ...addressDiff,
      },
    });

    setSubmitError(false);
    setProcessing(true);

    try {
      if (oldImageId && imageFileIsChanged) {
        await deleteIdeaImage(ideaId, oldImageId);
      }

      await Promise.all([
        imageToAddPromise,
        ...filesToAddPromises,
        ...filesToRemovePromises,
      ] as Promise<any>[]);

      clHistory.push(`/ideas/${idea.attributes.slug}`);
    } catch (error) {
      const apiErrors = error.json.errors;
      const profanityApiError = apiErrors.base.find(
        (apiError) => apiError.error === 'includes_banned_words'
      );

      if (profanityApiError) {
        const titleProfanityError = profanityApiError.blocked_words.some(
          (blockedWord) => blockedWord.attribute === 'title_multiloc'
        );
        const descriptionProfanityError = profanityApiError.blocked_words.some(
          (blockedWord) => blockedWord.attribute === 'body_multiloc'
        );

        if (titleProfanityError) {
          trackEventByName(tracks.titleProfanityError.name, {
            ideaId,
            locale,
            projectId: !isNilOrError(project) ? project.id : null,
            profaneMessage: title,
            location: 'IdeasEditPage (citizen side)',
            userId: !isNilOrError(authUser) ? authUser.id : null,
            host: !isNilOrError(appConfiguration)
              ? appConfiguration.attributes.host
              : null,
          });

          setTitleProfanityError(titleProfanityError);
        }

        if (descriptionProfanityError) {
          trackEventByName(tracks.descriptionProfanityError.name, {
            ideaId,
            locale,
            projectId: !isNilOrError(project) ? project.id : null,
            profaneMessage: title,
            location: 'IdeasEditPage (citizen side)',
          });

          setDescriptionProfanityError(descriptionProfanityError);
        }
      }

      if (apiErrors && (apiErrors.image || apiErrors.file)) {
        setFileOrImageError(true);
      }

      setSubmitError(true);
    }

    setProcessing(false);
  };

  const onTitleChange = (title: string) => {
    setTitleMultiloc({ ...titleMultiloc, [locale]: title });
    setTitleProfanityError(false);
  };

  const onImageFileAdd = (imageFile: UploadFile[]) => {
    setImageFile([imageFile[0]]);
    setImageFileIsChanged(true);
  };

  const onImageFileRemove = () => {
    setImageFile([]);
    setImageFileIsChanged(true);
  };

  const onTagsChange = (selectedTopics: string[]) => {
    setSelectedTopics(selectedTopics);
  };

  const onAddressChange = (address: string) => {
    setAddress(address);
  };

  const onDescriptionChange = (description: string) => {
    setDescriptionMultiloc({
      ...descriptionMultiloc,
      [locale]: description,
    });

    setDescriptionProfanityError(false);
  };

  const onIdeaFilesChange = (ideaFiles: UploadFile[]) => {
    setIdeaFiles(ideaFiles);
  };

  const title = titleMultiloc?.[locale] || null;
  const description = descriptionMultiloc?.[locale] || null;
  const projectId = project.id;
  const inputTerm = getInputTerm(
    project.attributes.process_type,
    project,
    phases
  );

  return (
    <Container id="e2e-idea-edit-page">
      <IdeasEditMeta ideaId={ideaId} projectId={projectId} />
      <FormContainer>
        <Box
          width="100%"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          mt="52px"
        >
          <GoBackToIdeaPage idea={idea} />

          <Title>
            <FormattedMessage
              {...getInputTermMessage(inputTerm, {
                idea: messages.formTitle,
                option: messages.optionFormTitle,
                project: messages.projectFormTitle,
                question: messages.questionFormTitle,
                issue: messages.issueFormTitle,
                contribution: messages.contributionFormTitle,
              })}
            />
          </Title>
        </Box>

        <IdeaForm
          authorId={authorId}
          ideaId={ideaId}
          projectId={projectId}
          title={title}
          description={description}
          selectedTopics={selectedTopics}
          budget={budget}
          proposedBudget={proposedBudget}
          address={address || ''}
          imageFile={imageFile}
          ideaFiles={ideaFiles}
          onSubmit={handleIdeaFormOutput}
          remoteIdeaFiles={
            !isNilOrError(remoteIdeaFiles) ? remoteIdeaFiles : null
          }
          hasTitleProfanityError={titleProfanityError}
          hasDescriptionProfanityError={descriptionProfanityError}
          onImageFileAdd={onImageFileAdd}
          onImageFileRemove={onImageFileRemove}
          onTagsChange={onTagsChange}
          onTitleChange={onTitleChange}
          onDescriptionChange={onDescriptionChange}
          onAddressChange={onAddressChange}
          onIdeaFilesChange={onIdeaFilesChange}
        />

        <ButtonBarContainer>
          <IdeasEditButtonBar
            form="idea-form"
            submitError={submitError}
            processing={processing}
            fileOrImageError={fileOrImageError}
          />
        </ButtonBarContainer>
      </FormContainer>
    </Container>
  );
};

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  appConfiguration: <GetAppConfiguration />,
  remoteIdeaFiles: ({ params: { ideaId }, render }) => (
    <GetRemoteFiles resourceId={ideaId} resourceType="idea">
      {render}
    </GetRemoteFiles>
  ),
  idea: ({ params: { ideaId }, render }) => {
    return <GetIdeaById ideaId={ideaId}>{render}</GetIdeaById>;
  },
  project: ({ idea, render }) => {
    return (
      <GetProject
        projectId={
          !isNilOrError(idea) ? idea.relationships.project.data.id : null
        }
      >
        {render}
      </GetProject>
    );
  },
  phases: ({ project, render }) => {
    return (
      <GetPhases projectId={!isNilOrError(project) ? project.id : null}>
        {render}
      </GetPhases>
    );
  },
});

export default withRouter((inputProps: InputProps & WithRouterProps) => {
  const isDynamicIdeaFormEnabled = useFeatureFlag({
    name: 'dynamic_idea_form',
  });

  const project = useProject({ projectSlug: inputProps.params.slug });

  if (isUnauthorizedError(project)) {
    return <Unauthorized />;
  }

  if (isError(project)) {
    return <PageNotFound />;
  }

  if (isDynamicIdeaFormEnabled) {
    return <IdeasEditPageWithJSONForm {...inputProps} />;
  }

  return (
    <Data {...inputProps}>
      {(dataProps) => <IdeaEditPage {...inputProps} {...dataProps} />}
    </Data>
  );
});

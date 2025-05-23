import React, { useState, useEffect, useCallback } from 'react';

import { IconTooltip, Radio, Box } from '@citizenlab/cl2-component-library';
import { isEmpty, isEqual } from 'lodash-es';
import { CLErrors, Multiloc, UploadFile } from 'typings';

import useAdminPublication from 'api/admin_publications/useAdminPublication';
import useAddProjectFolderFile from 'api/project_folder_files/useAddProjectFolderFile';
import useProjectFolderFiles from 'api/project_folder_files/useProjectFolderFiles';
import {
  CARD_IMAGE_ASPECT_RATIO_HEIGHT,
  CARD_IMAGE_ASPECT_RATIO_WIDTH,
} from 'api/project_folder_images/types';
import useAddProjectFolderImage from 'api/project_folder_images/useAddProjectFolderImage';
import useDeleteProjectFolderImage from 'api/project_folder_images/useDeleteProjectFolderImage';
import useProjectFolderImages from 'api/project_folder_images/useProjectFolderImages';
import useUpdateProjectFolderImage from 'api/project_folder_images/useUpdateProjectFolderImage';
import useAddProjectFolder from 'api/project_folders/useAddProjectFolder';
import useProjectFolderById from 'api/project_folders/useProjectFolderById';
import useUpdateProjectFolder from 'api/project_folders/useUpdateProjectFolder';

import { useSyncFolderFiles } from 'hooks/files/useSyncFolderFiles';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import projectMessages from 'containers/Admin/projects/project/general/messages';

import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import HeaderBgUploader from 'components/admin/ProjectableHeaderBgUploader';
import {
  SectionField,
  Section,
  SubSectionTitle,
} from 'components/admin/Section';
import SlugInput from 'components/admin/SlugInput';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import FileUploader from 'components/UI/FileUploader';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import QuillMutilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import TextAreaMultilocWithLocaleSwitcher from 'components/UI/TextAreaMultilocWithLocaleSwitcher';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { isNilOrError, isError } from 'utils/helperUtils';
import { validateSlug } from 'utils/textUtils';

import messages from '../../messages';

import FolderCardImageTooltip from './FolderCardImageTooltip';
import FolderHeaderImageTooltip from './FolderHeaderImageTooltip';
import ProjectFolderCardImageDropzone from './ProjectFolderCardImageDropzone';

type IProjectFolderSubmitState =
  | 'disabled'
  | 'enabled'
  | 'error'
  | 'apiError'
  | 'success'
  | 'loading';

interface Props {
  mode: 'edit' | 'new';
  // This is wrong. Can be undefined if mode is 'new'
  projectFolderId: string;
}

const ProjectFolderForm = ({ mode, projectFolderId }: Props) => {
  /*
    ==============
    Resource hooks
    ==============
  */
  const { mutateAsync: addProjectFolderFile } = useAddProjectFolderFile();
  const syncProjectFolderFiles = useSyncFolderFiles();

  const { data: projectFolder } = useProjectFolderById(projectFolderId);
  const { data: projectFolderFilesRemote } = useProjectFolderFiles({
    projectFolderId,
  });

  const { data: projectFolderImagesRemote } = useProjectFolderImages({
    folderId: projectFolderId,
  });
  const { mutateAsync: addProjectFolderImage } = useAddProjectFolderImage();
  const { mutateAsync: updateProjectFolderImage } =
    useUpdateProjectFolderImage();
  const { mutateAsync: deleteProjectFolderImage } =
    useDeleteProjectFolderImage();

  const { data: adminPublication } = useAdminPublication(
    !isNilOrError(projectFolder)
      ? projectFolder.data.relationships.admin_publication.data?.id || null
      : null
  );
  const tenantLocales = useAppConfigurationLocales();
  const { mutate: addProjectFolder, isLoading: isAddProjectFolderLoading } =
    useAddProjectFolder();
  const { mutate: updateProjectFolder } = useUpdateProjectFolder();

  /*
    ==============
    State
    ==============
  */ const [errors, setErrors] = useState<CLErrors>({});
  const [titleMultiloc, setTitleMultiloc] = useState<Multiloc | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [showSlugErrorMessage, setShowSlugErrorMessage] =
    useState<boolean>(false);
  const [shortDescriptionMultiloc, setShortDescriptionMultiloc] =
    useState<Multiloc | null>(null);
  const [descriptionMultiloc, setDescriptionMultiloc] =
    useState<Multiloc | null>(null);
  const [headerBgBase64, setHeaderBgBase64] = useState<string | null>(null);
  const [headerImageAltText, setHeaderImageAltText] = useState<Multiloc>({});
  const [publicationStatus, setPublicationStatus] = useState<
    'published' | 'draft' | 'archived'
  >('published');
  const [changedHeaderBg, setChangedHeaderBg] = useState(false);
  const [folderCardImage, setFolderCardImage] = useState<UploadFile | null>(
    null
  );
  const [folderCardImageAltText, setFolderCardImageAltText] =
    useState<Multiloc>({});
  const [croppedFolderCardBase64, setCroppedFolderCardBase64] = useState<
    string | null
  >(null);
  const [folderCardImageToRemove, setFolderCardImageToRemove] =
    useState<UploadFile | null>(null);
  const [projectFolderFiles, setProjectFolderFiles] = useState<UploadFile[]>(
    []
  );
  const [projectFolderFilesToRemove, setProjectFolderFilesToRemove] = useState<
    string[]
  >([]);
  const [submitState, setSubmitState] =
    useState<IProjectFolderSubmitState>('disabled');

  /*
    ==============
    useEffect
    ==============
  */ useEffect(() => {
    (async () => {
      if (mode === 'edit' && !isNilOrError(projectFolder)) {
        setTitleMultiloc(projectFolder.data.attributes.title_multiloc);
        setSlug(projectFolder.data.attributes.slug);
        setDescriptionMultiloc(
          projectFolder.data.attributes.description_multiloc
        );
        setShortDescriptionMultiloc(
          projectFolder.data.attributes.description_preview_multiloc
        );
        setHeaderImageAltText(
          projectFolder.data.attributes.header_bg_alt_text_multiloc
        );
      }
    })();
  }, [mode, projectFolder]);

  useEffect(() => {
    if (mode === 'edit' && !isNilOrError(adminPublication)) {
      setPublicationStatus(adminPublication.data.attributes.publication_status);
    }
  }, [mode, adminPublication]);

  useEffect(() => {
    (async () => {
      if (mode === 'edit' && projectFolderImagesRemote) {
        for (const img of projectFolderImagesRemote.data) {
          const url = img.attributes.versions.large;
          const altTextValue = img.attributes.alt_text_multiloc;

          if (url) {
            const uploadFile = await convertUrlToUploadFile(url, img.id, null);
            if (uploadFile) {
              setFolderCardImage(uploadFile);
              setFolderCardImageAltText(altTextValue);
              break;
            }
          }
        }
      }
    })();
  }, [mode, projectFolderImagesRemote]);

  useEffect(() => {
    (async () => {
      if (mode === 'edit' && projectFolderFilesRemote) {
        const filePromises = projectFolderFilesRemote.data.map((file) =>
          convertUrlToUploadFile(
            file.attributes.file.url,
            file.id,
            file.attributes.name
          )
        );
        if (!isNilOrError(filePromises)) {
          const files = await Promise.all(filePromises);
          files.filter((file) => file);
          setProjectFolderFiles(files as UploadFile[]);
        }
      }
    })();
  }, [mode, projectFolderFilesRemote]);

  /*
    ==============
    Methods
    ==============
  */ const getHandler = useCallback(
    (setter: (value: any) => void) => (value: any) => {
      setSubmitState('enabled');
      setter(value);
    },
    []
  );

  const handleSlugOnChange = useCallback((slug: string) => {
    setSubmitState('enabled');
    setSlug(slug);

    if (validateSlug(slug)) {
      setShowSlugErrorMessage(false);
    } else {
      setShowSlugErrorMessage(true);
      setSubmitState('error');
    }
  }, []);

  const handleHeaderBgChange = useCallback((newImageBase64: string | null) => {
    setSubmitState('enabled');

    setChangedHeaderBg(true);
    setHeaderBgBase64(newImageBase64);
  }, []);

  const handleFolderCardImageOnRemove = (imageToRemove: UploadFile) => {
    setSubmitState('enabled');
    setFolderCardImage(null);
    setCroppedFolderCardBase64(null);
    if (imageToRemove.remote && imageToRemove.id) {
      setFolderCardImageToRemove(imageToRemove);
    }
  };

  const handleCroppedFolderCardImageOnRemove = () => {
    folderCardImage && handleFolderCardImageOnRemove(folderCardImage);
  };

  const handleProjectFolderFileOnAdd = useCallback((fileToAdd: UploadFile) => {
    setSubmitState('enabled');

    setProjectFolderFiles((previous) => {
      const isDuplicate = previous.some(
        (file) => file.base64 === fileToAdd.base64
      );

      return isDuplicate ? previous : [...previous, fileToAdd];
    });
  }, []);

  const handleFolderImageAltTextChange = (altTextMultiloc: Multiloc) => {
    setSubmitState('enabled');
    setFolderCardImageAltText(altTextMultiloc);
  };

  const handleHeaderImageAltTextChange = (altTextMultiloc: Multiloc) => {
    setSubmitState('enabled');
    setHeaderImageAltText(altTextMultiloc);
  };

  const handleProjectFolderFileOnRemove = useCallback(
    (fileToRemove: UploadFile) => {
      setSubmitState('enabled');
      if (fileToRemove.remote && fileToRemove.id) {
        setProjectFolderFilesToRemove((previous) => [
          ...previous,
          fileToRemove.id as string,
        ]);
      }
      setProjectFolderFiles((previous) =>
        previous.filter((item) => item.id !== fileToRemove.id)
      );
    },
    []
  );

  const handleFilesReorder = (updatedFiles: UploadFile[]) => {
    setProjectFolderFiles(updatedFiles);
    setSubmitState('enabled');
  };

  const validate = useCallback(() => {
    let valid = false;
    if (!isNilOrError(tenantLocales)) {
      // check that all fields have content for all tenant locales
      valid = tenantLocales.every(
        (locale) =>
          !isEmpty(titleMultiloc?.[locale]) &&
          !isEmpty(descriptionMultiloc?.[locale]) &&
          !isEmpty(shortDescriptionMultiloc?.[locale])
      );
    }
    if (!valid) {
      setSubmitState('error');
    }

    return valid;
  }, [
    tenantLocales,
    titleMultiloc,
    descriptionMultiloc,
    shortDescriptionMultiloc,
  ]);

  const saveForm = async () => {
    if (validate()) {
      setSubmitState('loading');
      if (mode === 'new') {
        try {
          if (
            titleMultiloc &&
            descriptionMultiloc &&
            shortDescriptionMultiloc
          ) {
            addProjectFolder(
              {
                title_multiloc: titleMultiloc,
                slug,
                description_multiloc: descriptionMultiloc,
                description_preview_multiloc: shortDescriptionMultiloc,
                header_bg: headerBgBase64,
                header_bg_alt_text_multiloc: headerImageAltText,
                admin_publication_attributes: {
                  publication_status: publicationStatus,
                },
              },
              {
                onSuccess: async (projectFolder) => {
                  if (
                    !isAddProjectFolderLoading &&
                    !isNilOrError(projectFolder)
                  ) {
                    const cardImageToAddPromise = croppedFolderCardBase64
                      ? addProjectFolderImage({
                          folderId: projectFolder.data.id,
                          base64: croppedFolderCardBase64,
                          alt_text_multiloc: folderCardImageAltText,
                        })
                      : null;

                    const filesToAddPromises = projectFolderFiles.map((file) =>
                      addProjectFolderFile({
                        projectFolderId: projectFolder.data.id,
                        file: file.base64,
                        name: file.name,
                      })
                    );

                    // TODO: Fix this the next time the file is edited.
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    (cardImageToAddPromise || filesToAddPromises) &&
                      (await Promise.all<any>([
                        cardImageToAddPromise,
                        ...filesToAddPromises,
                      ]));
                    clHistory.push(
                      `/admin/projects/folders/${projectFolder.data.id}`
                    );
                  }
                },
              }
            );
            setSubmitState('success');
          }
        } catch (errors) {
          setErrors(errors.errors);
          setSubmitState('apiError');
        }
      } else {
        try {
          if (
            titleMultiloc &&
            descriptionMultiloc &&
            shortDescriptionMultiloc &&
            !isNilOrError(projectFolder)
          ) {
            const cardToAddPromise = croppedFolderCardBase64
              ? addProjectFolderImage({
                  folderId: projectFolder.data.id,
                  base64: croppedFolderCardBase64,
                  alt_text_multiloc: folderCardImageAltText,
                })
              : null;
            const cardToEditPromise =
              folderCardImage && folderCardImage.id
                ? updateProjectFolderImage({
                    imageId: folderCardImage.id,
                    folderId: projectFolder.data.id,
                    base64: folderCardImage.base64,
                    alt_text_multiloc: folderCardImageAltText,
                  })
                : null;
            const cardToRemovePromises =
              folderCardImageToRemove?.id &&
              deleteProjectFolderImage({
                folderId: projectFolderId,
                imageId: folderCardImageToRemove.id,
              });

            const initialFileOrdering = projectFolderFilesRemote?.data.reduce(
              (acc, file) => {
                if (file.id) {
                  acc[file.id] = file.attributes.ordering;
                }
                return acc;
              },
              {}
            );

            const folderFilesPromise = await syncProjectFolderFiles({
              projectFolderId,
              projectFolderFiles,
              filesToRemove: projectFolderFilesToRemove,
              fileOrdering: initialFileOrdering || {},
            });

            await Promise.all<any>([
              cardToAddPromise,
              cardToEditPromise,
              cardToRemovePromises,
              folderFilesPromise,
            ]);

            const changedTitleMultiloc = !isEqual(
              titleMultiloc,
              projectFolder.data.attributes.title_multiloc
            );
            const changedDescriptionMultiloc = !isEqual(
              descriptionMultiloc,
              projectFolder.data.attributes.description_multiloc
            );
            const changedShortDescriptionMultiloc = !isEqual(
              shortDescriptionMultiloc,
              projectFolder.data.attributes.description_preview_multiloc
            );
            const changedSlug = !isEqual(
              slug,
              projectFolder.data.attributes.slug
            );
            const changedPublicationStatus =
              isNilOrError(adminPublication) ||
              !isEqual(
                publicationStatus,
                adminPublication.data.attributes.publication_status
              );

            if (
              changedTitleMultiloc ||
              changedSlug ||
              changedDescriptionMultiloc ||
              changedShortDescriptionMultiloc ||
              changedHeaderBg ||
              changedPublicationStatus
            ) {
              updateProjectFolder(
                {
                  projectFolderId,
                  title_multiloc: changedTitleMultiloc
                    ? titleMultiloc
                    : undefined,
                  slug: changedSlug ? slug : undefined,
                  description_multiloc: changedDescriptionMultiloc
                    ? descriptionMultiloc
                    : undefined,
                  description_preview_multiloc: changedShortDescriptionMultiloc
                    ? shortDescriptionMultiloc
                    : undefined,
                  header_bg: changedHeaderBg ? headerBgBase64 : undefined,
                  header_bg_alt_text_multiloc: headerImageAltText,
                  admin_publication_attributes: {
                    publication_status: publicationStatus,
                  },
                },
                {
                  onError: async () => {
                    setSubmitState('apiError');
                  },
                  onSuccess: async () => {
                    setSubmitState('success');
                  },
                }
              );
            }
            setProjectFolderFilesToRemove([]);
            setSubmitState('success');
          } else {
            setSubmitState('apiError');
          }
        } catch (errors) {
          setErrors(errors.errors);
          setSubmitState('apiError');
        }
      }
    }
  };

  if (isError(projectFolder)) {
    return null;
  }

  const folderCardImageShouldBeSaved = folderCardImage
    ? !folderCardImage.remote
    : false;

  return (
    <form onSubmit={saveForm}>
      <Section>
        <SectionField>
          <SubSectionTitle>
            <FormattedMessage {...messages.statusLabel} />
            <IconTooltip
              content={
                <FormattedMessage {...messages.publicationStatusTooltip} />
              }
            />
          </SubSectionTitle>
          <Radio
            onChange={getHandler(setPublicationStatus)}
            currentValue={publicationStatus}
            value="draft"
            name="projectstatus"
            id="projecstatus-draft"
            className="e2e-projecstatus-draft"
            label={<FormattedMessage {...messages.draftStatus} />}
          />
          <Radio
            onChange={getHandler(setPublicationStatus)}
            currentValue={publicationStatus}
            value="published"
            name="projectstatus"
            id="projecstatus-published"
            className="e2e-projecstatus-published"
            label={<FormattedMessage {...messages.publishedStatus} />}
          />
          <Radio
            onChange={getHandler(setPublicationStatus)}
            currentValue={publicationStatus}
            value="archived"
            name="projectstatus"
            id="projecstatus-archived"
            className="e2e-projecstatus-archived"
            label={<FormattedMessage {...messages.archivedStatus} />}
          />
        </SectionField>
        <SectionField data-cy="e2e-project-folder-title">
          <SubSectionTitle>
            <FormattedMessage {...messages.folderName} />
          </SubSectionTitle>
          <InputMultilocWithLocaleSwitcher
            id="project-folder-title"
            valueMultiloc={titleMultiloc}
            type="text"
            onChange={getHandler(setTitleMultiloc)}
            label={<FormattedMessage {...messages.titleInputLabel} />}
          />
        </SectionField>

        {/* Only show this field when slug is already saved to folder (i.e. not when creating a new folder, which uses this form as well) */}
        {!isNilOrError(projectFolder) && slug && (
          <SectionField>
            <>
              <SubSectionTitle>
                <FormattedMessage {...messages.url} />
              </SubSectionTitle>
              <SlugInput
                slug={slug}
                pathnameWithoutSlug={'folders'}
                apiErrors={errors}
                showSlugErrorMessage={showSlugErrorMessage}
                onSlugChange={handleSlugOnChange}
                showSlugChangedWarning={
                  slug !== projectFolder.data.attributes.slug
                }
              />
            </>
          </SectionField>
        )}
        <SectionField data-cy="e2e-project-folder-short-description">
          <SubSectionTitle>
            <FormattedMessage {...messages.folderDescriptions} />
          </SubSectionTitle>
          <Box mb="35px">
            <TextAreaMultilocWithLocaleSwitcher
              data-cy="e2e-project-folder-short-description"
              valueMultiloc={shortDescriptionMultiloc}
              name="textAreaMultiloc"
              onChange={getHandler(setShortDescriptionMultiloc)}
              label={
                <FormattedMessage {...messages.shortDescriptionInputLabel} />
              }
              labelTooltipText={
                <FormattedMessage
                  {...messages.shortDescriptionInputLabelTooltip}
                />
              }
            />
          </Box>
          <Box data-cy="e2e-project-folder-description">
            <QuillMutilocWithLocaleSwitcher
              id="description"
              valueMultiloc={descriptionMultiloc}
              onChange={getHandler(setDescriptionMultiloc)}
              label={<FormattedMessage {...messages.descriptionInputLabel} />}
              withCTAButton
            />
          </Box>
        </SectionField>

        <SectionField>
          <SubSectionTitle>
            <FormattedMessage {...messages.headerImageInputLabel} />
            <FolderHeaderImageTooltip />
          </SubSectionTitle>
          <HeaderBgUploader
            imageUrl={projectFolder?.data.attributes.header_bg?.large}
            onImageChange={handleHeaderBgChange}
            onHeaderImageAltTextChange={handleHeaderImageAltTextChange}
            headerImageAltText={headerImageAltText}
          />
        </SectionField>

        <SectionField>
          <SubSectionTitle>
            <FormattedMessage {...messages.projectFolderCardImageLabel} />
            <FolderCardImageTooltip />
          </SubSectionTitle>
          {folderCardImageShouldBeSaved ? (
            <Box display="flex" flexDirection="column" gap="8px">
              <ImageCropperContainer
                image={folderCardImage}
                onComplete={getHandler(setCroppedFolderCardBase64)}
                aspectRatioWidth={CARD_IMAGE_ASPECT_RATIO_WIDTH}
                aspectRatioHeight={CARD_IMAGE_ASPECT_RATIO_HEIGHT}
                onRemove={handleCroppedFolderCardImageOnRemove}
              />
            </Box>
          ) : (
            <ProjectFolderCardImageDropzone
              images={folderCardImage && [folderCardImage]}
              onAddImage={getHandler((cards: UploadFile[]) => {
                setFolderCardImage(cards[0]);
                if (cards[0]?.base64) {
                  setCroppedFolderCardBase64(cards[0].base64);
                }
              })}
              onRemoveImage={handleFolderCardImageOnRemove}
            />
          )}
        </SectionField>
        {folderCardImage && (
          <SectionField>
            <SubSectionTitle>
              <FormattedMessage {...messages.folderImageAltTextTitle} />
              <IconTooltip
                content={
                  <FormattedMessage
                    {...projectMessages.projectImageAltTextTooltip}
                  />
                }
              />
            </SubSectionTitle>
            <InputMultilocWithLocaleSwitcher
              type="text"
              valueMultiloc={folderCardImageAltText}
              label={<FormattedMessage {...projectMessages.altText} />}
              onChange={handleFolderImageAltTextChange}
            />
          </SectionField>
        )}
        <SectionField>
          <SubSectionTitle>
            <FormattedMessage {...messages.fileUploadLabel} />
            <IconTooltip
              content={
                <FormattedMessage {...messages.fileUploadLabelTooltip} />
              }
            />
          </SubSectionTitle>
          <FileUploader
            id="project-folder-form-file-uploader"
            onFileAdd={handleProjectFolderFileOnAdd}
            onFileRemove={handleProjectFolderFileOnRemove}
            files={projectFolderFiles}
            onFileReorder={handleFilesReorder}
            enableDragAndDrop
            multiple
          />
        </SectionField>
        <SubmitWrapper
          loading={submitState === 'loading'}
          status={
            submitState === 'loading'
              ? 'disabled'
              : submitState === 'apiError'
              ? 'error'
              : submitState
          }
          onClick={saveForm}
          messages={{
            buttonSave: messages.save,
            buttonSuccess: messages.saveSuccess,
            messageError:
              submitState === 'apiError'
                ? messages.saveErrorMessage
                : tenantLocales && tenantLocales.length > 1
                ? messages.multilocError
                : messages.textFieldsError,
            messageSuccess: messages.saveSuccessMessage,
          }}
        />
      </Section>
    </form>
  );
};

export default ProjectFolderForm;

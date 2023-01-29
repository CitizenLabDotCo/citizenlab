import React, { useState, useEffect, useCallback } from 'react';
import clHistory from 'utils/cl-router/history';
import { isEmpty, isEqual } from 'lodash-es';
import { CLErrors, Multiloc, UploadFile } from 'typings';
import { isNilOrError, isError } from 'utils/helperUtils';
import { addProjectFolder, updateProjectFolder } from 'services/projectFolders';
import {
  addProjectFolderImage,
  deleteProjectFolderImage,
} from 'services/projectFolderImages';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import useProjectFolderImages from 'hooks/useProjectFolderImages';
import useProjectFolder from 'hooks/useProjectFolder';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import {
  SectionField,
  Section,
  SubSectionTitle,
} from 'components/admin/Section';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import TextAreaMultilocWithLocaleSwitcher from 'components/UI/TextAreaMultilocWithLocaleSwitcher';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import QuillMutilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import { IconTooltip, Radio, Box } from '@citizenlab/cl2-component-library';
import FileUploader from 'components/UI/FileUploader';
import {
  addProjectFolderFile,
  deleteProjectFolderFile,
} from 'services/projectFolderFiles';
import useProjectFolderFiles from 'hooks/useProjectFolderFiles';
import useAdminPublication from 'hooks/useAdminPublication';
import SlugInput from 'components/admin/SlugInput';
import { validateSlug } from 'utils/textUtils';
import HeaderBgUploader from 'components/admin/ProjectableHeaderBgUploader';

interface Props {
  mode: 'edit' | 'new';
  projectFolderId: string;
}

const ProjectFolderForm = ({ mode, projectFolderId }: Props) => {
  const projectFolder = useProjectFolder({ projectFolderId });
  const projectFolderFilesRemote = useProjectFolderFiles(projectFolderId);
  const projectFolderImagesRemote = useProjectFolderImages(projectFolderId);
  const adminPublication = useAdminPublication(
    !isNilOrError(projectFolder)
      ? projectFolder.relationships.admin_publication.data?.id || null
      : null
  );

  useEffect(() => {
    (async () => {
      if (mode === 'edit' && !isNilOrError(projectFolder)) {
        setTitleMultiloc(projectFolder.attributes.title_multiloc);
        setSlug(projectFolder.attributes.slug);
        setDescriptionMultiloc(projectFolder.attributes.description_multiloc);
        setShortDescriptionMultiloc(
          projectFolder.attributes.description_preview_multiloc
        );
      }
    })();
  }, [mode, projectFolder]);

  useEffect(() => {
    if (mode === 'edit' && !isNilOrError(adminPublication)) {
      setPublicationStatus(adminPublication.attributes.publication_status);
    }
  }, [mode, adminPublication]);

  useEffect(() => {
    (async () => {
      if (mode === 'edit' && !isNilOrError(projectFolderImagesRemote)) {
        const imagePromises = projectFolderImagesRemote.data.map((img) =>
          img.attributes.versions.large
            ? convertUrlToUploadFile(
                img.attributes.versions.large,
                img.id,
                null
              )
            : new Promise<null>((resolve) => resolve(null))
        );
        const images = await Promise.all(imagePromises);
        images.filter((img) => img);
        setProjectFolderImages(images as UploadFile[]);
      }
    })();
  }, [mode, projectFolderImagesRemote]);

  useEffect(() => {
    (async () => {
      if (mode === 'edit' && !isNilOrError(projectFolderFilesRemote)) {
        const filePromises = projectFolderFilesRemote.data.map((file) =>
          convertUrlToUploadFile(
            file.attributes.file.url,
            file.id,
            file.attributes.name
          )
        );
        const files = await Promise.all(filePromises);
        files.filter((file) => file);
        setProjectFolderFiles(files as UploadFile[]);
      }
    })();
  }, [mode, projectFolderFilesRemote]);

  // input handling

  const [errors, setErrors] = useState<CLErrors>({});
  const [titleMultiloc, setTitleMultiloc] = useState<Multiloc | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [showSlugErrorMessage, setShowSlugErrorMessage] =
    useState<boolean>(false);
  const [shortDescriptionMultiloc, setShortDescriptionMultiloc] =
    useState<Multiloc | null>(null);
  const [descriptionMultiloc, setDescriptionMultiloc] =
    useState<Multiloc | null>(null);
  const [headerBgBase64, setHeaderBgBase64] = useState<string | null>(null);
  const [publicationStatus, setPublicationStatus] = useState<
    'published' | 'draft' | 'archived'
  >('published');
  const [changedHeaderBg, setChangedHeaderBg] = useState(false);
  const [projectFolderImages, setProjectFolderImages] = useState<UploadFile[]>(
    []
  );
  const [projectFolderImagesToRemove, setProjectFolderImagesToRemove] =
    useState<string[]>([]);
  const [projectFolderFiles, setProjectFolderFiles] = useState<UploadFile[]>(
    []
  );
  const [projectFolderFilesToRemove, setProjectFolderFilesToRemove] = useState<
    string[]
  >([]);

  const getHandler = useCallback(
    (setter: (value: any) => void) => (value: any) => {
      setStatus('enabled');
      setter(value);
    },
    []
  );

  const handleSlugOnChange = useCallback((slug: string) => {
    setStatus('enabled');
    setSlug(slug);

    if (validateSlug(slug)) {
      setShowSlugErrorMessage(false);
    } else {
      setShowSlugErrorMessage(true);
      setStatus('error');
    }
  }, []);

  const handleHeaderBgChange = useCallback((newImageBase64: string | null) => {
    setStatus('enabled');

    setChangedHeaderBg(true);
    setHeaderBgBase64(newImageBase64);
  }, []);

  const handleProjectFolderImageOnRemove = useCallback(
    (imageToRemove: UploadFile) => {
      setStatus('enabled');

      if (imageToRemove.remote && imageToRemove.id) {
        setProjectFolderImagesToRemove((previous) => {
          return [...previous, imageToRemove.id as string];
        });
      }

      setProjectFolderImages((previous) => {
        return previous.filter(
          (image) => image.base64 !== imageToRemove.base64
        );
      });
    },
    []
  );

  const handleProjectFolderFileOnAdd = useCallback((fileToAdd: UploadFile) => {
    setStatus('enabled');

    setProjectFolderFiles((previous) => {
      const isDuplicate = previous.some(
        (file) => file.base64 === fileToAdd.base64
      );

      return isDuplicate ? previous : [...previous, fileToAdd];
    });
  }, []);

  const handleProjectFolderFileOnRemove = useCallback(
    (fileToRemove: UploadFile) => {
      setStatus('enabled');
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

  // form status
  const [status, setStatus] = useState<
    'enabled' | 'error' | 'apiError' | 'success' | 'disabled' | 'loading'
  >('disabled');

  // validation
  const tenantLocales = useAppConfigurationLocales();

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
      setStatus('error');
    }

    return valid;
  }, [
    tenantLocales,
    titleMultiloc,
    descriptionMultiloc,
    shortDescriptionMultiloc,
  ]);

  // form submission
  const onSubmit = async () => {
    if (validate()) {
      setStatus('loading');
      if (mode === 'new') {
        try {
          if (
            titleMultiloc &&
            descriptionMultiloc &&
            shortDescriptionMultiloc
          ) {
            const projectFolder = await addProjectFolder({
              title_multiloc: titleMultiloc,
              slug,
              description_multiloc: descriptionMultiloc,
              description_preview_multiloc: shortDescriptionMultiloc,
              header_bg: headerBgBase64,
              admin_publication_attributes: {
                publication_status: publicationStatus,
              },
            });
            if (!isNilOrError(projectFolder)) {
              const imagesToAddPromises = projectFolderImages.map((file) =>
                addProjectFolderImage(projectFolder.id, file.base64)
              );
              const filesToAddPromises = projectFolderFiles.map((file) =>
                addProjectFolderFile(projectFolder.id, file.base64, file.name)
              );

              (imagesToAddPromises || filesToAddPromises) &&
                (await Promise.all<any>([
                  ...imagesToAddPromises,
                  ...filesToAddPromises,
                ]));
              clHistory.push(`/admin/projects/folders/${projectFolder.id}`);
            }
          }
        } catch (errors) {
          setErrors(errors.json.errors);
          setStatus('apiError');
        }
      } else {
        try {
          if (
            titleMultiloc &&
            descriptionMultiloc &&
            shortDescriptionMultiloc &&
            !isNilOrError(projectFolder)
          ) {
            const imagesToAddPromises = projectFolderImages
              .filter((file) => !file.remote)
              .map((file) =>
                addProjectFolderImage(projectFolderId as string, file.base64)
              );
            const imagesToRemovePromises = projectFolderImagesToRemove.map(
              (id) => deleteProjectFolderImage(projectFolderId as string, id)
            );
            const filesToAddPromises = projectFolderFiles
              .filter((file) => !file.remote)
              .map((file) =>
                addProjectFolderFile(
                  projectFolderId as string,
                  file.base64,
                  file.name
                )
              );
            const filesToRemovePromises = projectFolderFilesToRemove.map((id) =>
              deleteProjectFolderFile(projectFolderId as string, id)
            );

            imagesToAddPromises &&
              (await Promise.all<any>([
                ...imagesToAddPromises,
                ...imagesToRemovePromises,
                ...filesToAddPromises,
                ...filesToRemovePromises,
              ]));

            const changedTitleMultiloc = !isEqual(
              titleMultiloc,
              projectFolder.attributes.title_multiloc
            );
            const changedDescriptionMultiloc = !isEqual(
              descriptionMultiloc,
              projectFolder.attributes.description_multiloc
            );
            const changedShortDescriptionMultiloc = !isEqual(
              shortDescriptionMultiloc,
              projectFolder.attributes.description_preview_multiloc
            );
            const changedSlug = !isEqual(slug, projectFolder.attributes.slug);
            const changedPublicationStatus =
              isNilOrError(adminPublication) ||
              !isEqual(
                publicationStatus,
                adminPublication.attributes.publication_status
              );

            if (
              changedTitleMultiloc ||
              changedSlug ||
              changedDescriptionMultiloc ||
              changedShortDescriptionMultiloc ||
              changedHeaderBg ||
              changedPublicationStatus
            ) {
              const res = await updateProjectFolder(
                projectFolderId,
                {
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
                  admin_publication_attributes: {
                    publication_status: publicationStatus,
                  },
                },
                !isNilOrError(projectFolder)
                  ? projectFolder.relationships.admin_publication.data?.id
                  : undefined
              );

              if (isNilOrError(res)) {
                setStatus('apiError');
              }
            }
            setProjectFolderFilesToRemove([]);
            setStatus('success');
          } else {
            setStatus('apiError');
          }
        } catch (errors) {
          setErrors(errors.json.errors);
          setStatus('apiError');
        }
      }
    }
  };

  if (isError(projectFolder)) {
    return null;
  }

  return (
    <form onSubmit={onSubmit}>
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
                showSlugChangedWarning={slug !== projectFolder.attributes.slug}
              />
            </>
          </SectionField>
        )}
        <SectionField>
          <SubSectionTitle>
            <FormattedMessage {...messages.folderDescriptions} />
          </SubSectionTitle>
          <Box mb="35px" data-cy="e2e-project-folder-description">
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
          <HeaderBgUploader
            imageUrl={projectFolder?.attributes.header_bg?.large}
            onImageChange={handleHeaderBgChange}
          />
        </SectionField>

        <SectionField>
          <SubSectionTitle>
            <FormattedMessage {...messages.projectFolderCardImageLabel} />
            <IconTooltip
              content={
                <FormattedMessage {...messages.projectFolderCardImageTooltip} />
              }
            />
          </SubSectionTitle>
          <ImagesDropzone
            images={projectFolderImages}
            imagePreviewRatio={960 / 1440}
            maxImagePreviewWidth="240px"
            acceptedFileTypes={{
              'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
            }}
            onAdd={getHandler(setProjectFolderImages)}
            onRemove={handleProjectFolderImageOnRemove}
          />
        </SectionField>
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
          />
        </SectionField>
        <SubmitWrapper
          loading={status === 'loading'}
          status={
            status === 'loading'
              ? 'disabled'
              : status === 'apiError'
              ? 'error'
              : status
          }
          onClick={onSubmit}
          messages={{
            buttonSave: messages.save,
            buttonSuccess: messages.saveSuccess,
            messageError:
              status === 'apiError'
                ? messages.saveErrorMessage
                : messages.multilocError,
            messageSuccess: messages.saveSuccessMessage,
          }}
        />
      </Section>
    </form>
  );
};

export default ProjectFolderForm;

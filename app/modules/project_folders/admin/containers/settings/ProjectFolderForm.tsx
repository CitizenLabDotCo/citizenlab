import React, { useState, useEffect, useCallback } from 'react';
import clHistory from 'utils/cl-router/history';
import { isEmpty, isEqual } from 'lodash-es';

import { Multiloc, UploadFile } from 'typings';

import { isNilOrError } from 'utils/helperUtils';
import {
  addProjectFolder,
  updateProjectFolder,
} from 'modules/project_folders/services/projectFolders';
import {
  addProjectFolderImage,
  deleteProjectFolderImage,
} from 'modules/project_folders/services/projectFolderImages';
import { convertUrlToUploadFile } from 'utils/fileTools';
import useProjectFolderImages from 'modules/project_folders/hooks/useProjectFolderImages';
import useProjectFolder from 'modules/project_folders/hooks/useProjectFolder';
import useAppConfigurationLocales from 'hooks/useTenantLocales';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
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
import { IconTooltip, Radio } from 'cl2-component-library';
import FileUploader from 'components/UI/FileUploader';
import {
  addProjectFolderFile,
  deleteProjectFolderFile,
} from 'modules/project_folders/services/projectFolderFiles';
import useProjectFolderFiles from 'modules/project_folders/hooks/useProjectFolderFiles';
import useAdminPublication from 'hooks/useAdminPublication';

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
        setDescriptionMultiloc(projectFolder.attributes.description_multiloc);
        setShortDescriptionMultiloc(
          projectFolder.attributes.description_preview_multiloc
        );

        if (projectFolder.attributes?.header_bg?.large) {
          const headerFile = await convertUrlToUploadFile(
            projectFolder.attributes?.header_bg?.large,
            null,
            null
          );
          setHeaderBg(headerFile);
        }
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
  const [titleMultiloc, setTitleMultiloc] = useState<Multiloc | null>(null);
  const [
    shortDescriptionMultiloc,
    setShortDescriptionMultiloc,
  ] = useState<Multiloc | null>(null);
  const [
    descriptionMultiloc,
    setDescriptionMultiloc,
  ] = useState<Multiloc | null>(null);
  const [headerBg, setHeaderBg] = useState<UploadFile | null>(null);
  const [publicationStatus, setPublicationStatus] = useState<
    'published' | 'draft' | 'archived'
  >('published');
  const [changedHeaderBg, setChangedHeaderBg] = useState(false);
  const [projectFolderImages, setProjectFolderImages] = useState<UploadFile[]>(
    []
  );
  const [
    projectFolderImagesToRemove,
    setProjectFolderImagesToRemove,
  ] = useState<string[]>([]);
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

  const handleHeaderBgOnAdd = useCallback((newImage: UploadFile[]) => {
    setStatus('enabled');

    setChangedHeaderBg(true);
    setHeaderBg(newImage[0]);
  }, []);

  const handleHeaderBgOnRemove = useCallback(() => {
    setStatus('enabled');

    setChangedHeaderBg(true);
    setHeaderBg(null);
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
            const res = await addProjectFolder({
              title_multiloc: titleMultiloc,
              description_multiloc: descriptionMultiloc,
              description_preview_multiloc: shortDescriptionMultiloc,
              header_bg: headerBg?.base64,
              admin_publication_attributes: {
                publication_status: publicationStatus,
              },
            });
            if (!isNilOrError(res)) {
              const imagesToAddPromises = projectFolderImages.map((file) =>
                addProjectFolderImage(res.id, file.base64)
              );
              const filesToAddPromises = projectFolderFiles.map((file) =>
                addProjectFolderFile(res.id, file.base64, file.name)
              );

              (imagesToAddPromises || filesToAddPromises) &&
                (await Promise.all<any>([
                  ...imagesToAddPromises,
                  ...filesToAddPromises,
                ]));

              clHistory.push(`/admin/projects/folders/${res.id}`);
            }
          }
        } finally {
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
            const changedPublicationStatus =
              isNilOrError(adminPublication) ||
              !isEqual(
                publicationStatus,
                adminPublication.attributes.publication_status
              );

            if (
              changedTitleMultiloc ||
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
                  description_multiloc: changedDescriptionMultiloc
                    ? descriptionMultiloc
                    : undefined,
                  description_preview_multiloc: changedShortDescriptionMultiloc
                    ? shortDescriptionMultiloc
                    : undefined,
                  header_bg: changedHeaderBg ? headerBg?.base64 : undefined,
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
            setStatus('success');
          } else {
            setStatus('apiError');
          }
        } catch {
          setStatus('apiError');
        }
      }
    }
  };

  // ---- Rendering
  if (mode === 'edit' && isNilOrError(projectFolder)) return null;

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
        <SectionField>
          <InputMultilocWithLocaleSwitcher
            valueMultiloc={titleMultiloc}
            type="text"
            onChange={getHandler(setTitleMultiloc)}
            label={<FormattedMessage {...messages.titleInputLabel} />}
          />
        </SectionField>
        <SectionField>
          <TextAreaMultilocWithLocaleSwitcher
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
        </SectionField>
        <SectionField>
          <QuillMutilocWithLocaleSwitcher
            id="description"
            valueMultiloc={descriptionMultiloc}
            onChange={getHandler(setDescriptionMultiloc)}
            label={<FormattedMessage {...messages.descriptionInputLabel} />}
            withCTAButton
          />
        </SectionField>

        <SectionField key={'header_bg'}>
          <SubSectionTitle>
            <FormattedMessage {...messages.headerImageInputLabel} />
            <IconTooltip
              content={
                <FormattedMessage
                  {...messages.projectFolderHeaderImageLabelTooltip}
                />
              }
            />
          </SubSectionTitle>
          <ImagesDropzone
            acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
            maxNumberOfImages={1}
            maxImageFileSize={5000000}
            images={headerBg ? [headerBg] : null}
            imagePreviewRatio={250 / 1380}
            onAdd={handleHeaderBgOnAdd}
            onRemove={handleHeaderBgOnRemove}
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
            acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
            maxImageFileSize={5000000}
            maxNumberOfImages={1}
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

export default injectIntl(ProjectFolderForm);

import React, { useState, useEffect, useCallback } from 'react';
import { SectionField, Section } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { Multiloc, Locale, UploadFile } from 'typings';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import Label from 'components/UI/Label';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { addProjectFolder, updateProjectFolder } from 'services/projectFolders';
import clHistory from 'utils/cl-router/history';
import { convertUrlToUploadFile } from 'utils/fileTools';
import Input from 'components/UI/Input';
import TextArea from 'components/UI/TextArea';
import QuillEditor from 'components/UI/QuillEditor';
import { addProjectFolderImage, deleteProjectFolderImage } from 'services/projectFolderImages';
import useProjectFolderImages from 'hooks/useProjectFolderImages';
import useProjectFolder from 'hooks/useProjectFolder';
import useTenantLocales from 'hooks/useTenantLocales';
import { isEmpty, isEqual } from 'lodash-es';

interface Props {
  mode: 'edit' | 'new';
  projectFolderId: string;
}

const ProjectFolderForm = ({ mode, projectFolderId }: Props) => {

  const projectFolder = useProjectFolder({ projectFolderId });
  const projectFolderImagesRemote = useProjectFolderImages(projectFolderId);

  if (mode === 'edit') {
    useEffect(() => {
      (async function iife() {
        if (!isNilOrError(projectFolder)) {
          setTitleMultiloc(projectFolder.attributes.title_multiloc);
          setDescriptionMultiloc(projectFolder.attributes.description_multiloc);
          setShortDescriptionMultiloc(projectFolder.attributes.description_preview_multiloc);
          if (projectFolder.attributes ?.header_bg ?.large) {
            const headerFile = await convertUrlToUploadFile(projectFolder.attributes ?.header_bg ?.large, null, null);
            setHeaderBg(headerFile);
          }
          if (!isNilOrError(projectFolderImagesRemote)) {
            const imagePromises = projectFolderImagesRemote.data.map(img => img.attributes.versions.large ? convertUrlToUploadFile(img.attributes.versions.large, img.id, null) : new Promise<null>(resolve => resolve(null)));
            const images = await Promise.all(imagePromises);
            images.filter(img => img);
            setProjectFolderImages(images as UploadFile[]);
          }
        }
      }
      )();
    }, [projectFolder, projectFolderImagesRemote]);
  }

  // locale things
  const locale = useLocale();
  const safeLocale = isNilOrError(locale) ? null : locale;

  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(isNilOrError(locale) ? null : locale);

  // if user locale changes, we set the form selectedLocale to it (necessary as locale is initially undefined)
  useEffect(() => {
    setSelectedLocale(safeLocale);
  }, [safeLocale]);

  // input handling
  const [titleMultiloc, setTitleMultiloc] = useState<Multiloc | null>(null);
  const [shortDescriptionMultiloc, setShortDescriptionMultiloc] = useState<Multiloc | null>(null);
  const [descriptionMultiloc, setDescriptionMultiloc] = useState<Multiloc | null>(null);
  const [headerBg, setHeaderBg] = useState<UploadFile | null>(null);
  const [changedHeaderBg, setChangedHeaderBg] = useState(false);
  const [projectFolderImages, setProjectFolderImages] = useState<UploadFile[]>([]);
  const [projectFolderImagesToRemove, setProjectFolderImagesToRemove] = useState<string[]>([]);

  const handleHeaderBgOnAdd = (newImage: UploadFile[]) => {
    setStatus('enabled');

    setChangedHeaderBg(true);
    setHeaderBg(newImage[0]);
  };

  const handleHeaderBgOnRemove = () => {
    setStatus('enabled');

    setChangedHeaderBg(true);
    setHeaderBg(null);
  };
  const handleTitleChange = useCallback((newTitle: string) => {
    setStatus('enabled');
    selectedLocale && setTitleMultiloc(titleMultiloc => ({
      ...titleMultiloc,
      [selectedLocale]: newTitle
    }));
  }, [selectedLocale]);

  const handleDescriptionChange = useCallback((newDescription: string) => {
    setStatus('enabled');
    selectedLocale && setDescriptionMultiloc(descriptionMultiloc => ({
      ...descriptionMultiloc,
      [selectedLocale]: newDescription
    }));
  }, [selectedLocale]);

  const handleShortDescriptionChange = useCallback((newShortDescription: string) => {
    setStatus('enabled');
    selectedLocale && setShortDescriptionMultiloc({
      ...shortDescriptionMultiloc,
      [selectedLocale]: newShortDescription
    });
  }, [selectedLocale]);

  const handleProjectFolderImageOnAdd = (newImages: UploadFile[]) => {
    setStatus('enabled');
    setProjectFolderImages(newImages);
  };

  const handleProjectFolderImageOnRemove = (imageToRemove: UploadFile) => {
    setStatus('enabled');
    if (imageToRemove.remote && imageToRemove.id) {
      setProjectFolderImagesToRemove(previous => [...previous, imageToRemove.id as string]);
    }
    setProjectFolderImages(projectFolderImages => projectFolderImages.filter(image => image.base64 !== imageToRemove.base64));
  };

  // form status
  const [status, setStatus] = useState<'enabled' | 'error' | 'success' | 'disabled' | 'loading'>('disabled');

  // validation
  const tenantLocales = useTenantLocales();

  const validate = useCallback(() => {
    let valid = false;
    if (!isNilOrError(tenantLocales)) {
      // check that all fields have content for all tenant locales
      valid = tenantLocales.every(locale => !isEmpty(titleMultiloc ?.[locale]) && !isEmpty(descriptionMultiloc ?.[locale]) && !isEmpty(shortDescriptionMultiloc ?.[locale]));
    }
    if (!valid) {
      setStatus('error');
    }

    return valid;
  }, [tenantLocales, titleMultiloc, descriptionMultiloc, shortDescriptionMultiloc]);

  // form submission
  const onSubmit = async () => {
    if (validate()) {
      setStatus('loading');
      if (mode === 'new') {
        try {
          if (titleMultiloc && descriptionMultiloc && shortDescriptionMultiloc) {
            const res = await addProjectFolder({
              title_multiloc: titleMultiloc,
              description_multiloc: descriptionMultiloc,
              description_preview_multiloc: shortDescriptionMultiloc,
              header_bg: headerBg ?.base64
              });
            if (!isNilOrError(res)) {
              clHistory.push(`/admin/projects/folders/${res.id}`);
            }
          }
        }
        finally { setStatus('error'); }
      } else {
        try {
          if (titleMultiloc && descriptionMultiloc && shortDescriptionMultiloc && !isNilOrError(projectFolder)) {
            const imagesToAddPromises = projectFolderImages.filter(file => !file.remote).map(file => addProjectFolderImage(projectFolderId as string, file.base64));
            const imagesToRemovePromises = projectFolderImagesToRemove.map(id => deleteProjectFolderImage(projectFolderId as string, id));

            imagesToAddPromises && await Promise.all<any>([...imagesToAddPromises, ...imagesToRemovePromises]);

            const changedTitleMultiloc = !isEqual(titleMultiloc, projectFolder.attributes.title_multiloc);
            const changedDescriptionMultiloc = !isEqual(descriptionMultiloc, projectFolder.attributes.description_multiloc);
            const changedShortDescriptionMultiloc = !isEqual(shortDescriptionMultiloc, projectFolder.attributes.description_preview_multiloc);

            if (changedTitleMultiloc || changedDescriptionMultiloc || changedShortDescriptionMultiloc || changedHeaderBg) {
              const res = await updateProjectFolder(projectFolderId, {
                title_multiloc: changedTitleMultiloc ? titleMultiloc : undefined,
                description_multiloc: changedDescriptionMultiloc ? descriptionMultiloc : undefined,
                description_preview_multiloc: changedShortDescriptionMultiloc ? shortDescriptionMultiloc : undefined,
                header_bg: changedHeaderBg ? headerBg ?.base64 : undefined
              });

              if (isNilOrError(res)) {
                setStatus('error');
              }
            }
            setStatus('success');
          } else {
            setStatus('error');
          }
        } catch {
          setStatus('error');
        }
      }
    }
  };

  // ---- Rendering
  if (!selectedLocale) return null;
  if (mode === 'edit' && isNilOrError(projectFolder)) return null;

  return (
    <form onSubmit={onSubmit}>
      <Section>
        <SectionField>
          <FormLocaleSwitcher selectedLocale={selectedLocale} onLocaleChange={setSelectedLocale} />
        </SectionField>
        <SectionField>
          <Input
            value={titleMultiloc ?.[selectedLocale]}
            type="text"
            onChange={handleTitleChange}
            label={<FormattedMessage {...messages.titleInputLabel} />}
          />
        </SectionField>
        <SectionField>
          <TextArea
            value={shortDescriptionMultiloc ?.[selectedLocale]}
            name="textAreaMultiloc"
            onChange={handleShortDescriptionChange}
            label={<FormattedMessage {...messages.shortDescriptionInputLabel} />}
            labelTooltipText={<FormattedMessage {...messages.shortDescriptionInputLabelTooltip} />}
          />
        </SectionField>
        <SectionField>
          <QuillEditor
            id="description"
            value={descriptionMultiloc ?.[selectedLocale]}
            onChange={handleDescriptionChange}
            label={<FormattedMessage {...messages.descriptionInputLabel} />}
          />
        </SectionField>

        <SectionField key={'header_bg'}>
          <Label>
            <FormattedMessage {...messages.headerImageInputLabel} />
          </Label>
          <ImagesDropzone
            acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
            maxNumberOfImages={1}
            maxImageFileSize={5000000}
            images={headerBg ? [headerBg] : null}
            imagePreviewRatio={120 / 480}
            maxImagePreviewWidth="500px"
            onAdd={handleHeaderBgOnAdd}
            onRemove={handleHeaderBgOnRemove}
          />
        </SectionField>

        <SectionField>
          <Label>
            <FormattedMessage {...messages.projectFolderImagesInputLabel} />
          </Label>
          <ImagesDropzone
            images={projectFolderImages}
            imagePreviewRatio={1}
            maxImagePreviewWidth="160px"
            acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
            maxImageFileSize={5000000}
            maxNumberOfImages={5}
            onAdd={handleProjectFolderImageOnAdd}
            onRemove={handleProjectFolderImageOnRemove}
          />
        </SectionField>
        <SubmitWrapper
          loading={status === 'loading'}
          status={status === 'loading' ? 'disabled' : status}
          onClick={onSubmit}
          messages={{
            buttonSave: messages.save,
            buttonSuccess: messages.saveSuccess,
            messageError: messages.saveErrorMessage,
            messageSuccess: messages.saveSuccessMessage,
          }}
        />
      </Section>
    </form>
  );
};

export default ProjectFolderForm;

import React, { useState, useEffect } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import styled from 'styled-components';
import { SectionTitle, SectionSubtitle, SectionField, Section } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { Multiloc, Locale, UploadFile } from 'typings';
import InputMultiloc from 'components/UI/InputMultiloc';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import TextAreaMultiloc from 'components/UI/TextAreaMultiloc';
import QuillMultiloc from 'components/UI/QuillEditor/QuillMultiloc';
import IconTooltip from 'components/UI/IconTooltip';
import Label from 'components/UI/Label';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import { addProjectFolder } from 'services/projectFolders';
import clHistory from 'utils/cl-router/history';
import GoBackButton from 'components/UI/GoBackButton';
import GetProjectFolder, { GetProjectFolderChildProps } from 'resources/GetProjectFolder';
import { adopt } from 'react-adopt';
import { convertUrlToUploadFile } from 'utils/fileTools';

const Container = styled.div<({ mode: 'edit' | 'new' }) >`
  display: flex;
  flex-direction: column;
  ${({ mode }) => mode === 'new' ? `
    background: #fff;
    border-radius: 3px;
    border: 1px solid #e0e0e0;
    box-sizing: border-box;
    padding: 3.5rem 4rem;
    margin-bottom: 60px;
  ` : ''}
`;

const goBack = () => {
  clHistory.push('/admin/projects');
};

interface DataProps {
  projectFolder: GetProjectFolderChildProps;
}

const FolderSettings = ({ params, projectFolder }: WithRouterProps & DataProps) => {
  const { projectFolderId } = params;
  const mode = projectFolderId ? 'edit' : 'new';

  if (mode === 'edit') { // Should handle data loading
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
        }
      }
      )();
    }, [projectFolder]);
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

  const handleHeaderBgOnAdd = (newImage: UploadFile[]) => {
    setHeaderBg(newImage[0]);
  };

  const handleHeaderBgOnRemove = () => {
    setHeaderBg(null);
  };

  // form status
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<'enabled' | 'error' | 'success'>('enabled');

  // form submission
  const onSubmit = async () => {
    setLoading(true);
    try {
      if (titleMultiloc && descriptionMultiloc && shortDescriptionMultiloc) {
        const res = await addProjectFolder({
          title_multiloc: titleMultiloc,
          description_multiloc: descriptionMultiloc,
          description_preview_multiloc: shortDescriptionMultiloc,
          header_bg: headerBg ?.base64
      });
        if (isNilOrError(res)) {
          setStatus('error');
        } else {
          clHistory.push(`/admin/projects/folders/${res.id}`);
        }
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
    setLoading(false);

    console.log(titleMultiloc, shortDescriptionMultiloc, descriptionMultiloc, headerBg);
  };

  if (!selectedLocale) return null;
  if (mode === 'edit' && isNilOrError(projectFolder)) return null;

  return (
    <Container mode={mode}>
      {mode === 'edit' ?
        <>
          <SectionTitle>
            {<FormattedMessage {...messages.titleSettingsTab} />}
          </SectionTitle>
          <SectionSubtitle>
            <FormattedMessage {...messages.subtitleSettingsTab} />
          </SectionSubtitle>
        </>
        :
        <>
          <GoBackButton onClick={goBack} />
          <SectionTitle >
            {<FormattedMessage {...messages.titleNewFolder} />}
          </SectionTitle >
          <SectionSubtitle>
            <FormattedMessage {...messages.subtitleNewFolder} />
          </SectionSubtitle>
        </>
      }
      <form onSubmit={onSubmit}>
        <Section>
          <SectionField>
            <FormLocaleSwitcher selectedLocale={selectedLocale} onLocaleChange={setSelectedLocale} />
          </SectionField>
          <SectionField>
            <InputMultiloc
              valueMultiloc={titleMultiloc}
              type="text"
              onChange={setTitleMultiloc}
              selectedLocale={selectedLocale}
              label={<FormattedMessage {...messages.titleInputLabel} />}
            />
          </SectionField>
          <SectionField>
            <TextAreaMultiloc
              valueMultiloc={shortDescriptionMultiloc}
              name="textAreaMultiloc"
              onChange={setShortDescriptionMultiloc}
              selectedLocale={selectedLocale}
              label={<FormattedMessage {...messages.shortDescriptionInputLabel} />}
              labelTooltip={<IconTooltip content={<FormattedMessage {...messages.shortDescriptionInputLabelTooltip} />} />}
            />
          </SectionField>
          <SectionField>
            <QuillMultiloc
              id="description"
              valueMultiloc={descriptionMultiloc}
              onChangeMultiloc={setDescriptionMultiloc}
              selectedLocale={selectedLocale}
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
              imagePreviewRatio={480 / 1440}
              maxImagePreviewWidth="500px"
              onAdd={handleHeaderBgOnAdd}
              onRemove={handleHeaderBgOnRemove}
            // errorMessage={headerError}
            />
          </SectionField>
          <SubmitWrapper
            loading={loading}
            status={status}
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
    </Container>
  );
};

const FolderSettingsWithHoCs = withRouter(FolderSettings);

const Data = adopt<DataProps, WithRouterProps>({
  projectFolder: ({ params, render }) => <GetProjectFolder projectFolderId={params.projectFolderId}>{render}</GetProjectFolder>,
});

export default (inputProps: WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <FolderSettingsWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);

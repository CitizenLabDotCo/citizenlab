import React, { Suspense, lazy } from 'react';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// typings
import { Multiloc, UploadFile } from 'typings';

// form
import { FormProvider, useForm } from 'react-hook-form';
import { SectionField } from 'components/admin/Section';
import Input from 'components/HookForm/Input';
import Feedback from 'components/HookForm/Feedback';
import { yupResolver } from '@hookform/resolvers/yup';
import { object } from 'yup';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';
import {
  FormSection,
  FormSectionTitle,
  FormLabel,
} from 'components/UI/FormComponents';
// components
import Button from 'components/UI/Button';
import { Box, Text } from '@citizenlab/cl2-component-library';
import TopicsPicker from 'components/UI/TopicsPicker';

// intl
import messages from '../messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import Warning from 'components/UI/Warning';
import QuillEditor from 'components/HookForm/QuillEditor';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import FileUploader from 'components/HookForm/FileUploader';
const ProfileVisibilityFormSection = lazy(
  () => import('./ProfileVisibilityFormSection')
);
const CosponsorsFormSection = lazy(() => import('./CosponsorsFormSection'));

const StyledFormSection = styled(FormSection)`
  ${media.phone`
    padding-left: 18px;
    padding-right: 18px;
  `}
`;

export interface FormValues {
  title_multiloc: Multiloc | undefined | null;
  body_multiloc: Multiloc | undefined | null;
  topic_ids: string[];
  position: string | undefined | null;
  cosponsor_ids: string[];
  local_initiative_files: UploadFile[] | null;
}

type PageFormProps = {
  onSubmit: (formValues: FormValues) => void | Promise<void>;
  defaultValues?: FormValues;
};

const mapsLoaded = window.googleMaps;

const InitiativeForm = ({ onSubmit, defaultValues }: PageFormProps) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const schema = object({
    // title_multiloc: validateMultilocForEveryLocale(
    //   formatMessage(messages.emptyTitleError)
    // ),
    // body_multiloc: validateMultilocForEveryLocale(
    //   formatMessage(messages.emptyTitleError)
    // ),
    // topic_ids: validateMultilocForEveryLocale(
    //   formatMessage(messages.emptyTitleError)
    // ),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  if (isNilOrError(locale)) return null;

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onFormSubmit)}
        data-testid="initiativeForm"
      >
        <StyledFormSection>
          <FormSectionTitle message={messages.formGeneralSectionTitle} />

          <SectionField id="e2e-initiative-form-title-section">
            <FormLabel
              htmlFor="e2e-initiative-title-input"
              labelMessage={messages.titleLabel}
              subtextMessage={messages.titleLabelSubtext2}
            >
              <Input
                name="title_multiloc"
                type="text"
                id="e2e-initiative-title-input"
                // onChange={handleTitleOnChange}
                // onBlur={onBlur('title_multiloc')}
                autocomplete="off"
                maxCharCount={72}
              />
              {/* {touched.title_multiloc && errors.title_multiloc ? (
                <Error
                  id="e2e-proposal-title-error"
                  text={formatMessage(errors.title_multiloc.message)}
                />
              ) : (
                apiErrors &&
                apiErrors.title_multiloc && (
                  <Error apiErrors={apiErrors.title_multiloc} />
                )
              )} */}
            </FormLabel>
            {/* {titleProfanityError && (
              <Error
                text={
                  <FormattedMessage
                    {...messages.profanityError}
                    values={{
                      guidelinesLink: (
                        <Link to="/pages/faq" target="_blank">
                          {formatMessage(messages.guidelinesLinkText)}
                        </Link>
                      ),
                    }}
                  />
                }
              />
            )} */}
          </SectionField>

          <SectionField id="e2e-initiative-form-description-section">
            <FormLabel
              id="description-label-id"
              htmlFor="body"
              labelMessage={messages.descriptionLabel}
              subtextMessage={messages.descriptionLabelSubtext}
            />
            <QuillEditor
              // id="body"
              name="body_multiloc"
              locale={locale}
              noVideos
              noAlign
              // onChange={handleBodyOnChange}
              // onBlur={onBlur('body_multiloc')}
            />
            {/* {touched.body_multiloc && errors.body_multiloc ? (
              <Error text={formatMessage(errors.body_multiloc.message)} />
            ) : (
              apiErrors &&
              apiErrors.body_multiloc && (
                <Error apiErrors={apiErrors.body_multiloc} />
              )
            )}
            {descriptionProfanityError && (
              <Error
                text={
                  <FormattedMessage
                    {...messages.profanityError}
                    values={{
                      guidelinesLink: (
                        <Link to="/pages/faq" target="_blank">
                          {formatMessage(messages.guidelinesLinkText)}
                        </Link>
                      ),
                    }}
                  />
                }
              />
            )} */}
          </SectionField>
        </StyledFormSection>
        <StyledFormSection>
          <FormSectionTitle message={messages.formDetailsSectionTitle} />
          <SectionField aria-live="polite">
            <FormLabel
              labelMessage={messages.topicsLabel}
              subtextMessage={messages.topicsLabelDescription}
              htmlFor="field-topic-multiple-picker"
            />
            {/* <TopicsPicker
              id="field-topic-multiple-picker"
              selectedTopicIds={topic_ids}
              onChange={changeAndSaveTopics}
              availableTopics={availableTopics}
            /> */}
            {/* {touched.topic_ids && errors.topic_ids ? (
              <Error text={formatMessage(errors.topic_ids.message)} />
            ) : (
              apiErrors &&
              apiErrors.topic_ids && <Error apiErrors={apiErrors.topic_ids} />
            )} */}
          </SectionField>
          {mapsLoaded && (
            <SectionField>
              <FormLabel
                labelMessage={messages.locationLabel}
                subtextMessage={messages.locationLabelSubtext}
                htmlFor="initiative-location-picker"
                optional
              >
                {/* <LocationInput
                  id="initiative-location-picker"
                  className="e2e-initiative-location-input"
                  value={position || ''}
                  onChange={onChangePosition}
                  onBlur={onBlur('position')}
                  placeholder={formatMessage(messages.locationPlaceholder)}
                /> */}
              </FormLabel>
            </SectionField>
          )}
        </StyledFormSection>
        <Suspense fallback={null}>
          <CosponsorsFormSection />
        </Suspense>
        <StyledFormSection>
          <FormSectionTitle message={messages.formAttachmentsSectionTitle} />
          <SectionField id="e2e-iniatiative-banner-dropzone">
            <FormLabel
              labelMessage={messages.bannerUploadLabel}
              subtextMessage={messages.bannerUploadLabelSubtext}
              htmlFor="initiative-banner-dropzone"
              optional
            />
            {/* <ImagesDropzone
            id="initiative-banner-dropzone"
            images={banner ? [banner] : null}
            imagePreviewRatio={360 / 1440}
            acceptedFileTypes={{
              'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
            }}
            onAdd={addBanner}
            onRemove={removeBanner}
          />
          {apiErrors && apiErrors.header_bg && (
            <Error apiErrors={apiErrors.header_bg} />
          )} */}
          </SectionField>
          <SectionField id="e2e-iniatiative-img-dropzone">
            <FormLabel
              labelMessage={messages.imageUploadLabel}
              subtextMessage={messages.imageUploadLabelSubtext}
              htmlFor="initiative-image-dropzone"
              optional
            />
            {/* <ImagesDropzone
            id="initiative-image-dropzone"
            images={image ? [image] : null}
            imagePreviewRatio={135 / 298}
            acceptedFileTypes={{
              'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
            }}
            onAdd={addImage}
            onRemove={removeImage}
          />
          {touched.image && errors.image && (
            <Error text={formatMessage(errors.image.message)} />
          )} */}
          </SectionField>
          <SectionField>
            <FormLabel
              labelMessage={messages.fileUploadLabel}
              subtextMessage={messages.fileUploadLabelSubtext}
              htmlFor="e2e-initiative-file-upload"
              optional
            >
              <FileUploader
                name="local_initiative_files"
                // id="e2e-initiative-file-upload"
                // onFileAdd={onAddFile}
                // onFileRemove={onRemoveFile}
                // files={files}
                // apiErrors={apiErrors}
              />
            </FormLabel>
          </SectionField>
        </StyledFormSection>
        <Suspense fallback={null}>
          {/* <ProfileVisibilityFormSection /> */}
        </Suspense>
      </form>
    </FormProvider>
  );
};

export default InitiativeForm;

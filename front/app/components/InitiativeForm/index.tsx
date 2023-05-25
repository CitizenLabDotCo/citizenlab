import * as React from 'react';
import { useEffect, useState } from 'react';

// utils
import { stripHtmlTags, isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import Link from 'utils/cl-router/Link';

// Components
import {
  FormSection,
  FormSectionTitle,
  FormLabel,
} from 'components/UI/FormComponents';
import { SectionField } from 'components/admin/Section';
import TopicsPicker from 'components/UI/TopicsPicker';
import { Box, Input, LocationInput } from '@citizenlab/cl2-component-library';
import QuillEditor from 'components/UI/QuillEditor';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import FileUploader from 'components/UI/FileUploader';
import Error from 'components/UI/Error';
import ProfileVisiblity from 'components/ProfileVisibility';

// intl
import messages from './messages';
import { MessageDescriptor, FormattedMessage, useIntl } from 'utils/cl-intl';

// typings
import { Multiloc, Locale, UploadFile } from 'typings';
import { ITopicData } from 'api/topics/types';
import { FormSubmitFooter } from './SubmitFooter';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  margin-bottom: 100px;
`;

const StyledFormSection = styled(FormSection)`
  ${media.phone`
    padding-left: 18px;
    padding-right: 18px;
  `}
`;

export interface SimpleFormValues {
  title_multiloc: Multiloc | undefined | null;
  body_multiloc: Multiloc | undefined | null;
  topic_ids: string[];
  position: string | undefined | null;
}

export interface FormValues extends SimpleFormValues {
  banner: UploadFile | undefined | null;
  image: UploadFile | undefined | null;
  files: UploadFile[];
}

export interface FormProps {
  saving?: boolean;
  publishing: boolean;
  onSave: () => void;
  onPublish: () => void;
}

interface Props extends FormValues, FormProps {
  onChangeTitle: (newValue: Multiloc) => void;
  onChangeBody: (newValue: Multiloc) => void;
  onChangeTopics: (newValue: string[]) => void;
  onChangePosition: (newValue: string) => void;
  onChangeBanner: (newValue: UploadFile | null) => void;
  onChangeImage: (newValue: UploadFile | null) => void;
  onAddFile: (newValue: UploadFile) => void;
  onRemoveFile: (newValue: UploadFile) => void;
  locale: Locale;
  publishError: boolean;
  apiErrors: any;
  topics: ITopicData[];
  titleProfanityError: boolean;
  descriptionProfanityError: boolean;
  postAnonymously: boolean;
  setPostAnonymously: (newValue: boolean) => void;
}

const InitiativeForm = ({
  locale,
  title_multiloc,
  body_multiloc,
  topic_ids,
  image,
  onSave,
  onPublish,
  onChangeTopics,
  onChangeBanner,
  onChangeImage,
  onChangeTitle,
  onChangeBody,
  position,
  onChangePosition,
  banner,
  files,
  onAddFile,
  onRemoveFile,
  publishError,
  apiErrors,
  topics,
  titleProfanityError,
  descriptionProfanityError,
  publishing,
  setPostAnonymously,
  postAnonymously,
}: Props) => {
  const [touched, setTouched] = useState<{
    [key in keyof FormValues]?: boolean | undefined;
  }>({});
  const [errors, setErrors] = useState<{
    [key in keyof FormValues]?: { message: MessageDescriptor } | undefined;
  }>({});

  const { formatMessage } = useIntl();
  const titleMinLength = 10;
  const titleMaxLength = 72;
  const bodyMinLength = process.env.NODE_ENV === 'development' ? 10 : 30;

  useEffect(() => {
    const requiredFields = ['title_multiloc', 'body_multiloc', 'topic_ids'];

    const validations = {
      title_multiloc: () => {
        const title = title_multiloc ? title_multiloc[locale] : undefined;

        if (title && title.length > 0 && title.length < titleMinLength) {
          return { message: messages.titleMinLengthError };
        } else if (title && title.length > 0 && title.length > titleMaxLength) {
          return { message: messages.titleMaxLengthError };
        } else if (!title || title === '') {
          return { message: messages.titleEmptyError };
        }

        return undefined;
      },
      body_multiloc: () => {
        const body = body_multiloc ? body_multiloc[locale] : undefined;
        if (
          body &&
          stripHtmlTags(body).length < bodyMinLength &&
          body.length > 0
        ) {
          return { message: messages.descriptionBodyLengthError };
        } else if (!body || body === '') {
          return { message: messages.descriptionEmptyError };
        }
        return undefined;
      },
      topic_ids: () => {
        if (topic_ids.length === 0) {
          return { message: messages.topicEmptyError };
        }
        return undefined;
      },
    };
    const errorList = {};
    requiredFields.forEach((fieldName) => {
      errorList[fieldName] = validations[fieldName]();
    });
    setErrors(errorList);
  }, [bodyMinLength, body_multiloc, image, locale, title_multiloc, topic_ids]);

  const updateTouched = (fieldName: string) => {
    const touchedArray = touched;
    touchedArray[fieldName] = true;
    setTouched(touchedArray);
  };
  const onBlur = (fieldName: string) => () => {
    // making sure the props are updated before validation and save.
    setTimeout(() => {
      const touchedCopy = Object.assign({}, touched);
      touchedCopy[fieldName] = true;
      setTouched(touchedCopy);
      onSave();
    }, 5);
  };

  const validateRequiredFields = () => {
    const requiredFields = ['title_multiloc', 'body_multiloc', 'topic_ids'];
    requiredFields.forEach((fieldName) => {
      updateTouched(fieldName);
      onBlur(fieldName)();
    });
  };

  const handleOnPublish = () => {
    validateRequiredFields();
    if (Object.values(errors).every((val) => val === undefined)) {
      onPublish();
    }
  };

  const changeAndSaveTopics = (topic_ids: string[]) => {
    updateTouched('topic_ids');
    onChangeTopics(topic_ids.map((x) => x));
  };

  const addBanner = (banner: UploadFile[]) => {
    updateTouched('banner');
    onChangeBanner(banner[0]);
    onBlur('banner')();
  };

  const removeBanner = () => {
    updateTouched('banner');
    onChangeBanner(null);
    onBlur('banner')();
  };

  const addImage = (image: UploadFile[]) => {
    updateTouched('image');
    onChangeImage(image[0]);
    onBlur('image')();
  };

  const removeImage = () => {
    updateTouched('image');
    onChangeImage(null);
    onBlur('image')();
  };

  const handleTitleOnChange = (value: string) => {
    updateTouched('title_multiloc');
    if (locale && onChangeTitle) {
      onChangeTitle({
        ...title_multiloc,
        [locale]: value,
      });
    }
  };

  const handleBodyOnChange = (value: string) => {
    updateTouched('body_multiloc');
    if (locale && onChangeBody) {
      onChangeBody({
        ...body_multiloc,
        [locale]: value,
      });
    }
  };

  const mapsLoaded = window.googleMaps;

  if (!isNilOrError(topics)) {
    const availableTopics = topics.filter((topic) => !isNilOrError(topic));

    return (
      <Form id="initiative-form">
        <StyledFormSection>
          <FormSectionTitle message={messages.formGeneralSectionTitle} />

          <SectionField id="e2e-initiative-form-title-section">
            <FormLabel
              htmlFor="e2e-initiative-title-input"
              labelMessage={messages.titleLabel}
              subtextMessage={messages.titleLabelSubtext2}
            >
              <Input
                type="text"
                id="e2e-initiative-title-input"
                value={title_multiloc?.[locale] || ''}
                locale={locale}
                onChange={handleTitleOnChange}
                onBlur={onBlur('title_multiloc')}
                autocomplete="off"
                maxCharCount={72}
              />
              {touched.title_multiloc && errors.title_multiloc ? (
                <Error
                  id="e2e-proposal-title-error"
                  text={formatMessage(errors.title_multiloc.message)}
                />
              ) : (
                apiErrors &&
                apiErrors.title_multiloc && (
                  <Error apiErrors={apiErrors.title_multiloc} />
                )
              )}
            </FormLabel>
            {titleProfanityError && (
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
            )}
          </SectionField>

          <SectionField id="e2e-initiative-form-description-section">
            <FormLabel
              id="description-label-id"
              htmlFor="body"
              labelMessage={messages.descriptionLabel}
              subtextMessage={messages.descriptionLabelSubtext}
            />
            <QuillEditor
              id="body"
              value={body_multiloc?.[locale] || ''}
              locale={locale}
              noVideos={true}
              noAlign={true}
              onChange={handleBodyOnChange}
              onBlur={onBlur('body_multiloc')}
            />
            {touched.body_multiloc && errors.body_multiloc ? (
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
            )}
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
            <TopicsPicker
              id="field-topic-multiple-picker"
              selectedTopicIds={topic_ids}
              onChange={changeAndSaveTopics}
              availableTopics={availableTopics}
            />
            {touched.topic_ids && errors.topic_ids ? (
              <Error text={formatMessage(errors.topic_ids.message)} />
            ) : (
              apiErrors &&
              apiErrors.topic_ids && <Error apiErrors={apiErrors.topic_ids} />
            )}
          </SectionField>
          {mapsLoaded && (
            <SectionField>
              <FormLabel
                labelMessage={messages.locationLabel}
                subtextMessage={messages.locationLabelSubtext}
                htmlFor="initiative-location-picker"
                optional
              >
                <LocationInput
                  id="initiative-location-picker"
                  className="e2e-initiative-location-input"
                  value={position || ''}
                  onChange={onChangePosition}
                  onBlur={onBlur('position')}
                  placeholder={formatMessage(messages.locationPlaceholder)}
                />
              </FormLabel>
            </SectionField>
          )}
        </StyledFormSection>
        <StyledFormSection>
          <FormSectionTitle message={messages.formAttachmentsSectionTitle} />
          <SectionField id="e2e-iniatiative-banner-dropzone">
            <FormLabel
              labelMessage={messages.bannerUploadLabel}
              subtextMessage={messages.bannerUploadLabelSubtext}
              htmlFor="initiative-banner-dropzone"
              optional
            />
            <ImagesDropzone
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
            )}
          </SectionField>
          <SectionField id="e2e-iniatiative-img-dropzone">
            <FormLabel
              labelMessage={messages.imageUploadLabel}
              subtextMessage={messages.imageUploadLabelSubtext}
              htmlFor="initiative-image-dropzone"
              optional
            />
            <ImagesDropzone
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
            )}
          </SectionField>
          <SectionField>
            <FormLabel
              labelMessage={messages.fileUploadLabel}
              subtextMessage={messages.fileUploadLabelSubtext}
              htmlFor="e2e-initiative-file-upload"
              optional
            >
              <FileUploader
                id="e2e-initiative-file-upload"
                onFileAdd={onAddFile}
                onFileRemove={onRemoveFile}
                files={files}
                apiErrors={apiErrors}
              />
            </FormLabel>
          </SectionField>
        </StyledFormSection>
        <StyledFormSection>
          <Box mt="-20px">
            <ProfileVisiblity
              postAnonymously={postAnonymously}
              setPostAnonymously={setPostAnonymously}
            />
          </Box>
        </StyledFormSection>
        <FormSubmitFooter
          className="e2e-initiative-publish-button"
          message={messages.publishButton}
          error={publishError}
          errorMessage={messages.submitApiError}
          processing={publishing}
          onSubmit={handleOnPublish}
        />
      </Form>
    );
  }

  return null;
};

export default InitiativeForm;

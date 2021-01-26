import * as React from 'react';
import { get } from 'lodash-es';
import { stripHtmlTags, isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import scrollToComponent from 'react-scroll-to-component';

// Components
import {
  FormSection,
  FormSectionTitle,
  FormLabel,
  FormSubmitFooter,
} from 'components/UI/FormComponents';
import { SectionField } from 'components/admin/Section';
import TopicsPicker from 'components/UI/TopicsPicker';
import { Input, LocationInput } from 'cl2-component-library';
import QuillEditor from 'components/UI/QuillEditor';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import FileUploader from 'components/UI/FileUploader';
import Error from 'components/UI/Error';

// intl
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { IMessageInfo, injectIntl } from 'utils/cl-intl';

// typings
import { Multiloc, Locale, UploadFile } from 'typings';
import bowser from 'bowser';
import { ITopicData } from 'services/topics';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  margin-bottom: 100px;
`;

const StyledFormSection = styled(FormSection)`
  ${media.largePhone`
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
}

interface State {
  touched: {
    [key in keyof FormValues]?: boolean | undefined;
  };
  errors: {
    [key in keyof FormValues]?: IMessageInfo | undefined;
  };
}

class InitiativeForm extends React.Component<Props & InjectedIntlProps, State> {
  static titleMinLength = 10;
  static titleMaxLength = 72;
  static bodyMinLength = process.env.NODE_ENV === 'development' ? 10 : 30;
  static requiredFields = ['title_multiloc', 'body_multiloc', 'topic_ids'];

  titleInputElement: HTMLInputElement | null;
  descriptionElement: HTMLDivElement | null;
  topicElement: HTMLButtonElement | null;

  constructor(props) {
    super(props);
    this.state = {
      touched: {} as State['touched'],
      errors: {} as State['errors'],
    };
    this.titleInputElement = null;
    this.descriptionElement = null;
    this.topicElement = null;
  }

  componentDidMount() {
    const errors = {};
    InitiativeForm.requiredFields.forEach((fieldName) => {
      errors[fieldName] = this.validations[fieldName]();
    });
    this.setState({ errors });

    if (!bowser.mobile && this.titleInputElement !== null) {
      setTimeout(
        () => (this.titleInputElement as HTMLInputElement).focus(),
        50
      );
    }
  }

  componentDidUpdate(prevProps: Props) {
    // we generally validate on blur, but when the form is almost ready to be
    // sent, we want to have the publish button active as soon as it's usable

    // getting the non null errors
    const errorEntries = Object.entries(this.state.errors).filter(
      (entry) => entry[1]
    );
    // if there's only one
    if (errorEntries.length === 1) {
      // if the value of this field was changed
      if (prevProps[errorEntries[0][0]] !== this.props[errorEntries[0][0]]) {
        // run validation for that field
        this.validate(errorEntries[0][0]);
      }
    }

    // also, when the form is in a publishable state, if we modify a field we
    // want to make sure detect the form is no longer valid as soon as possible

    // if the form is valid
    if (errorEntries.length === 0) {
      // find what prop whas changed and run its validation
      Object.entries(prevProps)
        .filter((entry) => entry[1] !== this.props[entry[0]])
        .forEach(
          (entry) => this.validations[entry[0]] && this.validate(entry[0])
        );
    }
  }

  validations = {
    title_multiloc: () => {
      const { title_multiloc } = this.props;
      const title = title_multiloc
        ? title_multiloc[this.props.locale]
        : undefined;

      if (
        title &&
        title.length > 0 &&
        title.length < InitiativeForm.titleMinLength
      ) {
        return { message: messages.titleMinLengthError };
      } else if (
        title &&
        title.length > 0 &&
        title.length > InitiativeForm.titleMaxLength
      ) {
        return { message: messages.titleMaxLengthError };
      } else if (!title || title === '') {
        return { message: messages.titleEmptyError };
      }

      return undefined;
    },
    body_multiloc: () => {
      const { body_multiloc } = this.props;
      const body = body_multiloc ? body_multiloc[this.props.locale] : undefined;
      if (
        body &&
        stripHtmlTags(body).length < InitiativeForm.bodyMinLength &&
        body.length > 0
      ) {
        return { message: messages.descriptionBodyLengthError };
      } else if (!body || body === '') {
        return { message: messages.descriptionEmptyError };
      }
      return undefined;
    },
    topic_ids: () => {
      const { topic_ids } = this.props;
      if (topic_ids.length === 0) {
        return { message: messages.topicEmptyError };
      }
      return undefined;
    },
    image: () => {
      const { image } = this.props;
      if (!image) {
        return { message: messages.imageEmptyError };
      }
      return undefined;
    },
  };

  validate = (fieldName: string) => {
    const errors = Object.assign({}, this.state.errors);
    errors[fieldName] = get(this.validations, fieldName, () => undefined)();
    this.setState({ errors });
  };

  onBlur = (fieldName: string) => () => {
    // making sure the props are updated before validation and save.
    setTimeout(() => {
      const touched = Object.assign({}, this.state.touched);
      touched[fieldName] = true;
      const errors = Object.assign({}, this.state.errors);
      errors[fieldName] = get(this.validations, fieldName, () => undefined)();
      this.setState({ touched, errors });
      this.props.onSave();
    }, 5);
  };

  handleOnPublish = () => {
    const { errors, touched } = this.state;

    if (Object.values(errors).every((val) => val === undefined)) {
      this.props.onPublish();
    } else {
      const newTouched = Object.assign({}, touched);
      const newErrors = Object.assign({}, errors);
      InitiativeForm.requiredFields.forEach((fieldName) => {
        newTouched[fieldName] = true;
        newErrors[fieldName] = get(
          this.validations,
          fieldName,
          () => undefined
        )();
      });

      this.setState({ touched: newTouched, errors: newErrors });

      if (newErrors.title_multiloc && this.titleInputElement) {
        scrollToComponent(this.titleInputElement, {
          align: 'top',
          offset: -240,
          duration: 300,
        });
        setTimeout(
          () => this.titleInputElement && this.titleInputElement.focus(),
          300
        );
      } else if (newErrors.body_multiloc && this.descriptionElement) {
        scrollToComponent(this.descriptionElement, {
          align: 'top',
          offset: -200,
          duration: 300,
        });
        setTimeout(
          () => this.descriptionElement && this.descriptionElement.focus(),
          300
        );
      } else if (newErrors.topic_ids && this.topicElement) {
        scrollToComponent(this.topicElement, {
          align: 'top',
          offset: -200,
          duration: 300,
        });
        setTimeout(() => this.topicElement?.focus(), 300);
      }
    }
  };

  changeAndSaveTopics = (topic_ids) => {
    this.props.onChangeTopics(topic_ids);
    this.onBlur('topic_ids')();
  };

  addBanner = (banner: UploadFile[]) => {
    this.props.onChangeBanner(banner[0]);
    this.onBlur('banner')();
  };

  removeBanner = () => {
    this.props.onChangeBanner(null);
    this.onBlur('banner')();
  };

  addImage = (image: UploadFile[]) => {
    this.props.onChangeImage(image[0]);
    this.onBlur('image')();
  };

  removeImage = () => {
    this.props.onChangeImage(null);
    this.onBlur('image')();
  };

  handleTitleInputSetRef = (element: HTMLInputElement) => {
    this.titleInputElement = element;
  };

  handleDescriptionSetRef = (element: HTMLDivElement) => {
    this.descriptionElement = element;
  };

  handleTopicsPickerSetRef = (element: HTMLButtonElement) => {
    this.topicElement = element;
  };

  handleTitleOnChange = (value: string, locale: Locale | undefined) => {
    if (locale && this.props.onChangeTitle) {
      this.props.onChangeTitle({
        ...this.props.title_multiloc,
        [locale]: value,
      });
    }
  };

  handleBodyOnChange = (value: string, locale: Locale | undefined) => {
    if (locale && this.props.onChangeBody) {
      this.props.onChangeBody({
        ...this.props.body_multiloc,
        [locale]: value,
      });
    }
  };

  render() {
    const {
      locale,
      title_multiloc,
      publishing,
      body_multiloc,
      topic_ids,
      position,
      onChangePosition,
      banner,
      image,
      files,
      onAddFile,
      onRemoveFile,
      publishError,
      intl: { formatMessage },
      apiErrors,
      topics,
    } = this.props;

    const { touched, errors } = this.state;

    const mapsLoaded = window.googleMaps;

    if (!isNilOrError(topics)) {
      const availableTopics = topics.filter(
        (topic) => !isNilOrError(topic)
      ) as ITopicData[];

      return (
        <Form id="initiative-form">
          <StyledFormSection>
            <FormSectionTitle message={messages.formGeneralSectionTitle} />

            <SectionField id="e2e-initiative-form-title-section">
              <FormLabel
                labelMessage={messages.titleLabel}
                subtextMessage={messages.titleLabelSubtext2}
              >
                <Input
                  type="text"
                  id="e2e-initiative-title-input"
                  value={title_multiloc?.[locale] || ''}
                  locale={locale}
                  onChange={this.handleTitleOnChange}
                  onBlur={this.onBlur('title_multiloc')}
                  autocomplete="off"
                  setRef={this.handleTitleInputSetRef}
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
                onChange={this.handleBodyOnChange}
                onBlur={this.onBlur('body_multiloc')}
                setRef={this.handleDescriptionSetRef}
              />
              {touched.body_multiloc && errors.body_multiloc ? (
                <Error text={formatMessage(errors.body_multiloc.message)} />
              ) : (
                apiErrors &&
                apiErrors.body_multiloc && (
                  <Error apiErrors={apiErrors.body_multiloc} />
                )
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
                onChange={this.changeAndSaveTopics}
                setRef={this.handleTopicsPickerSetRef}
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
                  optional
                >
                  <LocationInput
                    className="e2e-initiative-location-input"
                    value={position || ''}
                    onChange={onChangePosition}
                    onBlur={this.onBlur('position')}
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
                maxNumberOfImages={1}
                acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
                onAdd={this.addBanner}
                onRemove={this.removeBanner}
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
                maxNumberOfImages={1}
                acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
                onAdd={this.addImage}
                onRemove={this.removeImage}
              />
              {touched.image && errors.image && (
                <Error text={formatMessage(errors.image.message)} />
              )}
            </SectionField>
            <SectionField>
              <FormLabel
                labelMessage={messages.fileUploadLabel}
                subtextMessage={messages.fileUploadLabelSubtext}
                optional
              >
                <FileUploader
                  id="e2e-initiative-file-upload"
                  onFileAdd={onAddFile}
                  onFileRemove={onRemoveFile}
                  files={files}
                  errors={apiErrors}
                />
              </FormLabel>
            </SectionField>
          </StyledFormSection>
          <FormSubmitFooter
            className="e2e-initiative-publish-button"
            message={messages.publishButton}
            error={publishError}
            errorMessage={messages.publishUnknownError}
            processing={publishing}
            onSubmit={this.handleOnPublish}
          />
        </Form>
      );
    }

    return null;
  }
}

const InitiativeFormWithHOCs = injectIntl(InitiativeForm);

export default InitiativeFormWithHOCs;

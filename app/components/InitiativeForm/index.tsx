import * as React from 'react';
import { get } from 'lodash-es';
import { stripHtmlTags } from 'utils/helperUtils';

// Components
import { FormSection, FormSectionTitle, FormLabel, FormSubmitFooter } from 'components/UI/FormComponents';
import { SectionField } from 'components/admin/Section';
import TopicsPicker from 'components/UI/TopicsPicker';
import InputMultiloc from 'components/UI/InputMultiloc';
import { Multiloc, Locale, UploadFile } from 'typings';
import QuillMultiloc from 'components/UI/QuillEditor/QuillMultiloc';
import LocationInput from 'components/UI/LocationInput';
import ImageDropzone from 'components/UI/ImageDropzone';
import FileUploader from 'components/UI/FileUploader';
import Error from 'components/UI/Error';

// intl
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { IMessageInfo, injectIntl } from 'utils/cl-intl';

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
  constructor(props) {
    super(props);
    this.state = {
      touched: {} as State['touched'],
      errors: {} as State['errors'],
    };
  }
  static titleMinLength = 10;
  static bodyMinLength = process.env.NODE_ENV === 'development' ? 10 : 500;
  static requiredFields = ['title_multiloc', 'body_multiloc', 'topic_ids', 'image'];

  componentDidMount() {
    const errors = {};
    InitiativeForm.requiredFields.forEach(fieldName => {
      errors[fieldName] = this.validations[fieldName]();
    });
    this.setState({ errors });
  }

  componentDidUpdate(prevProps: Props) {
    // we generally validate on blur, but when the form is almost ready to be
    // sent, we want to have the publish button active as soon as it's usable

    // getting the non null errors
    const errorEntries = Object.entries(this.state.errors).filter(entry => entry[1]);
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
      Object.entries(prevProps).filter(entry => entry[1] !== this.props[entry[0]])
        .forEach(entry => this.validations[entry[0]] && this.validate(entry[0]));
    }
  }

  validations = {
    title_multiloc: () => {
      const { title_multiloc } = this.props;
      const title = title_multiloc ? title_multiloc[this.props.locale] : undefined;
      if (title && title.length < InitiativeForm.titleMinLength && title.length > 0) {
        return { message: messages.titleLengthError };
      } else if (!title || title === '') {
        return { message: messages.titleEmptyError };
      }
      return undefined;
    },
    body_multiloc: () => {
      const { body_multiloc } = this.props;
      const body = body_multiloc ? body_multiloc[this.props.locale] : undefined;
      if (body && stripHtmlTags(body).length < InitiativeForm.bodyMinLength && body.length > 0) {
        return { message: messages.descriptionLengthError };
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
  }

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
  }

  changeAndSaveTopics = (topic_ids) => {
    this.props.onChangeTopics(topic_ids);
    this.onBlur('topic_ids')();
  }
  changeAndSaveBanner = (banner) => {
    this.props.onChangeBanner(banner);
    this.onBlur('banner')();
  }
  changeAndSaveImage = (image) => {
    this.props.onChangeImage(image);
    this.onBlur('image')();
  }

  render() {
    const {
      locale,
      title_multiloc,
      publishing,
      onChangeTitle,
      body_multiloc,
      onChangeBody,
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
      apiErrors
    } = this.props;

    const { touched, errors } = this.state;

    const status = Object.values(errors).every(val => val === undefined) ? 'enabled' : 'disabled';

    return (
      <form id="initiative-form">
        <FormSection>
          <FormSectionTitle message={messages.formGeneralSectionTitle} />

          <SectionField>
            <FormLabel
              labelMessage={messages.titleLabel}
              subtextMessage={messages.titleLabelSubtext}
            >
              <InputMultiloc
                type="text"
                id="e2e-initiative-title-input"
                valueMultiloc={title_multiloc || {}}
                onChange={onChangeTitle}
                onBlur={this.onBlur('title_multiloc')}
                selectedLocale={locale}
              />
              {touched.title_multiloc
                && errors.title_multiloc ? <Error message={errors.title_multiloc.message} />
                : apiErrors && apiErrors.title_multiloc && <Error apiErrors={apiErrors.title_multiloc} />
              }
            </FormLabel>
          </SectionField>

          <SectionField>
            <FormLabel
              labelMessage={messages.descriptionLabel}
              subtextMessage={messages.descriptionLabelSubtext}
            >
              <QuillMultiloc
                id="body"
                selectedLocale={locale}
                valueMultiloc={body_multiloc || {}}
                onChangeMultiloc={onChangeBody}
                noVideos
                noAlign
                onBlur={this.onBlur('body_multiloc')}
              />
              {touched.body_multiloc
                && errors.body_multiloc ? <Error message={errors.body_multiloc.message} />
                : apiErrors && apiErrors.body_multiloc && <Error apiErrors={apiErrors.body_multiloc} />
              }
            </FormLabel>
          </SectionField>
        </FormSection>

        <FormSection>
          <FormSectionTitle message={messages.formDetailsSectionTitle} />

          <SectionField>
            <FormLabel
              labelMessage={messages.topicsLabel}
              subtextMessage={messages.topicsLabelSubtext}
              htmlFor="field-topic-multiple-picker"
            />
            <TopicsPicker
              id="field-topic-multiple-picker"
              max={2}
              value={topic_ids}
              onChange={this.changeAndSaveTopics}
            />
            {touched.topic_ids
              && errors.topic_ids ? <Error message={errors.topic_ids.message} />
              : apiErrors && apiErrors.topic_ids && <Error apiErrors={apiErrors.topic_ids} />
            }
          </SectionField>
          <SectionField>
            <FormLabel
              labelMessage={messages.locationLabel}
              subtextMessage={messages.locationLabelSubtext}
              optional
            >
              <LocationInput
                className="e2e-initiative-location-input"
                inCitizen
                value={position || ''}
                onChange={onChangePosition}
                onBlur={this.onBlur('position')}
                placeholder={formatMessage(messages.locationPlaceholder)}
              />
            </FormLabel>
          </SectionField>
        </FormSection>
        <FormSection>
          <FormSectionTitle message={messages.formAttachmentsSectionTitle} />

          <SectionField>
            {/* Contrary to other form fields, the image uploads are not wrapped
            in the label tag because they trigger a double file dialog issue in our
            current version of react-dropzone
            https://stackoverflow.com/questions/49671325/react-dropzone-opens-files-chooser-twice
            */}
            <FormLabel
              labelMessage={messages.bannerUploadLabel}
              subtextMessage={messages.bannerUploadLabelSubtext}
              optional
            />
            <ImageDropzone
              id="iniatiative-banner-dropzone"
              image={banner || null}
              imagePreviewRatio={360 / 1440}
              acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
              onChange={this.changeAndSaveBanner}
            />
            {apiErrors && apiErrors.header_bg && <Error apiErrors={apiErrors.header_bg} />
            }
          </SectionField>

          <SectionField>
            <FormLabel
              labelMessage={messages.imageUploadLabel}
              subtextMessage={messages.imageUploadLabelSubtext}
            />
            <ImageDropzone
              id="iniatiative-img-dropzone"
              image={image || null}
              imagePreviewRatio={135 / 298}
              acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
              onChange={this.changeAndSaveImage}
            />
            {touched.image
              && errors.image
              && <Error message={errors.image.message} />}
          </SectionField>
          <SectionField>
            <FormLabel
              labelMessage={messages.fileUploadLabel}
              subtextMessage={messages.fileUploadLabelSubtext}
              optional
            />
            <FileUploader
              id="e2e-initiative-file-upload"
              onFileAdd={onAddFile}
              onFileRemove={onRemoveFile}
              files={files}
              errors={apiErrors}
            />
          </SectionField>
        </FormSection>
        <FormSubmitFooter
          className="e2e-initiative-publish-button"
          message={messages.publishButton}
          disabled={status === 'disabled'}
          error={publishError}
          errorMessage={messages.publishUnknownError}
          processing={publishing}
          onSubmit={this.props.onPublish}
        />
      </form>
    );
  }
}

export default injectIntl(InitiativeForm);

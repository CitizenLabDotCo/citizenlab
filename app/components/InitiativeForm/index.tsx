import * as React from 'react';
import { get } from 'lodash-es';

// Components
import { FormSection, FormSectionTitle, FormLabel, FormSubmitFooter, FormError } from 'components/UI/FormComponents';
import { SectionField } from 'components/admin/Section';
import TopicsPicker from 'components/UI/TopicsPicker';
import InputMultiloc from 'components/UI/InputMultiloc';
import { Multiloc, Locale, UploadFile } from 'typings';
import QuillMultiloc from 'components/UI/QuillEditor/QuillMultiloc';
import LocationInput from 'components/UI/LocationInput';

// intl
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { IMessageInfo, injectIntl, FormattedMessage } from 'utils/cl-intl';
import ImageDropzone from 'components/UI/ImageDropzone';

export interface FormValues {
  title_multiloc: Multiloc | undefined | null;
  body_multiloc: Multiloc | undefined | null;
  topics: string[];
  position: string | undefined | null; // undefined initially, set to null to remove position in the API
  banner: UploadFile | undefined | null;
}

export interface FormProps {
  saving: boolean;
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
  locale: Locale;
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
  static bodyMinLength = 20;
  static requiredFields = ['title_multiloc', 'body_multiloc', 'topics'];

  componentDidMount() {
    const errors = {};
    InitiativeForm.requiredFields.forEach(fieldName => {
      errors[fieldName] = this.validations[fieldName]();
    });
    this.setState({ errors });
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
      if (body && body.length < InitiativeForm.bodyMinLength && body.length > 0) {
        return { message: messages.descriptionLengthError };
      } else if (!body || body === '') {
        return { message: messages.descriptionEmptyError };
      }
      return undefined;
    },
    topics: () => {
      const { topics } = this.props;
      if (topics.length === 0) {
        return { message: messages.topicEmptyError };
      }
      return undefined;
    },
  };

  onBlur = (fieldName: string) => () => {
    console.log('onblur');
    const touched = Object.assign({}, this.state.touched);
    touched[fieldName] = true;
    const errors = Object.assign({}, this.state.errors);
    errors[fieldName] = get(this.validations, fieldName, () => undefined)();
    this.setState({ touched, errors });
    this.props.onSave();
  }

  changeAndSavePosition = (position) => {
    this.props.onChangePosition(position);
    setTimeout(this.onBlur('position'), 5);
  }

  changeAndSaveTopics = (topics) => {
    this.props.onChangeTopics(topics);
    setTimeout(this.onBlur('topics'), 5);
  }

  changeAndSaveBanner = (banner) => {
    this.props.onChangeBanner(banner);
    setTimeout(this.onBlur('banner'), 5);
  }

  render() {
    const {
      locale,
      title_multiloc,
      publishing,
      onChangeTitle,
      body_multiloc,
      onChangeBody,
      topics,
      position,
      banner,
      intl: { formatMessage }
    } = this.props;

    const { touched, errors } = this.state;

    const status = Object.values(errors).every(val => val === undefined) ? 'enabled' : 'disabled';

    return (
      <form>
        <FormSection>
          <FormSectionTitle message={messages.formGeneralSectionTitle} />

          <SectionField>
            <FormLabel
              labelMessage={messages.titleLabel}
              subtextMessage={messages.titleLabelSubtext}
            >
              <InputMultiloc
                type="text"
                valueMultiloc={title_multiloc || {}}
                onChange={onChangeTitle}
                onBlur={this.onBlur('title_multiloc')}
                // required
                shownLocale={locale}
              />
            </FormLabel>
            {touched.title_multiloc
            && errors.title_multiloc
            && <FormError message={errors.title_multiloc.message} />}
          </SectionField>

          <SectionField>
            <FormLabel
              labelMessage={messages.descriptionLabel}
              subtextMessage={messages.descriptionLabelSubtext}
            >
              <QuillMultiloc
                id="body"
                shownLocale={locale}
                valueMultiloc={body_multiloc || {}}
                onChangeMultiloc={onChangeBody}
                noVideos
                noAlign
                onBlur={this.onBlur('body_multiloc')}
                // required TODO (accessibility)
              />
            </FormLabel>
            {touched.body_multiloc
            && errors.body_multiloc
            && <FormError message={errors.body_multiloc.message} />}
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
              value={topics}
              onChange={this.changeAndSaveTopics}
            />
            {touched.topics
            && errors.topics
            && <FormError message={errors.topics.message} />}
          </SectionField>
          <SectionField>
            <FormLabel
              labelMessage={messages.locationLabel}
              subtextMessage={messages.locationLabelSubtext}
              optional
            >
              <LocationInput
                value={position || ''}
                onChange={this.changeAndSavePosition}
                placeholder={formatMessage(messages.locationPlaceholder)}
              />
            </FormLabel>
          </SectionField>
        </FormSection>
        <FormSection>
          <FormSectionTitle message={messages.formAttachmentsSectionTitle} />

          <FormLabel
            labelMessage={messages.bannerUploadLabel}
            subtextMessage={messages.bannerUploadLabelSubtext}
            optional
          >
            <ImageDropzone
              id="idea-img-dropzone"
              image={banner || null}
              imagePreviewRatio={360 / 1440}
              acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
              onChange={this.changeAndSaveBanner}
            />
          </FormLabel>
        </FormSection>
        <FormSubmitFooter
          message={messages.publishButton}
          disabled={status === 'disabled'}
          processing={publishing}
          onSubmit={this.props.onPublish}
        />
      </form>
    );
  }
}

export default injectIntl(InitiativeForm);

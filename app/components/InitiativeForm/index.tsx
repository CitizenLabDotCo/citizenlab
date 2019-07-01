import * as React from 'react';
import { get } from 'lodash-es';

// Components
import { FormSection, FormSectionTitle, FormLabel, FormSubmitFooter } from 'components/UI/FormComponents';
import { SectionField } from 'components/admin/Section';
import TopicsPicker from 'components/UI/TopicsPicker';
import InputMultiloc from 'components/UI/InputMultiloc';
import { Multiloc, Locale } from 'typings';
import QuillMultiloc from 'components/UI/QuillEditor/QuillMultiloc';
import LocationInput from 'components/UI/LocationInput';

// intl
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { IMessageInfo, injectIntl } from 'utils/cl-intl';

export interface FormValues {
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  topics: string[];
  position: string;
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
      const title = title_multiloc[this.props.locale];
      if (title && title.length < InitiativeForm.titleMinLength && title.length > 0) {
        return { message: messages.titleLengthError };
      } else if (!title || title === '') {
        return { message: messages.titleEmptyError };
      }
      return undefined;
    },
    body_multiloc: () => {
      const { body_multiloc } = this.props;
      const body = body_multiloc[this.props.locale];
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

  topicsOnChange = (topics: string[]) => {
    this.props.onChangeTopics(topics);
    setTimeout(this.onBlur('topics'), 5);
  }

  onBlur = (fieldName: string) => () => {
    const touched = Object.assign({}, this.state.touched);
    touched[fieldName] = true;
    const errors = Object.assign({}, this.state.errors);
    console.log(this.validations['topics']);
    errors[fieldName] = this.validations[fieldName]();
    this.setState({ touched, errors });
    if (errors[fieldName] === undefined) {
      this.props.onSave();
    }
  }

  render() {
    const {
      locale,
      title_multiloc,
      saving,
      publishing,
      onChangeTitle,
      body_multiloc,
      onChangeBody,
      topics,
      position,
      onChangePosition,
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
                valueMultiloc={title_multiloc}
                onChange={onChangeTitle}
                onBlur={this.onBlur('title_multiloc')}
                // required
                shownLocale={locale}
              />
            </FormLabel>
            {get(touched, 'title_multiloc', false)
            && get(errors, 'title_multiloc', false)
            && <span>'hahahahahahha'</span>}
          </SectionField>

          <SectionField>
            <FormLabel
              labelMessage={messages.descriptionLabel}
              subtextMessage={messages.descriptionLabelSubtext}
            >
              <QuillMultiloc
                id="body"
                shownLocale={locale}
                valueMultiloc={body_multiloc}
                onChangeMultiloc={onChangeBody}
                noVideos
                noAlign
                onBlur={this.onBlur('body_multiloc')}
                // required TODO (accessibility)
              />
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
                value={topics}
                onChange={this.topicsOnChange}
              />
          </SectionField>
          <SectionField>
            <FormLabel
              labelMessage={messages.locationLabel}
              subtextMessage={messages.locationLabelSubtext}
              optional
            >
              <LocationInput
                onBlur={this.props.onSave}
                value={position}
                onChange={onChangePosition}
                placeholder={formatMessage(messages.locationPlaceholder)}
              />
            </FormLabel>
          </SectionField>
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

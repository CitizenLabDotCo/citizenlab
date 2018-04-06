// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isEmpty, get, forOwn } from 'lodash';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Services
import { projectBySlugStream, updateProject,  IProjectData, IUpdatedProjectProperties } from 'services/projects';
import { localeStream } from 'services/locale';

// Utils
import getSubmitState from 'utils/getSubmitState';
import { getEditorStateFromHtmlString, getHtmlStringFromEditorState } from 'utils/editorTools';

// Components
import SubmitWrapper from 'components/admin/SubmitWrapper';
import Error from 'components/UI/Error';
import { Section, SectionField } from 'components/admin/Section';

import { Formik, Form, Field } from 'formik';
import FormikTextAreaMultiloc from 'components/UI/FormikTextAreaMultiloc';
import FormikEditorMultiloc from 'components/UI/FormikEditorMultiloc';

// Typing
import { API, Locale, Multiloc, MultilocEditorState } from 'typings';

interface Props {
  params: {
    slug: string | null;
  };
}

interface State {
  loading: boolean;
  data: IProjectData | { id: null, attributes: { description_preview_multiloc: Multiloc, description_multiloc: Multiloc }, relationships: { areas: {data} }};
  diff: IUpdatedProjectProperties;
  errors: {
    [fieldName: string]: API.Error[]
  };
  saved: boolean;
  locale: Locale;
  descriptionMultilocEditorState: MultilocEditorState | null;
}

export default class ProjectDescription extends React.Component<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);

    this.state = {
      loading: false,
      saved: false,
      data: { id: null, attributes: { description_multiloc: {}, description_preview_multiloc: {} }, relationships: { areas: { data: [] } } },
      diff: {},
      errors: {},
      locale: 'en',
      descriptionMultilocEditorState: null,
    };

    this.subscriptions = [];
  }

  componentDidMount () {
    if (this.props.params.slug) {
      const locale$ = localeStream().observable;
      const project$ = projectBySlugStream(this.props.params.slug).observable;

      this.setState({ loading: true });

      this.subscriptions.push(
        Rx.Observable.combineLatest(
          locale$,
          project$
        ).subscribe(([locale, project]) => {
          const descriptionMultilocEditorState: MultilocEditorState = {};

          forOwn(project.data.attributes.description_multiloc, (htmlValue, locale) => {
            descriptionMultilocEditorState[locale] = getEditorStateFromHtmlString(htmlValue);
          });

          this.setState({
            locale,
            descriptionMultilocEditorState,
            data: project.data,
            loading: false,
            diff: {}
          });
        })
      );
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  updatePreview = (previewDescriptionMultiloc: Multiloc) => {
    this.setState((state) => ({
      diff: {
        ...state.diff,
        description_preview_multiloc: previewDescriptionMultiloc
      }
    }));
  }

  handleDescriptionOnChange = (descriptionMultilocEditorState: MultilocEditorState, locale: Locale) => {
    this.setState((state) => ({
      descriptionMultilocEditorState,
      diff: {
        ...state.diff,
        description_multiloc: {
          ...get(state.data, 'attributes.description_multiloc', {}),
          ...get(state.diff, 'description_multiloc', {}),
          [locale]: getHtmlStringFromEditorState(descriptionMultilocEditorState[locale])
        }
      }
    }));
  }

  handleSaveErrors = (errors) => {
    this.setState({ errors: errors.json.errors });
  }

  saveProject = (event) => {
    event.preventDefault();
    const { diff, data } = this.state;

    if (!isEmpty(diff) && data.id) {
      this.setState({ loading: true, saved: true });

      updateProject(data.id, diff)
      .catch(this.handleSaveErrors)
      .then(() => {
        this.setState({ loading: false, saved: true });
      });
    }
  }

  render () {
    const { data, diff, loading, saved, errors } = this.state;
    const submitState = getSubmitState({ errors, saved, diff });

    return (
      <Formik
        initialValues={{
          description_preview_multiloc: data.attributes.description_preview_multiloc,
          description_multiloc: data.attributes.description_multiloc,
        }}
        onSubmit={this.saveProject}
      >
        {({ errors }) => (
          <Form noValidate className="e2e-project-description-form">
            <Section>
              <SectionField>
                <Field
                  name="description_preview_multiloc"
                  component={FormikTextAreaMultiloc}
                  id="description-preview"
                  label={<FormattedMessage {...messages.descriptionPreviewLabel} />}
                  rows={5}
                  maxCharCount={280}
                />
                <Error fieldName="description_preview_multiloc" apiErrors={errors.description_preview_multiloc} />
              </SectionField>
              <SectionField>
                <Field
                  component={FormikEditorMultiloc}
                  id="project-description"
                  name="description_multiloc"
                  label={<FormattedMessage {...messages.descriptionLabel} />}
                  toolbarConfig={{
                    options: ['inline', 'list', 'link', 'blockType'],
                    inline: {
                      options: ['bold', 'italic'],
                    },
                    list: {
                      options: ['unordered', 'ordered'],
                    },
                    blockType: {
                      inDropdown: false,
                      options: ['Normal', 'H1'],
                      className: undefined,
                      component: undefined,
                      dropdownClassName: undefined,
                    }
                  }}
                />
                <Error fieldName="description_multiloc" apiErrors={errors.description_multiloc} />
              </SectionField>
            </Section>

            <SubmitWrapper
              loading={loading}
              status={submitState}
              messages={{
                buttonSave: messages.saveButtonLabel,
                buttonError: messages.saveErrorLabel,
                buttonSuccess: messages.saveSuccessLabel,
                messageError: messages.saveErrorMessage,
                messageSuccess: messages.saveSuccessMessage,
              }}
            />
          </Form>
        )}
      </Formik>
    );
  }
}

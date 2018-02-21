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
import EditorMultiloc from 'components/UI/EditorMultiloc';
import { Section, SectionField } from 'components/admin/Section';
import TextAreaMultiloc from 'components/UI/TextAreaMultiloc';

// Typing
import { API, Locale, Multiloc, MultilocEditorState } from 'typings';

interface Props {
  params: {
    slug: string | null;
  };
}

interface State {
  loading: boolean;
  data: IProjectData | { id: null, attributes: {}, relationships: { areas: {data} }};
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
      data: { id: null, attributes: {}, relationships: { areas: { data: [] } } },
      diff: {},
      errors: {},
      locale: 'en',
      descriptionMultilocEditorState: null,
    };

    this.subscriptions = [];
  }

  componentWillMount () {
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
    const { data, diff, descriptionMultilocEditorState, loading, saved, errors } = this.state;
    const projectAttrs = { ...data.attributes, ...diff } as IUpdatedProjectProperties;
    const submitState = getSubmitState({ errors, saved, diff });

    return (
      <form className="e2e-project-description-form" onSubmit={this.saveProject}>
        <Section>
          <SectionField>
            <TextAreaMultiloc
              id="description-preview"
              name="meta_description"
              label={<FormattedMessage {...messages.descriptionPreviewLabel} />}
              rows={5}
              valueMultiloc={projectAttrs.description_preview_multiloc}
              onChange={this.updatePreview}
              maxCharCount={280}
            />
            <Error fieldName="description_preview_multiloc" apiErrors={this.state.errors.description_preview_multiloc} />
          </SectionField>
          <SectionField>
            <EditorMultiloc
              id="project-description"
              label={<FormattedMessage {...messages.descriptionLabel} />}
              valueMultiloc={descriptionMultilocEditorState}
              onChange={this.handleDescriptionOnChange}
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
            <Error fieldName="description_multiloc" apiErrors={this.state.errors.description_multiloc} />
          </SectionField>

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
        </Section>
      </form>
    );
  }
}

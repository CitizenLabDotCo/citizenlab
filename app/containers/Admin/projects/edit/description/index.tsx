// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';

import { EditorState, ContentState, convertToRaw, convertFromHTML } from 'draft-js';

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
import Label from 'components/UI/Label';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import Error from 'components/UI/Error';
import Editor from 'components/UI/Editor';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';

// Styling
import styled from 'styled-components';

// Typing
import { API } from 'typings';
import { getLocalized } from 'utils/i18n';

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
  locale: string;
  editorState: EditorState;
}


class ProjectDescription extends React.Component<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);

    this.state = {
      loading: false,
      saved: false,
      data: { id: null, attributes: {}, relationships: { areas: { data: [] } } },
      diff: {},
      errors: {},
      locale: '',
      editorState: EditorState.createEmpty(),
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
        )
        .subscribe(([locale, project]) => {
          this.setState((state) => ({
            locale,
            editorState: (project.data.attributes.description_multiloc ? getEditorStateFromHtmlString(project.data.attributes.description_multiloc[locale]) : state.editorState),
            data: project.data,
            loading: false,
            diff: {},
          }));
        })
      );
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  changeDesc = (editorState: EditorState): void => {
    const { diff, locale } = this.state;
    const htmlDescription = getHtmlStringFromEditorState(editorState);

    _.set(diff, `description_multiloc.${locale}`, htmlDescription);

    this.setState({
      editorState,
      diff,
    });
  }

  handleSaveErrors = (errors) => {
    this.setState({ errors: errors.json.errors });
  }

  saveProject = (event) => {
    event.preventDefault();
    const { diff, data } = this.state;

    if (!_.isEmpty(diff) && data.id) {
      this.setState({ loading: true, saved: true });
      updateProject(data.id, diff)
      .catch(this.handleSaveErrors)
      .then(() => {
        this.setState({ loading: false, saved: true });
      });
    }
  }

  render () {
    const { data, diff, editorState, loading, saved, errors } = this.state;
    const projectAttrs = { ...data.attributes, ...diff } as IUpdatedProjectProperties;
    const submitState = getSubmitState({ errors, saved, diff });

    return (
      <form className="e2e-project-description-form" onSubmit={this.saveProject}>
        <Section>
          <SectionField>
            <Label htmlFor="project-description">
              <FormattedMessage {...messages.descriptionLabel} />
            </Label>

            <Editor
              id="project-description"
              placeholder=""
              value={editorState}
              error=""
              onChange={this.changeDesc}
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

export default ProjectDescription;

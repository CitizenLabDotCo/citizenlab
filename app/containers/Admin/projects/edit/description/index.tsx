// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';

import { EditorState, ContentState, convertToRaw, convertFromHTML } from 'draft-js';
import draftjsToHtml from 'draftjs-to-html';

// i18n
import { FormattedMessage } from 'react-intl';
import messages from './messages';

// Services
import { projectBySlugStream, updateProject,  IProjectData, IUpdatedProjectProperties } from 'services/projects';
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';

// Components
import FieldWrapper from 'components/admin/FieldWrapper';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import Error from 'components/UI/Error';
import Editor from 'components/UI/Editor';

// Styling
import styled from 'styled-components';

const FormWrapper = styled.form`
  img {
    max-width: 100%;
  }
`;


// Typing
import { API } from 'typings';

interface Props {
  params: {
    slug: string | null;
  };
}

interface State {
  loading: boolean;
  data: IProjectData | { id: null, attributes: {}, relationships: { areas: {data} }};
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

  constructor() {
    super();

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
      this.setState({ loading: true });

      this.subscriptions.push(
        Rx.Observable.combineLatest(
          projectBySlugStream(this.props.params.slug).observable,
          localeStream().observable,
          currentTenantStream().observable,
        )
        .subscribe(([response, locale, currentTenant]) => {
          const blocksFromHtml = convertFromHTML(response.data.attributes.description_multiloc[locale]);
          const editorContent = ContentState.createFromBlockArray(blocksFromHtml.contentBlocks, blocksFromHtml.entityMap);

          this.setState({
            data: response.data,
            loading: false,
            diff: {},
            editorState: EditorState.createWithContent(editorContent),
          });
        })
      );
    }
  }


  componentWillUnmount() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  getSubmitState = (): 'disabled' | 'enabled' | 'error' | 'success' => {
    if (!_.isEmpty(this.state.errors)) {
      return 'error';
    }
    if (this.state.saved && _.isEmpty(this.state.diff)) {
      return 'success';
    }
    return _.isEmpty(this.state.diff) ? 'disabled' : 'enabled';
  }

  changeDesc = (editorState: EditorState): void => {
    const projectAttrs = { ...this.state.data.attributes, ...this.state.diff } as IUpdatedProjectProperties;

    _.set(projectAttrs, `description_multiloc.${this.state.locale}`, draftjsToHtml(convertToRaw(editorState.getCurrentContent())));

    this.setState({
      editorState,
      diff: projectAttrs,
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
    const { data, diff, editorState, loading } = this.state;
    const projectAttrs = { ...data.attributes, ...diff } as IUpdatedProjectProperties;
    const submitState = this.getSubmitState();

    return (
      <FormWrapper onSubmit={this.saveProject}>
        <FieldWrapper>
          <label htmlFor="project-description">
            <FormattedMessage {...messages.descriptionLabel} />
          </label>
          <Editor
            id="project-description"
            placeholder=""
            value={editorState}
            error=""
            onChange={this.changeDesc}
          />
          <Error fieldName="description_multiloc" apiErrors={this.state.errors.description_multiloc} />
        </FieldWrapper>

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
      </FormWrapper>
    );
  }
}

export default ProjectDescription;

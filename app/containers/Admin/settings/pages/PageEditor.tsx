// Libraries
import * as React from 'react';
import * as Rx from 'rxjs';
import { get, includes, without } from 'lodash';

// Services
import { pageBySlugStream, createPage, updatePage, IPageData, PageUpdate, LEGAL_PAGES } from 'services/pages';
import { localeStream } from 'services/locale';

// Components
import SubmitWrapper from 'components/admin/SubmitWrapper';
import Editor from 'components/UI/Editor';
import Button from 'components/UI/Button';
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Error from 'components/UI/Error';
import Icon from 'components/UI/Icon';
import { SectionField } from 'components/admin/Section';

// Utils
import getSubmitState from 'utils/getSubmitState';
import { EditorState } from 'draft-js';
import { getEditorStateFromHtmlString, getHtmlStringFromEditorState } from 'utils/editorTools';

// Typings
import { API, Locale } from 'typings';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// Styling
import styled from 'styled-components';

const EditorWrapper = styled.div`
  margin-bottom: 2rem;
`;

const Toggle = styled(Button)`
  justify-content: flex-start;
  padding: 1rem 0;
  width: 100%;
`;

const DeployIcon = styled(Icon)`
  transform: rotate(${(props: {deployed: boolean}) => props.deployed ? '180deg' : '0deg'});
  height: .5em;
  margin-right: 1rem;
  transition: all .5s;
`;

const EditionForm = styled.form`
  max-height: 0;
  overflow: hidden;
  transition: all .5s ease-in-out;

  &.deployed {
    max-height: 1000vh;
  }
`;

interface Props {
  slug: string;
}

interface State {
  page: IPageData | null;
  loading: boolean;
  saving: boolean;
  saved: boolean;
  errors: {
    [key: string]: API.Error[];
  } | null;
  diff: PageUpdate;
  locale: Locale;
  editorState: EditorState;
  deployed: boolean;
}

export default class PageEditor extends React.Component<Props, State> {
  subscriptions: Rx.Subscription[];
  legalPages = without(LEGAL_PAGES, 'information');

  constructor(props: Props) {
    super(props as any);

    this.state = {
      page: null,
      saving: false,
      loading: false,
      saved: false,
      diff: {},
      errors: null,
      locale: 'en',
      editorState: EditorState.createEmpty(),
      deployed: false,
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { slug } = this.props;
    const locale$ = localeStream().observable;
    const page$ = pageBySlugStream(slug).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        page$
      ).subscribe(([locale, page]) => {        
        this.setState({
          locale,
          editorState: getEditorStateFromHtmlString(get(page, `data.attributes.body_multiloc.${locale}`)),
          page: (page ? page.data : null),
          loading: false
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleTextChange = (editorState: EditorState) => {
    const htmlValue = getHtmlStringFromEditorState(editorState);

    if (this.state.diff) {
      const newValue = this.state.diff && this.state.diff.body_multiloc || {};
      newValue[this.state.locale] = htmlValue;
      this.setState({
        editorState,
        diff: { ...this.state.diff, body_multiloc: newValue },
      });
    }
  }

  createMultilocUpdater = (name: string) => (value: string) => {
    if (this.state.diff) {
      const newValue = this.state.diff && this.state.diff[name] || {};
      newValue[this.state.locale] = value;
      this.setState({
        diff: { ...this.state.diff, [name]: newValue },
      });
    }
  }

  handleSave = (event) => {
    event.preventDefault();
    let savePromise;

    if (this.state.page && this.state.page.id) {
      savePromise = updatePage(this.state.page.id, this.state.diff);
    } else {
      const pageData = { ...this.state.diff, slug: this.props.slug };

      // Prevents errors when creating a new page with a hardcoded legal slug
      if (includes(this.legalPages, this.props.slug)) {
        pageData.title_multiloc = {
          [this.state.locale]: this.props.slug
        };
      }

      savePromise = createPage(pageData);
    }

    savePromise
    .then(() => {
      this.setState({ saving: false, saved: true, errors: null, diff: {} });
    })
    .catch((e) => {
      this.setState({ saving: false, saved: false, errors: e.json.errors });
    });
  }

  toggleDeploy = () => {
    this.setState({ deployed: !this.state.deployed });
  }

  render() {
    const { errors, diff, saved, saving, loading, page, locale, editorState, deployed } = this.state;
    const { slug } = this.props;

    const pageAttrs = page ? { ...page.attributes, ...diff } : { ...diff };



    if (loading) {
      return null;
    }

    return (
      <EditorWrapper className={`e2e-page-editor editor-${slug}`}>
        <Toggle style="text" onClick={this.toggleDeploy}>
          <DeployIcon name="dropdown" deployed={deployed} />
          {messages[slug]
            ? <FormattedMessage {...messages[slug]} />
            : slug
          }
        </Toggle>

        <EditionForm onSubmit={this.handleSave} className={deployed ? 'deployed' : ''} >

          {/* Do not show the title input for the legal pages */}
          {!includes(this.legalPages, slug) &&
            <SectionField>
              <Label htmlFor="title"><FormattedMessage {...messages.titleLabel} /></Label>
              <Input
                type="text"
                value={pageAttrs.title_multiloc ? pageAttrs.title_multiloc[locale] : ''}
                onChange={this.createMultilocUpdater('title_multiloc')}
              />
              <Error apiErrors={errors && errors.title_multiloc} />
            </SectionField>
          }
          <SectionField>
            <Editor
              onChange={this.handleTextChange}
              value={editorState}
              toolbarConfig={{
                options: ['inline', 'list', 'link', 'image'],
                inline: {
                  options: ['bold', 'italic'],
                },
                list: {
                  options: ['unordered', 'ordered'],
                },
                image: {
                  urlEnabled: true,
                  uploadEnabled: false,
                  alignmentEnabled: false,
                },
              }}
            />
            <Error apiErrors={errors && errors.body_multiloc} />
          </SectionField>
          <SubmitWrapper
            status={getSubmitState({ errors, diff, saved })}
            loading={saving}
            messages={messages}
          />
        </EditionForm>
      </EditorWrapper>
    );
  }
}

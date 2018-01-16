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
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Error from 'components/UI/Error';
import Icon from 'components/UI/Icon';
import { SectionField } from 'components/admin/Section';

// Utils
import getSubmitState from 'utils/getSubmitState';
import { EditorState } from 'draft-js';
import { getHtmlStringFromEditorState, getEditorStateFromHtmlString } from 'utils/editorTools';

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

const DeployIcon = styled(Icon)`
  height: 12px;
  fill: #999;
  margin-right: 12px;
  transition: transform 200ms ease-out;
  transform: rotate(0deg);
  will-change: transform;
`;

const Toggle = styled.div`
  color: #999;
  font-size: 16px;
  font-weight: 400;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;

  &:hover,
  &.deployed {
    color: #000;

    ${DeployIcon} {
      fill: #000;
    }
  }

  &.deployed {
    ${DeployIcon} {
      transform: rotate(90deg);
    }
  }
`;

const EditionForm = styled.form`
  max-height: 0;
  overflow: hidden;
  transition: all 350ms cubic-bezier(0.165, 0.84, 0.44, 1);
  margin-top: 15px;
  will-change: height, max-height;

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

export default class PageEditor extends React.PureComponent<Props, State> {
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
          editorState: getEditorStateFromHtmlString(get(page, `data.attributes.body_multiloc.${locale}`, EditorState.createEmpty())),
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
    const { locale, diff } = this.state;
    const htmlValue = getHtmlStringFromEditorState(editorState);

    if (diff) {
      const newValue = diff && diff.body_multiloc || {};
      newValue[locale] = htmlValue;

      this.setState({
        editorState,
        diff: {
          ...diff,
          body_multiloc: newValue
        }
      });
    }
  }

  createMultilocUpdater = (name: string) => (value: string) => {
    const { locale, diff } = this.state;

    if (diff) {
      const newValue = diff && diff[name] || {};
      newValue[locale] = value;

      this.setState({
        diff: {
          ...diff,
          [name]: newValue
        }
      });
    }
  }

  handleSave = (event) => {
    event.preventDefault();

    const { page, diff, locale } = this.state;
    const { slug } = this.props;
    let savePromise;

    if (page && page.id) {
      savePromise = updatePage(page.id, diff);
    } else {
      const pageData = { ...diff, slug };

      // Prevents errors when creating a new page with a hardcoded legal slug
      if (includes(this.legalPages, slug)) {
        pageData.title_multiloc = {
          [locale]: slug
        };
      }

      savePromise = createPage(pageData);
    }

    savePromise.then(() => {
      this.setState({ saving: false, saved: true, errors: null, diff: {} });
    }).catch((e) => {
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
        <Toggle onClick={this.toggleDeploy} className={`${deployed && 'deployed'}`}>
          <DeployIcon name="chevron-right" />
          {messages[slug] ? <FormattedMessage {...messages[slug]} /> : slug}
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

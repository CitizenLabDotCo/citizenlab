// Libraries
import * as React from 'react';
import * as Rx from 'rxjs';
import { get, includes, without, forOwn, isEmpty } from 'lodash';

// Services
import { pageBySlugStream, createPage, updatePage, IPageData, PageUpdate, LEGAL_PAGES, IPage } from 'services/pages';
import { localeStream } from 'services/locale';

// Components
import SubmitWrapper from 'components/admin/SubmitWrapper';
import EditorMultiloc from 'components/UI/EditorMultiloc';
import InputMultiloc from 'components/UI/InputMultiloc';
import Error from 'components/UI/Error';
import Icon from 'components/UI/Icon';
import { SectionField } from 'components/admin/Section';

// Utils
import getSubmitState from 'utils/getSubmitState';
import { getHtmlStringFromEditorState, getEditorStateFromHtmlString } from 'utils/editorTools';

// Typings
import { API, Multiloc, MultilocEditorState, Locale } from 'typings';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// Animations
import CSSTransition from 'react-transition-group/CSSTransition';

// Styling
import styled from 'styled-components';

const timeout = 350;

const EditorWrapper = styled.div`
  margin-bottom: 35px;

  &.last {
    margin-bottom: 0px;
  }
`;

const DeployIcon = styled(Icon)`
  height: 12px;
  fill: #999;
  margin-right: 12px;
  transition: transform 200ms ease-out;
  transform: rotate(0deg);
`;

const Toggle = styled.div`
  color: #999;
  font-size: 16px;
  font-weight: 500;
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
  overflow: hidden;
  transition: all 350ms cubic-bezier(0.165, 0.84, 0.44, 1);
  margin-top: 15px;

  &.page-enter {
    max-height: 0px;

    &.page-enter-active {
      max-height: 1000vh;
    }
  }

  &.page-exit {
    max-height: 1000vh;

    &.page-exit-active {
      max-height: 0px;
    }
  }
`;

interface Props {
  slug: string;
  isLast: boolean;
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
  pageBodyMultilocEditorState: MultilocEditorState | null;
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
      pageBodyMultilocEditorState: null,
      deployed: false,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { slug } = this.props;
    const locale$ = localeStream().observable;
    const page$ = pageBySlugStream(slug).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        page$
      ).subscribe(([locale, page]) => {
        const pageBodyMultilocEditorState: MultilocEditorState = {};
 
        forOwn(page.data.attributes.body_multiloc, (htmlValue, locale) => {
          pageBodyMultilocEditorState[locale] = getEditorStateFromHtmlString(htmlValue);
        });

        this.setState({
          locale,
          pageBodyMultilocEditorState,
          page: (page ? page.data : null),
          loading: false
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handlePageTitleMultilocOnChange = (titleMultiloc: Multiloc) => {
    this.setState((state) => ({
      diff: {
        ...state.diff,
        title_multiloc: titleMultiloc
      }
    }));
  }

  handlePageBodyMultilocEditorStateOnChange = (pageBodyMultilocEditorState: MultilocEditorState, locale: Locale) => {
    this.setState((state) => ({
      pageBodyMultilocEditorState,
      diff: {
        ...state.diff,
        body_multiloc: {
          ...get(state.page, 'attributes.body_multiloc', {}),
          ...get(state.diff, 'body_multiloc', {}),
          [locale]: getHtmlStringFromEditorState(pageBodyMultilocEditorState[locale])
        }
      }
    }));
  }

  handleSave = (event) => {
    event.preventDefault();

    const { page, diff, locale } = this.state;
    const { slug } = this.props;
    let savePromise: Promise<IPage> | null = null;

    if (page && page.id) {
      console.log(1);
      console.log('pageId: ' + page.id);
      console.log('diff:');
      console.log(diff);
      savePromise = updatePage(page.id, diff);
    } else if (!isEmpty(diff) && slug) {
      const pageData = { ...diff, slug };

      // Prevents errors when creating a new page with a hardcoded legal slug
      if (includes(this.legalPages, slug)) {
        pageData.title_multiloc = {
          [locale]: slug
        };
      }

      savePromise = createPage(pageData);
    }

    if (savePromise) {
      savePromise.then(() => {
        this.setState({ saving: false, saved: true, errors: null, diff: {} });
      }).catch((e) => {
        this.setState({ saving: false, saved: false, errors: e.json.errors });
      });
    }
  }

  toggleDeploy = () => {
    this.setState({ deployed: !this.state.deployed });
  }

  render() {
    const { loading } = this.state;

    if (!loading) {
      const className = this.props['className'];
      const { slug, isLast } = this.props;
      const { errors, diff, saved, saving, page, pageBodyMultilocEditorState, deployed } = this.state;
      const pageAttrs = { ...get(page, 'attributes', {}), ...diff };
      const pageTitleMultiloc = get(pageAttrs, 'title_multiloc', undefined);

      return (
        <EditorWrapper className={`${className} e2e-page-editor editor-${slug} ${isLast && 'last'}`}>
          <Toggle onClick={this.toggleDeploy} className={`${deployed && 'deployed'}`}>
            <DeployIcon name="chevron-right" />
            {messages[slug] ? <FormattedMessage {...messages[slug]} /> : slug}
          </Toggle>

          <CSSTransition
            in={deployed}
            timeout={timeout}
            mountOnEnter={true}
            unmountOnExit={true}
            enter={true}
            exit={true}
            classNames="page"
          >
            <EditionForm onSubmit={this.handleSave} >
              {/* Do not show the title input for the legal pages */}
              {!includes(this.legalPages, slug) &&
                <SectionField>
                  <InputMultiloc
                    type="text"
                    label={<FormattedMessage {...messages.titleLabel} />}
                    valueMultiloc={pageTitleMultiloc}
                    onChange={this.handlePageTitleMultilocOnChange}
                  />
                  <Error apiErrors={errors && errors.title_multiloc} />
                </SectionField>
              }
              <SectionField>
                <EditorMultiloc
                  label={<FormattedMessage {...messages.contentLabel} />}
                  onChange={this.handlePageBodyMultilocEditorStateOnChange}
                  valueMultiloc={pageBodyMultilocEditorState}
                  toolbarConfig={{
                    options: ['inline', 'list', 'link', 'image', 'blockType'],
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
                    blockType: {
                      inDropdown: true,
                      options: ['Normal', 'H1', 'H2', 'H3', 'H4'],
                      className: undefined,
                      component: undefined,
                      dropdownClassName: undefined,
                    }
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
          </CSSTransition>
        </EditorWrapper>
      );
    }

    return null;
  }
}

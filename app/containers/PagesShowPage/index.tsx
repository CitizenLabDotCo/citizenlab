import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

import { injectTFunc } from 'components/T/utils';
import Helmet from 'react-helmet';
import T from 'components/T';
import { IPage, pageBySlugStream, LEGAL_PAGES } from 'services/pages';
import { PageLink, getPageLink } from 'services/pageLink';

import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

import ContentContainer from 'components/ContentContainer';
import styled from 'styled-components';
import Spinner from 'components/UI/Spinner';
import Icon from 'components/UI/Icon';
import { Link } from 'react-router';
import { color, media } from 'utils/styleUtils';


const Container = styled.div`
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  background: #f0f0f0;
`;

const StyledContentContainer = styled(ContentContainer)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
  margin-left: auto;
  margin-right: auto;
`;

const PageContent = styled.div`
  width: 100vw;
  background: #fff;
  padding-top: 60px;
  padding-bottom: 60px;
`;

const PageTitle = styled.h1`
  color: #222;
  font-size: 30px;
  font-weight: 600;
  line-height: 36px;
  margin-bottom: 25px;
`;

const TextContainer = styled.div`
  color: #333;
  font-size: 16px;
  font-weight: 400;
  line-height: 21px;
  -webkit-font-smoothing: antialiased;

  p {
    margin-bottom: 28px;
  }

  strong {
    font-weight: 600;
  }
`;

const SpinnerContainer = styled.div`
  margin: 30px 0;
  padding: 3rem;
  background-color: white;
  display: flex;
  justify-content: center;
`;

const PagesNavWrapper = styled.div`
  width: 100%;
`;

const PagesNav = styled.nav`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-between;
  list-style: none;
  margin: 0 auto;
  padding-top: 60px;
  padding-bottom: 60px;
  padding-left: 30px;
  padding-right: 30px;
`;

const StyledLink = styled(Link)`
  color: #666;
  font-size: 16px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  margin-left: -30px;
  margin-right: -30px;
  padding: 25px 30px;
  border-radius: 5px;
  border: 1px solid ${color('separation')};
  background: #fff;

  &:hover {
    color: #000;
    border-color: #aaa;
  }
`;

const LinkIcon = styled(Icon)`
  height: 1em;
`;

type Props = {
  params: {
    slug: string;
  }
  tFunc: ({}) => string;
};

type State = {
  page: IPage | null,
  pageLinks: { data: PageLink}[] | null,
  loading: boolean;
};

class PagesShowPage extends React.PureComponent<Props & InjectedIntlProps, State> {
  slug$: Rx.BehaviorSubject<string | null> = new Rx.BehaviorSubject(null);
  subscriptions: Rx.Subscription[];
  legalPages = _.without(LEGAL_PAGES, 'information');

  constructor(props: Props) {
    super(props as any);
    this.state = {
      page: null,
      pageLinks: null,
      loading: true,
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    this.subscriptions = [
      this.slug$.distinctUntilChanged().switchMap((slug: string) => {
        return (_.isString(slug) && !_.isEmpty(slug) ? pageBySlugStream(slug).observable :  Rx.Observable.of(null));
      }).switchMap((page) => {
        let pageLinks$: Rx.Observable<null | { data: PageLink}[]> = Rx.Observable.of(null);

        if (page) {
          pageLinks$ = Rx.Observable.combineLatest(
            page.data.relationships.page_links.data.map(link => getPageLink(link.id).observable)
          );
        }

        return pageLinks$.map(pageLinks => ({ page, pageLinks }));
      }).subscribe(({ page, pageLinks }) => {
        this.setState({ page, pageLinks, loading: false });
      })
    ];
  }

  componentDidMount() {
    this.slug$.next(this.props.params.slug);
  }

  componentWillReceiveProps(newProps) {
    this.slug$.next(newProps.params.slug);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { page, loading, pageLinks } = this.state;
    const { tFunc } = this.props;
    const { formatMessage } = this.props.intl;

    if (loading) {
      return (
        <ContentContainer>
          <SpinnerContainer>
            <Spinner size="30px" color="#666" />
          </SpinnerContainer>
        </ContentContainer>
      );
    } else {
      const seoTitle = (page ? tFunc(page.data.attributes.title_multiloc) : formatMessage(messages.notFoundTitle));
      const seoDescription = (page ? '' : formatMessage(messages.notFoundDescription));
      const pageTitle = (page ? <T value={page.data.attributes.title_multiloc} /> : <FormattedMessage {...messages.notFoundTitle} />);
      const pageDescription = (page ? <T value={page.data.attributes.body_multiloc} />  : <FormattedMessage {...messages.notFoundDescription} />);

      return (
        <Container>
          <Helmet
            title={seoTitle}
            description={seoDescription}
          />

          <PageContent>
            <StyledContentContainer>
              <TextContainer>
                <PageTitle>
                  {pageTitle}
                </PageTitle>
                {pageDescription}
              </TextContainer>
            </StyledContentContainer>
          </PageContent>

          {pageLinks && pageLinks.length > 0 &&
            <PagesNavWrapper>
              <PagesNav>
                <StyledContentContainer>
                  {pageLinks.map((link) => (
                    <StyledLink to={`/pages/${link.data.attributes.linked_page_slug}`} key={link.data.id}>
                      <T value={link.data.attributes.linked_page_title_multiloc} />
                      <LinkIcon name="chevron-right" />
                    </StyledLink>
                  ))}
                </StyledContentContainer>
              </PagesNav>
            </PagesNavWrapper>
          }
        </Container>
      );
    }
  }
}

export default injectIntl(injectTFunc(PagesShowPage));

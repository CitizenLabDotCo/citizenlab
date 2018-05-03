import * as React from 'react';
import { size, get } from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { Link } from 'react-router';

// components
import Helmet from 'react-helmet';
import ContentContainer from 'components/ContentContainer';
import Spinner from 'components/UI/Spinner';
import Icon from 'components/UI/Icon';
import Footer from 'components/Footer';
import Fragment from 'components/Fragment';

// services
import { IPage, pageBySlugStream } from 'services/pages';
import { PageLink, getPageLink } from 'services/pageLink';

// i18n
import { injectTFunc } from 'components/T/utils';
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import T from 'components/T';
import messages from './messages';

// styling
import styled from 'styled-components';
import { darken } from 'polished';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  background: #f9f9fa;
`;

const Loading = styled.div`
  width: 100%;
  height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.smallerThanMaxTablet`
    height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
  margin-left: auto;
  margin-right: auto;
`;

const PageContent = styled.div`
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 61px);
  background: #fff;
  padding-top: 60px;
  padding-bottom: 60px;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

const PageTitle = styled.h1`
  color: #333;
  font-size: 34px;
  line-height: 40px;
  font-weight: 500;
  text-align: left;
  margin: 0;
  padding: 0;
  padding-top: 0px;
  padding-bottom: 40px;

  ${media.smallerThanMaxTablet`
    font-size: 28px;
    line-height: 34px;
  `}
`;

const PageDescription = styled.div`
  color: #333;
  font-size: 18px;
  font-weight: 300;
  line-height: 26px;

  h1 {
    font-size: 30px;
    line-height: 35px;
    font-weight: 600;
  }

  h2 {
    font-size: 27px;
    line-height: 33px;
    font-weight: 600;
  }

  h3 {
    font-size: 24px;
    line-height: 30px;
    font-weight: 600;
  }

  h4 {
    font-size: 21px;
    line-height: 27px;
    font-weight: 600;
  }

  p {
    margin-bottom: 35px;
  }

  strong {
    font-weight: 600;
  }

  a {
    color: ${(props) => props.theme.colors.clBlue};
    text-decoration: underline;

    &:hover {
      color: ${(props) => darken(0.15, props.theme.colors.clBlue)};
    }
  }
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
  padding-top: 90px;
  padding-bottom: 80px;
`;

const StyledLink = styled(Link)`
  color: #666;
  font-size: 18px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 20px 23px;
  border-radius: 5px;
  border: solid 1px #e4e4e4;
  background: #fff;
  transition: all 100ms ease-out;

  &:hover {
    color: #000;
    border-color: #999;
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
  pageLinks: { data: PageLink }[] | null,
  loading: boolean;
};

class PagesShowPage extends React.PureComponent<Props & InjectedIntlProps, State> {
  slug$: Rx.BehaviorSubject<string | null>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      page: null,
      pageLinks: null,
      loading: true,
    };
    this.subscriptions = [];
    this.slug$ = new Rx.BehaviorSubject(null);
  }

  componentDidMount() {
    this.slug$.next(this.props.params.slug);

    this.subscriptions = [
      this.slug$
        .distinctUntilChanged()
        .do(() => this.setState({ loading: true }))
        .switchMap((slug) => (slug ? pageBySlugStream(slug).observable : Rx.Observable.of(null)))
        .switchMap((page) => {
          let pageLinks$: Rx.Observable<null | { data: PageLink }[]> = Rx.Observable.of(null);

          if (page && size(get(page, 'data.relationships.page_links.data')) > 0) {
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

  componentDidUpdate() {
    this.slug$.next(this.props.params.slug);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { page, pageLinks, loading } = this.state;
    const { tFunc } = this.props;
    const { formatMessage } = this.props.intl;

    if (loading) {
      return (
        <Loading>
          <Spinner size="32px" color="#666" />
        </Loading>
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
              <Fragment name={`pages/${page && page.data.id}/content`}>
                <PageTitle>
                  {pageTitle}
                </PageTitle>
                <PageDescription>
                  {pageDescription}
                </PageDescription>
              </Fragment>
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

          <Footer showCityLogoSection={false} />
        </Container>
      );
    }
  }
}

export default injectIntl(injectTFunc(PagesShowPage));

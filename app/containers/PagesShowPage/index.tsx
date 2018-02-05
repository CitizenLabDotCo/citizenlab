import * as React from 'react';
import { isString, size, get } from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { Link } from 'react-router';

// components
import Helmet from 'react-helmet';
import ContentContainer from 'components/ContentContainer';
import Spinner from 'components/UI/Spinner';
import Icon from 'components/UI/Icon';
import Footer from 'components/Footer';

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

const Container = styled.div`
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  background: #f6f6f6;
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
  font-size: 34px;
  font-weight: 600;
  line-height: 40px;
  margin-bottom: 50px;
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
  padding: 23px;
  border-radius: 5px;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.15);
  background: #fff;
  transition: all 150ms ease-out;

  &:hover {
    color: #000;
    transform: scale(1.005);
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
        .filter(slug => isString(slug))
        .distinctUntilChanged()
        .do(() => this.setState({ loading: true }))
        .switchMap((slug: string) => pageBySlugStream(slug).observable)
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
              <PageTitle>
                {pageTitle}
              </PageTitle>
              <PageDescription>
                {pageDescription}
              </PageDescription>
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

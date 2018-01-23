/*
 *
 * PagesShowPage
 *
 */

import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { includes, without } from 'lodash';

import { injectTFunc } from 'components/T/utils';
import Helmet from 'react-helmet';
import T from 'components/T';
import { IPageData, pageBySlugStream, LEGAL_PAGES } from 'services/pages';
import { PageLink, getPageLink } from 'services/pageLink';

import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

import ContentContainer from 'components/ContentContainer';
import styled from 'styled-components';
import NotFound from 'containers/NotFoundPage';
import Spinner from 'components/UI/Spinner';
import Icon from 'components/UI/Icon';
import { Link } from 'react-router';
import { color } from 'utils/styleUtils';

const TextContainer = styled.div`
  margin: 30px 0;
  padding: 3rem;
  background-color: white;
`;

const SpinnerContainer = styled.div`
  margin: 30px 0;
  padding: 3rem;
  background-color: white;
  display: flex;
  justify-content: center;
`;

const PagesNavWrapper = styled.div`
  background: #e5e5e5;
  padding: 10rem 0;
  width: 100vw;
`;

const PagesNav = styled.nav`
  align-items: stretch;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  list-style: none;
  margin: 0 auto;
  max-width: 970px;
  padding: 0;
  width: 95%;
`;

const StyledLink = styled(Link)`
  align-items: center;
  background: white;
  border-radius: 5px;
  border: 1px solid ${color('separation')};
  color: ${color('darkClGreen')};
  display: flex;
  justify-content: space-between;
  margin-bottom: .5rem;
  padding: 2rem 4rem;
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
  page: IPageData | null,
  loading: boolean;
  pageLinks: {data: PageLink}[];
};

class PagesShowPage extends React.PureComponent<Props & InjectedIntlProps, State> {
  sub: Rx.Subscription | null = null;
  slug$: Rx.BehaviorSubject<string> = new Rx.BehaviorSubject('');
  legalPages = without(LEGAL_PAGES, 'information');

  constructor(props: Props) {
    super(props as any);
    this.state = {
      page: null,
      loading: true,
      pageLinks: [],
    };
  }

  componentWillMount() {
    this.sub = this.slug$
    .switchMap((slug) => {
      if (slug) {
        this.setState({ loading: true });
        return pageBySlugStream(slug).observable;
      }

      return Rx.Observable.of(null);
    })
    .switchMap((pageResponse) => {
      try {
        // Page not found
        if (!pageResponse) {
          return Rx.Observable.of({ pageResponse: { data: null }, pageLinks: [] });
        }

        // Page has no links
        if (pageResponse.data.relationships.page_links.data.length === 0) {
          return Rx.Observable.of({ pageResponse, pageLinks: [] });
        }

        // Page with links
        const linksRequests = pageResponse.data.relationships.page_links.data.map(link => getPageLink(link.id).observable.first());
        return Rx.Observable.combineLatest(linksRequests).map((pageLinks) => ({ pageLinks, pageResponse }));
      } catch (e) {
        return Rx.Observable.of({ pageResponse: null, pageLinks: null });
      }
    })
    .subscribe(({ pageLinks, pageResponse }) => {
      if (pageResponse) {
        this.setState({
          pageLinks,
          page: pageResponse.data,
          loading: false,
        });
      } else {
        this.setState({
          loading: false,
          page: null,
          pageLinks: [],
        });
      }
    });
  }

  componentDidMount() {
    this.slug$.next(this.props.params.slug);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.params.slug !== this.props.params.slug) {
      this.slug$.next(newProps.params.slug);
    }
  }

  componentWillUnmount() {
    this.sub && this.sub.unsubscribe();
  }

  render() {
    const { page, loading, pageLinks } = this.state;
    const { tFunc } = this.props;

    if (loading) {
      return (
        <ContentContainer>
          <SpinnerContainer>
            <Spinner size="28px" color="#84939E" />
          </SpinnerContainer>
        </ContentContainer>
      );
    }

    if (page === null) {
      return <NotFound />;
    }

    return (
      <div>
        <ContentContainer>
          <Helmet>
            <title>
              {/* tFunc is used here because <title> doesn't accept any dom node, only a plain string */}
              {tFunc(page.attributes.title_multiloc)}
            </title>
          </Helmet>
          <TextContainer>
            <h1>
              <T value={page.attributes.title_multiloc} />
            </h1>
            <T value={page.attributes.body_multiloc} />
          </TextContainer>
        </ContentContainer>
        {pageLinks && pageLinks.length > 0 &&
          <PagesNavWrapper>
            <PagesNav>
              {pageLinks.map((link) => (
                <StyledLink to={`/pages/${link.data.attributes.linked_page_slug}`} key={link.data.id}>
                  <T value={link.data.attributes.linked_page_title_multiloc} />
                  <LinkIcon name="chevron-right" />
                </StyledLink>
              ))}
            </PagesNav>
          </PagesNavWrapper>
        }
      </div>
    );
  }
}

export default injectIntl(injectTFunc(PagesShowPage));

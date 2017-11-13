/*
 *
 * PagesShowPage
 *
 */

import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { includes } from 'lodash';

import { injectTFunc } from 'components/T/utils';
import Helmet from 'react-helmet';
import T from 'components/T';
import { IPageData, pageBySlugStream } from 'services/pages';

import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';

import ContentContainer from 'components/ContentContainer';
import styled from 'styled-components';
import NotFound from 'containers/NotFoundPage';
import Spinner from 'components/UI/Spinner';
import Icon from 'components/UI/Icon';
import { Link } from 'react-router';

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
  border: 1px solid ${props => props.theme.colors.separation};
  color: ${props => props.theme.colors.darkClGreen};
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
};

class PagesShowPage extends React.PureComponent<Props & InjectedIntlProps, State> {
  pageObserver: Rx.Subscription | null;
  legalPages = ['terms-and-conditions', 'privacy-policy', 'cookies-policy'];

  constructor() {
    super();
    this.pageObserver = null;
    this.state = {
      page: null,
      loading: true,
    };
  }

  componentDidMount() {
    this.pageObserver = pageBySlugStream(this.props.params.slug).observable.subscribe((response) => {
      if (response) {
        this.setState({
          page: response.data,
          loading: false,
        });
      }
    });
  }

  componentWillUnmount() {
    this.pageObserver && this.pageObserver.unsubscribe();
  }

  render() {
    const { page, loading } = this.state;
    const { tFunc } = this.props;

    if (loading) {
      return (
        <ContentContainer>
          <SpinnerContainer>
            <Spinner color="#84939E" />
          </SpinnerContainer>
        </ContentContainer>
      );
    }

    if (!page) {
      return <NotFound />;
    }

    return page && (
      <div>
        <ContentContainer>
          <Helmet>
            <title>
            {includes(this.legalPages, this.props.params.slug)
              ? this.props.intl.formatMessage(messages[this.props.params.slug])
              : tFunc(page.attributes.title_multiloc)
            }
            </title>
          </Helmet>
          <TextContainer>
            <h1>
              {includes(this.legalPages, this.props.params.slug)
                ? <FormattedMessage {...messages[this.props.params.slug]} />
                : <T value={page.attributes.title_multiloc} />
              }
            </h1>
            <T value={page.attributes.body_multiloc} />
          </TextContainer>
        </ContentContainer>
        {includes(this.legalPages, this.props.params.slug) &&
          <PagesNavWrapper>
            <PagesNav>
              <StyledLink to="/pages/terms-and-conditions">
                <FormattedMessage {...messages.termsLink} />
                <LinkIcon name="chevron-right" />
              </StyledLink>
              <StyledLink to="/pages/privacy-policy">
                <FormattedMessage {...messages.privacyLink} />
                <LinkIcon name="chevron-right" />
              </StyledLink>
              <StyledLink to="/pages/cookies-policy">
                <FormattedMessage {...messages.cookiesLink} />
                <LinkIcon name="chevron-right" />
              </StyledLink>
            </PagesNav>
          </PagesNavWrapper>
        }
      </div>
    );
  }
}

export default injectIntl(injectTFunc(PagesShowPage));

import * as React from 'react';
import { Link } from 'react-router';

// components
import Icon from 'components/UI/Icon';

// i18n
import { FormattedMessage } from 'react-intl';
import messages from './messages.js';

// style
import styled from 'styled-components';

const FooterWrapper = styled.div`
  height: 70px;
  align-items: center;
  background: #fff;
  border-top: 1px solid #eaeaea;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  padding: 0 3.5rem;
  width: 100vw;
`;

const PagesNav = styled.nav`
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 0;
  text-align: left;

  li {
    display: inline-block;
  }

  a {
    color: inherit;
  }
`;

const CLWrapper = styled.div`
  color: #a6a6a6;
  flex: 1;
  text-align: center;

  span {
    align-items: center;
    display: flex;
    justify-content: center;
  }

  svg {
    margin-left: 1rem;
  }
`;

const FeedbackWrapper = styled.div`
  flex: 1;
  text-align: right;
`;

const StyledLink = styled(Link)`
  color: #999 !important;
  text-decoration: none;
  padding: 0px 10px;

  &:hover {
    color: #000 !important;
    text-decoration: underline;
  }
`;

export default class Footer extends React.PureComponent<{}, {}> {
  render () {
    const logo = <Icon name="logo" />;

    return (
      <FooterWrapper>
        <PagesNav>
          <li>
            <StyledLink to="/pages/terms-and-condition">
              <FormattedMessage {...messages.termsLink} />
            </StyledLink>
          </li>
          <li>
            <StyledLink to="/pages/privacy-policy">
              <FormattedMessage {...messages.privacyLink} />
            </StyledLink>
          </li>
          <li>
            <StyledLink to="/pages/cookies-policy">
              <FormattedMessage {...messages.cookiesLink} />
            </StyledLink>
          </li>
        </PagesNav>

        <CLWrapper>
          <FormattedMessage {...messages.poweredBy} values={{ logo }} />
        </CLWrapper>

        <FeedbackWrapper>
          <FormattedMessage {...messages.feedbackLink} />
        </FeedbackWrapper>

      </FooterWrapper>
    );
  }
}

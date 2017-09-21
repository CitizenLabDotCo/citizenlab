// Libraries
import * as React from 'react';
import styled from 'styled-components';

import messages from '../messages.js';

// Components
import Icon from 'components/UI/Icon';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';

// Styling
const FooterWrapper = styled.div`
  align-items: center;
  background: #fff;
  border-top: 1px solid #eaeaea;
  box-sizing: border-box;
  display: flex;
  height: 6rem;
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
  color: #A6A6A6;
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
  color: #000;
  flex: 1;
  text-align: right;

  a {
    color: inherit;
  }
`;


// Typing
interface Props {

}

interface State {

}

export default class Footer extends React.Component<Props, State> {
  render () {
    const logo = <Icon name="logo" />;

    return (
      <FooterWrapper>
        <PagesNav>
          <li>
            <Link to="/pages/terms-of-use">
              <FormattedMessage {...messages.termsLink} />
            </Link>
          </li>
          &nbsp;|&nbsp;
          {/* <li>
            <Link to="/pages/privacy-policy">
              <FormattedMessage {...messages.privacyLink} />
            </Link>
          </li>
          &nbsp;|&nbsp; */}
          <li>
            <Link to="/pages/cookie-policy">
              <FormattedMessage {...messages.cookiesLink} />
            </Link>
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

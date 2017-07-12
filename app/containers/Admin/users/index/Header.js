import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0px;
`;

const HeaderTitle = styled.h1`
  font-family: CircularStd;
  font-size: 35px;
  font-weight: bold;
  margin: 0;
  color: #101010;
`;

const HeaderExportLink = styled.a`
  font-size: 18px;
  text-align: left;
  color: #222222;
`;

class Header extends PureComponent {

  render() {
    return (
      <HeaderContainer>
        <HeaderTitle>
          <FormattedMessage {...messages.headerIndex} />
        </HeaderTitle>
        <HeaderExportLink href="">
          <FormattedMessage {...messages.exportUsers} />
        </HeaderExportLink>
      </HeaderContainer>
    );
  }
}

export default Header;

import React, { PropTypes } from 'react';
import { push } from 'react-router-redux';
import styled from 'styled-components';
import { lighten } from 'polished';
import { Link } from 'react-router';
import { FormattedMessage, injectIntl } from 'react-intl';
// import SearchWidget from 'containers/SearchWidget';
import Authorize from 'utils/containers/authorize';
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';
import { signOutCurrentUser } from 'utils/auth/actions';
import { makeSelectCurrentUserImmutable } from 'utils/auth/selectors';
import ClickOutside from 'utils/containers/clickOutside';
import messages from './messages';
import logoImage from '../../../../assets/img/landingpage/logo.png';

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
  padding-left: 30px;
  padding-right: 30px;
  position: absolute;
  background: transparent;
  z-index: 1;
`;

const Left = styled.div`
  display: flex;

  > div {
    display: flex;
  }
`;

const Right = styled.div`
  display: flex;

  > div {
    display: flex;
  }
`;

const Logo = styled.img`
  height: 50px;
  cursor: pointer;
`;

const ButtonIcon = styled.svg`
  fill: #fff;
  height: 32px;
  margin-top: -8px;
`;

const ButtonText = styled.span`
  color: #fff;
  font-weight: 500;
  font-size: 19px;
  white-space: nowrap;
  transition: opacity 150ms ease;
`;

const Button = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px 20px;
  border-radius: 6px;
  background: #00a8e2;
  cursor: pointer;
  transition: all 200ms ease-out;
  margin-right: 10px;
  background: ${(props) => props.secondary ? 'transparent' : '#00a8e2'};

  &:hover {
    background: ${(props) => !props.secondary ? lighten(0.1, '#00a8e2') : ''};

    ${ButtonText} {
      opacity: 1;
    }
  }

  ${ButtonText} {
    opacity: ${(props) => props.secondary ? '0.7' : '1'};
  }
`;

const User = styled(ClickOutside)`
  display: flex;
  border-radius: 50%;
  margin-left: 0px;
  position: relative;
  cursor: pointer;
`;

const UserImage = styled.img`
  height: 46px;
  border-radius: 50%;
  margin-left: 10px;
  opacity: 0.75;
  transition: opacity 200ms ease;

  &:hover {
    opacity: 1;
  }
`;

const Dropdown = styled.div`
  min-width: 150px;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 55px;
  right: -5px;
  z-index: 1;
`;

const DropdownItem = styled.div`
  color: #666;
  font-size: 15px;
  font-weight: 400;
  padding: 8px 10px;
  border-bottom: solid 1px #ccc;
  background: #fff;

  &:first-child {
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }

  &:last-child {
    border: none;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  &:hover {
    background: #f4f4f4;
  }
`;

class Navbar extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    this.state = {
      dropdownOpened: false,
    };
  }

  toggleDropdown = () => {
    this.setState((state) => ({ dropdownOpened: !state.dropdownOpened }));
  }

  closeDropdown = () => {
    this.setState({ dropdownOpened: false });
  }

  goTo = (path) => () => {
    this.props.goTo(path);
  }

  render() {
    const { currentUser } = this.props;
    const avatar = (currentUser ? currentUser.getIn(['attributes', 'avatar', 'large']) : null);

    return (
      <Container>
        <Left>
          <Link to="/">
            <Logo src={logoImage} styleName="logo" alt="logo" />
          </Link>
        </Left>
        <Right>
          {currentUser ?
            <div>
              <Button onClick={this.goTo('/ideas/new')}>
                <ButtonIcon height="100%" viewBox="0 0 24 24">
                  <path fill="none" d="M0 0h24v24H0V0z" /><path d="M6.57 21.64c0 .394.32.716.716.716h2.867c.394 0 .717-.322.717-.717v-.718h-4.3v.717zM8.72 8.02C5.95 8.02 3.7 10.273 3.7 13.04c0 1.704.853 3.202 2.15 4.112v1.62c0 .394.322.716.717.716h4.3c.393 0 .716-.322.716-.717v-1.618c1.298-.91 2.15-2.408 2.15-4.113 0-2.768-2.25-5.02-5.017-5.02zm2.04 7.957l-.608.43v1.648H7.286v-1.648l-.61-.43c-.967-.674-1.54-1.77-1.54-2.938 0-1.98 1.605-3.585 3.583-3.585s3.583 1.605 3.583 3.584c0 1.167-.574 2.263-1.542 2.937zM20.3 7.245h-3.61v3.61h-1.202v-3.61h-3.61V6.042h3.61v-3.61h1.202v3.61h3.61v1.203z" />
                </ButtonIcon>
                <ButtonText>
                  <FormattedMessage {...messages.addIdea} />
                </ButtonText>
              </Button>
              <User onClick={this.toggleDropdown} onClickOutside={this.closeDropdown}>
                <UserImage avatar src={avatar}></UserImage>
                {this.state.dropdownOpened ?
                  <Dropdown>
                    <Authorize action={['users', 'admin']} >
                      <DropdownItem onClick={this.goTo('/admin')}>
                        <FormattedMessage {...messages.admin} />
                      </DropdownItem>
                    </Authorize>
                    <DropdownItem onClick={this.goTo('/profile/edit')}>
                      <FormattedMessage {...messages.editProfile} />
                    </DropdownItem>
                    <DropdownItem onClick={this.props.signOut}>
                      <FormattedMessage {...messages.signOut} />
                    </DropdownItem>
                  </Dropdown>
                  :
                  null
                }
              </User>
            </div>
           :
            <div>
              <Button secondary onClick={this.goTo('/sign-in')}>
                <ButtonText><FormattedMessage {...messages.login} /></ButtonText>
              </Button>
              <Button onClick={this.goTo('/register')}>
                <ButtonText><FormattedMessage {...messages.register} /></ButtonText>
              </Button>
            </div>
           }
        </Right>
      </Container>
    );
  }
}

Navbar.propTypes = {
  currentUser: PropTypes.object,
  currentTenant: PropTypes.object.isRequired,
  signOut: PropTypes.func.isRequired,
  goTo: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  currentUser: makeSelectCurrentUserImmutable(),
});

const mergeProps = (stateP, dispatchP, ownP) => {
  const signOut = dispatchP.signOutCurrentUser;
  const goTo = dispatchP.push;
  return Object.assign({}, stateP, { signOut, goTo }, ownP);
};

export default injectIntl(preprocess(mapStateToProps, { signOutCurrentUser, push }, mergeProps)(Navbar));

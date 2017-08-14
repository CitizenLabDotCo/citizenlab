import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import Authorize from 'utils/containers/authorize';
import ClickOutside from 'utils/containers/clickOutside';
import adminIcon from './adminIcon.svg';
import editProfileIcon from './editProfileIcon.svg';
import signOutIcon from './signOutIcon.svg';

import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { signOutCurrentUser } from 'utils/auth/actions';
import { push } from 'react-router-redux';
import { makeSelectCurrentUserImmutable } from 'utils/auth/selectors';
import messages from '../../messages';


const MenuContainer = styled(ClickOutside)`
  display: flex;
  border-radius: 50%;
  margin-left: 0px;
  position: relative;
  cursor: pointer;
`;

const UserImage = styled.img`
  height: 34px;
  border-radius: 50%;
  opacity: 0.85;
  transition: opacity 200ms ease;

  &:hover {
    opacity: 1;
  }
`;

const Dropdown = styled.div`
  min-width: 210px;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 50px;
  right: -5px;
  z-index: 1;
  padding: 8px;
  background: #FFFFFF;
  border: 1px solid #EAEAEA;
  box-sizing: border-box;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const DropdownItem = styled.div`
  color: #888888;
  font-size: 18px;
  font-family: Proxima Nova;
  font-weight: 400;
  padding: 12px 15px 12px 25px;
  background: #fff;

  &:hover {
    background: #F9F9F9;
    color: #393939;
  }

  display: flex;
  justify-content: space-between;
`;

const MenuIcon = styled.img`
  width: 20px;
`;

class UserMenu extends React.PureComponent {

  constructor() {
    super();

    this.state = {
      dropdownOpened: false,
    };
  }

  toggleDropdown = () => {
    this.setState((state) => ({ dropdownOpened: !state.dropdownOpened }));
  };

  closeDropdown = () => {
    this.setState({ dropdownOpened: false });
  };

  navigateTo = (path) => () => {
    this.props.push(path);
  }

  render() {
    return (
      <MenuContainer onClick={this.toggleDropdown} onClickOutside={this.closeDropdown}>
        <UserImage avatar src={this.props.avatar}></UserImage>
        {this.state.dropdownOpened &&
          <Dropdown>
            <Authorize action={['users', 'admin']} >
              <DropdownItem onClick={this.navigateTo('/admin')}>
                <FormattedMessage {...messages.admin} />
                <MenuIcon src={adminIcon} alt="admin" />
              </DropdownItem>
            </Authorize>
            <DropdownItem onClick={this.navigateTo('/profile/edit')}>
              <FormattedMessage {...messages.editProfile} />
              <MenuIcon src={editProfileIcon} alt="edit profile" />
            </DropdownItem>
            <DropdownItem onClick={this.props.signOutCurrentUser}>
              <FormattedMessage {...messages.signOut} />
              <MenuIcon src={signOutIcon} alt="sign out" />
            </DropdownItem>
          </Dropdown>
        }
      </MenuContainer>
    );
  }
}

UserMenu.propTypes = {
  avatar: PropTypes.string,
  push: PropTypes.func,
  signOutCurrentUser: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  avatar: makeSelectCurrentUserImmutable('attributes', 'avatar', 'small'),
});

export default connect(mapStateToProps, { push, signOutCurrentUser })(UserMenu);

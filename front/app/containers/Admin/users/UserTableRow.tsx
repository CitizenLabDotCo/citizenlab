// Libraries
import React, { PureComponent, FormEvent } from 'react';
import { isAdmin } from 'services/permissions/roles';
import moment from 'moment';
import clHistory from 'utils/cl-router/history';
import { removeFocusAfterMouseClick } from 'utils/helperUtils';

// Components
import { Tr, Td, Toggle, Icon } from '@citizenlab/cl2-component-library';
import Avatar from 'components/Avatar';
import Checkbox from 'components/UI/Checkbox';
import Tippy from '@tippyjs/react';

// Translation
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

// Events --- For error handling
import eventEmitter from 'utils/eventEmitter';
import events from './events';

// Services
import { IUserData, deleteUser } from 'services/users';

// Typings
import { GetAuthUserChildProps } from 'resources/GetAuthUser';

// Styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { lighten } from 'polished';

const StyledCheckbox = styled(Checkbox)`
  margin-left: 5px;
`;

const MoreOptionsWrapper = styled.div`
  width: 20px;
  position: relative;
`;

const MoreOptionsIcon = styled(Icon)`
  fill: ${colors.textSecondary};
`;

const MoreOptionsButton = styled.button`
  width: 25px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  &:hover ${MoreOptionsIcon} {
    fill: #000;
  }
`;

const CreatedAt = styled(Td)`
  white-space: nowrap;
`;

const DropdownList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-top: 5px;
  margin-bottom: 5px;
`;

const DropdownListButton = styled.button`
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${colors.white};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  white-space: nowrap;
  padding: 10px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  cursor: pointer;
  white-space: nowrap;

  &:hover,
  &:focus {
    outline: none;
    color: white;
    background: ${lighten(0.1, colors.grey800)};
  }
`;

const IconWrapper = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;

  .cl-icon {
    height: 100%;
  }

  .cl-icon-primary,
  .cl-icon-secondary,
  .cl-icon-accent {
    fill: currentColor;
  }
`;

interface Props {
  user: IUserData;
  selected: boolean;
  toggleSelect: () => void;
  toggleAdmin: () => void;
  authUser: GetAuthUserChildProps;
}

interface State {
  isAdmin: boolean;
  createdAt: string;
}

class UserTableRow extends PureComponent<Props & WrappedComponentProps, State> {
  constructor(props: Props & WrappedComponentProps) {
    super(props);
    this.state = {
      isAdmin: isAdmin({ data: this.props.user }),
      createdAt: moment(this.props.user.attributes.created_at).format('LL'),
    };
  }

  static getDerivedStateFromProps(nextProps: Props, _prevState: State) {
    return {
      isAdmin: isAdmin({ data: nextProps.user }),
      createdAt: moment(nextProps.user.attributes.created_at).format('LL'),
    };
  }

  isUserAdmin = () => {
    return isAdmin({ data: this.props.user });
  };

  handleUserSelectedOnChange = () => {
    this.props.toggleSelect();
  };

  handleAdminRoleOnChange = () => {
    this.props.toggleAdmin();
  };

  handleDeleteClick = (event: FormEvent) => {
    const { authUser, user } = this.props;
    const deleteMessage = this.props.intl.formatMessage(
      messages.userDeletionConfirmation
    );

    event.preventDefault();

    if (window.confirm(deleteMessage)) {
      if (authUser && authUser.id === user.id) {
        eventEmitter.emit<JSX.Element>(
          events.userDeletionFailed,
          <FormattedMessage {...messages.youCantDeleteYourself} />
        );
      } else {
        deleteUser(user.id).catch(() => {
          eventEmitter.emit<JSX.Element>(
            events.userDeletionFailed,
            <FormattedMessage {...messages.userDeletionFailed} />
          );
        });
      }
    }
  };

  goToUserProfile = (slug: string) => (event: FormEvent) => {
    event.preventDefault();
    clHistory.push(`/profile/${slug}`);
  };

  render() {
    const { user, selected } = this.props;
    const { isAdmin } = this.state;

    return (
      <Tr
        key={user.id}
        background={selected ? colors.background : undefined}
        className={`e2e-user-table-row ${selected ? 'selected' : ''}`}
      >
        <Td>
          <StyledCheckbox
            checked={selected}
            onChange={this.handleUserSelectedOnChange}
          />
        </Td>
        <Td>
          <Avatar userId={user.id} size={30} />
        </Td>
        <Td>
          {user.attributes.first_name} {user.attributes.last_name}
        </Td>
        <Td>{user.attributes.email}</Td>
        <CreatedAt>{this.state.createdAt}</CreatedAt>
        <Td>
          <Toggle checked={isAdmin} onChange={this.handleAdminRoleOnChange} />
        </Td>
        <Td>
          <MoreOptionsWrapper>
            <Tippy
              placement="bottom-end"
              interactive={true}
              trigger="click"
              duration={[200, 0]}
              content={
                <DropdownList>
                  <DropdownListButton
                    onClick={this.goToUserProfile(
                      this.props.user.attributes.slug
                    )}
                  >
                    <FormattedMessage {...messages.seeProfile} />
                    <IconWrapper>
                      <Icon name="eye" fill="white" />
                    </IconWrapper>
                  </DropdownListButton>
                  <DropdownListButton onClick={this.handleDeleteClick}>
                    <FormattedMessage {...messages.deleteUser} />
                    <IconWrapper>
                      <Icon name="delete" fill="white" />
                    </IconWrapper>
                  </DropdownListButton>
                </DropdownList>
              }
            >
              <MoreOptionsButton onMouseDown={removeFocusAfterMouseClick}>
                <MoreOptionsIcon name="dots-horizontal" />
              </MoreOptionsButton>
            </Tippy>
          </MoreOptionsWrapper>
        </Td>
      </Tr>
    );
  }
}

export default injectIntl(UserTableRow);

// Libraries
import React from 'react';
import { isAdmin } from 'services/permissions/roles';
import * as moment from 'moment';
import { Link } from 'react-router';

// Components
import Avatar from 'components/Avatar';
import Toggle from 'components/UI/Toggle';
import Checkbox from 'components/UI/Checkbox';
import Icon from 'components/UI/Icon';
import PresentationalDropdown from 'components/admin/MultipleSelectDropdown/PresentationalDropdown';

// translation
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
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
import { colors } from 'utils/styleUtils';

const StyledCheckbox = styled(Checkbox) `
  margin-left: 10px;
`;

const StyledAvatar = styled(Avatar) `
  flex: 0 0 28px;
  height: 28px;
`;

const SIcon = styled(Icon) `
  width: 20px;
  height: 30px;
  fill: ${colors.adminSecondaryTextColor};
  cursor: pointer;

  &:hover {
    fill: #000;
  }
`;

const CreatedAt = styled.td`
  white-space: nowrap;
`;

const Options = styled.td`
  display: flex;
  justify-content: center;
`;

const DropdownList = styled.div`
  max-height: 210px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin: 10px;
`;

const DropdownListButton = styled.button`
  align-items: center;
  color: ${colors.adminLightText};
  font-size: 16px;
  font-weight: 400;
  padding: 10px;
  border-radius: 5px;
  display: flex;
  flex: 1 0;
  justify-content: space-between !important;
  cursor: pointer;

  &:hover,
  &:focus {
    outline: none;
    color: white;
    background: rgba(0, 0, 0, 0.25);
  }
`;

const IconWrapper = styled.div`
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;

  .cl-icon {
    height: 100%;
  }

  .cl-icon-primary, .cl-icon-secondary, .cl-icon-accent {
  	fill: currentColor;
  }
`;

const DropdownListLink = styled(Link) `
  align-items: center;
  color: ${colors.adminLightText};
  font-size: 15px;
  font-weight: 400;
  padding: 10px;
  border-radius: 5px;
  display: flex;
  flex: 1 0;
  justify-content: space-between !important;

  &:hover, &:focus {
    outline: none;
    color: white;
    background: rgba(0, 0, 0, 0.2);
  }
`;

// Typings
interface Props {
  user: IUserData;
  selected: boolean;
  toggleSelect: () => void;
  toggleAdmin: () => void;
  authUser: GetAuthUserChildProps;
  up?: boolean;
}

interface State {
  optionsOpened: boolean;
  isAdmin: boolean;
}

class UserTableRow extends React.PureComponent<Props & InjectedIntlProps, State> {
  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      optionsOpened: false,
      isAdmin: isAdmin({ data: this.props.user })
    };
  }

  static getDerivedStateFromProps(nextProps: Props, _prevState: State) {
    return {
      isAdmin: isAdmin({ data: nextProps.user })
    };
  }

  isUserAdmin = () => {
    return isAdmin({ data: this.props.user });
  }

  handleUserSelectedOnChange = () => {
    this.props.toggleSelect();
  }

  handleAdminRoleOnChange = () => {
    this.props.toggleAdmin();
  }

  handleDeleteClick = (event: React.FormEvent<any>) => {
    const deleteMessage = this.props.intl.formatMessage(messages.userDeletionConfirmation);
    event.preventDefault();

    const { authUser } = this.props;
    if (window.confirm(deleteMessage)) {
      if (authUser && authUser.id === this.props.user.id) {
        eventEmitter.emit<JSX.Element>('usersAdmin', events.userDeletionFailed, <FormattedMessage {...messages.youCantDeleteYourself} />);
      } else {
        deleteUser(this.props.user.id).catch(() => {
          eventEmitter.emit<JSX.Element>('usersAdmin', events.userDeletionFailed, <FormattedMessage {...messages.userDeletionFailed} />);
        });
      }
    }
  }

  handleDropdownOnClickOutside = (event: React.FormEvent<MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ optionsOpened: false });
  }

  toggleOpened = () => {
    this.setState({ optionsOpened: !this.state.optionsOpened });
  }

  render() {
    const { user, selected, up } = this.props;
    const { optionsOpened, isAdmin } = this.state;

    return (
      <tr key={user.id}>
        <td>
          <StyledCheckbox
            value={selected}
            onChange={this.handleUserSelectedOnChange}
          />
        </td>
        <td>
          <StyledAvatar
            userId={user.id}
            size="small"
          />
        </td>
        <td>{user.attributes.first_name} {user.attributes.last_name}</td>
        <td>{user.attributes.email}</td>
        <CreatedAt>{moment(user.attributes.created_at).format('LL')}</CreatedAt>
        <td>
          <Toggle
            value={isAdmin}
            onChange={this.handleAdminRoleOnChange}
          />
        </td>
        <Options onClick={this.toggleOpened}>
          <PresentationalDropdown
            content={
              <DropdownList>
                <DropdownListLink to={`/profile/${this.props.user.attributes.slug}`}>
                  <FormattedMessage {...messages.seeProfile} />
                  <IconWrapper>
                    <Icon name="eye" />
                  </IconWrapper>
                </DropdownListLink>
                <DropdownListButton onClick={this.handleDeleteClick}>
                  <FormattedMessage {...messages.deleteUser} />
                  <IconWrapper>
                    <Icon name="trash" />
                  </IconWrapper>
                </DropdownListButton>
              </DropdownList>
            }
            top={up ? '-120px' : '30px'}
            left="-100px"
            color={colors.adminMenuBackground}
            handleDropdownOnClickOutside={this.handleDropdownOnClickOutside}
            dropdownOpened={optionsOpened}
            up={up}
          >
            <SIcon name="more-options" />
          </PresentationalDropdown>
        </Options>
      </tr>
    );
  }
}

export default injectIntl(UserTableRow);

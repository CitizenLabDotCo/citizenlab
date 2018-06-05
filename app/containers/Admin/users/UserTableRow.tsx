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
import StatefulDropdown from 'components/admin/MultipleSelectDropdown/StatefulDropdown';

// translation
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';


// Services
import { IUserData, deleteUser } from 'services/users';

// Styling
import styled from 'styled-components';
import { ellipsis } from 'polished';
import { colors } from 'utils/styleUtils';

const StyledCheckbox = styled(Checkbox) `
  margin-left: 16px;
`;

const StyledAvatar = styled(Avatar) `
  flex: 0 0 30px;
  height: 30px;
  margin-right: 10px;
  margin-left: 0px;
`;

const SIcon = styled(Icon) `
  width: 20px;
  height: 30px;
  fill: ${colors.adminSecondaryTextColor};
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

  &:hover, &:focus {
    outline: none;
    color: white;
    background: rgba(0, 0, 0, 0.2);
  }
`;
const IconWrapper = styled.div`
  width: 30px;
  height: 30px;
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
  font-size: 16px;
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



const SSpan = styled.span`
  ${ellipsis('300px') as any}
`;

// Typings
interface Props {
  user: IUserData;
  selected: boolean;
  toggleSelect: () => void;
  toggleAdmin: () => void;
}

interface State {
  optionsOpened: boolean;
}

class UserTableRow extends React.PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      optionsOpened: false,
    };
  }

  isUserAdmin = (user: IUserData) => {
    return isAdmin({ data: user });
  }

  handleUserSelectedOnChange = () => {
    this.props.toggleSelect();
  }

  handleAdminRoleOnChange = () => {
    this.props.toggleAdmin();
  }

  handleDeleteClick = (userId: string) => (event: React.FormEvent<any>) => {
    const deleteMessage = this.props.intl.formatMessage(messages.userDeletionConfirmation);
    event.preventDefault();

    if (window.confirm(deleteMessage)) {
      deleteUser(userId).then(res => console.log(res)).catch(err => console.log(err));
    }
  }

  renderDropdown = () => (
    <DropdownList>
      <DropdownListLink to={`profile/${this.props.user.attributes.slug}`}>
        <FormattedMessage {...messages.seeProfile} />
        <IconWrapper>
          <Icon name="eye" />
        </IconWrapper>
      </DropdownListLink>
      <DropdownListButton onClick={this.handleDeleteClick(this.props.user.id)}>
        <FormattedMessage {...messages.deleteUser} />
        <IconWrapper>
          <Icon name="trash" />
        </IconWrapper>
      </DropdownListButton>
    </DropdownList>
  )
  toggleOpened = () => {
    this.setState({ optionsOpened: !this.state.optionsOpened });
  }

  render() {
    const { user, selected } = this.props;

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
        <td><SSpan>{user.attributes.first_name} {user.attributes.last_name}</SSpan></td>
        <td><SSpan>{user.attributes.email}</SSpan></td>
        <td>{moment(user.attributes.created_at).format('LL')}</td>
        <td>
          <Toggle
            value={this.isUserAdmin(user)}
            onChange={this.handleAdminRoleOnChange}
          />
        </td>
        <td onClick={this.toggleOpened}>
          <StatefulDropdown
            content={this.renderDropdown()}
            top="30px"
            left="-105px"
            color={colors.adminMenuBackground}
          >
            <SIcon name="more-options" />
          </StatefulDropdown>
        </td>
      </tr>
    );
  }
}

export default injectIntl(UserTableRow);

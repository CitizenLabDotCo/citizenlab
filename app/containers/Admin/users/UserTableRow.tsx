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
  fill: ${colors.label};
`;

const DropdownList = styled.div`
  max-height: 210px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin: 10px;
  margin-right: 5px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const DropdownListItem = styled.button`
  align-items: center;
  color: #044D6C;
  font-size: 16px;
  font-weight: 400;
  padding: 10px;
  padding-left: 15px;
  margin-right: 5px;
  background: #fff;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  flex: 1 0;
  justify-content: space-between !important;

  &:hover, &:focus {
    outline: none;
    color: #000;
    background: #f6f6f6;
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
      <Link to={`profile/${this.props.user.attributes.slug}`}>
        <DropdownListItem>
          <FormattedMessage {...messages.seeProfile} />
        </DropdownListItem>
      </Link>
      <DropdownListItem onClick={this.handleDeleteClick(this.props.user.id)}>
        <FormattedMessage {...messages.deleteUser} />
      </DropdownListItem>
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
          >
            <SIcon name="more-options" />
          </StatefulDropdown>
        </td>
      </tr>
    );
  }
}

export default injectIntl(UserTableRow);

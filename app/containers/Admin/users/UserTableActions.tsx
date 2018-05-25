// Libraries
import React from 'react';

// Components
import Checkbox from 'components/UI/Checkbox';

// I18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';

const TableOptions = styled.div`
  display: flex;
  padding-bottom: 12px;
  margin-bottom: 30px;
  border-bottom: solid 1px #eaeaea;
`;

// Typings
interface Props {
  selectedUsers: string[] | 'none' | 'all';
  toggleSelectAll: () => void;
}

interface State {}

export default class UserTableActions extends React.PureComponent<Props, State> {

  toggleAllUsers = () => {
    this.props.toggleSelectAll();
  }

  render() {
    const { selectedUsers } = this.props;

    return (
      <TableOptions>
        <Checkbox
          label={<FormattedMessage {...messages.selectAll} />}
          value={(selectedUsers === 'all')}
          onChange={this.toggleAllUsers}
        />
      </TableOptions>
    );
  }
}

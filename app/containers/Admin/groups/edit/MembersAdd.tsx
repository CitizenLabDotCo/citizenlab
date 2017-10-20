// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// Services
import { findMembership } from 'services/groups';

// i18n
import { FormattedMessage } from 'react-intl';
import T from 'components/T';
import messages from './messages';
import localize, { injectedLocalized } from 'utils/localize';

// Components
import Button from 'components/UI/Button';
import AsyncMultipleSelect from 'components/UI/AsyncMultipleSelect';

// Style
import styled from 'styled-components';

const AddUserRow = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.colors.separation};
  border-top: 1px solid ${props => props.theme.colors.separation};
`;

// Typing
import { IOption } from 'typings';

interface Props {
  groupId: string;
}

interface State {
  selectVisible: boolean;
  selection: IOption[];
}

class MembersAdd extends React.Component<Props & injectedLocalized, State> {
  subscriptions: Rx.Subscription[];

  constructor () {
    super();

    this.state = {
      selectVisible: false,
      selection: [],
    };

    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions.push(

    );
  }

  componentWillUnmount() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
  }

  toggleSelectVisible = () => {
    this.setState({ selectVisible: !this.state.selectVisible });
  }

  getOptions = async (args) => {
    return findMembership(this.props.groupId).observable
    .map((users) => {
      return users.data.map((user) => {
        return {
          value: user.id,
          label: `${user.attributes.first_name} ${user.attributes.last_name}`
        };
      });
    })
    .toPromise();
  }

  handleChange = (value): void => {
    console.log(value);
    const { selection } = this.state;
    selection.push(value);
    this.setState({ selection });
  }

  render() {
    return (
      <AddUserRow>
        {!this.state.selectVisible &&
          <Button onClick={this.toggleSelectVisible} icon="plus-circle" style="text">
            <FormattedMessage {...messages.addUser} />
          </Button>
        }
        {this.state.selectVisible &&
          <AsyncMultipleSelect
            value={this.state.selection}
            placeholder=""
            asyncOptions={this.getOptions}
            onChange={this.handleChange}
          />
        }
      </AddUserRow>
    );
  }
}

export default localize<Props>(MembersAdd);

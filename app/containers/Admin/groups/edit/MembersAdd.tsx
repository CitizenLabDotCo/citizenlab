// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// Services
import { findMembership, addMembership, FoundUser } from 'services/groups';

// i18n
import { FormattedMessage } from 'react-intl';
import T from 'components/T';
import messages from './messages';
import localize, { injectedLocalized } from 'utils/localize';

// Components
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
import ReactSelect from 'react-select';
import Avatar from 'components/Avatar';

// Style
import styled from 'styled-components';

const AddUserButton = styled(Button)`
  padding-left: 0;
`;

const AddUserRow = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.colors.separation};
  border-top: 1px solid ${props => props.theme.colors.separation};
`;

const StyledSelect = styled(ReactSelect)`
  max-width: 300px;
`;

const StyledOption = styled.div`
  color: black;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 100%;

  &.disabled {
    color: ${props => props.theme.colors.mediumGrey};

    .email {
      color: inherit;
    }
  }
`;

const StyledAvatar = styled(Avatar)`
  flex: 0;
  height: 1rem;
  margin-right: 1rem;
`;

const OptionName = styled.div`
  flex: 1;
  margin: 0;
  overflow: hidden;

  p {
    margin: 0;
  }

  .email {
    color: ${props => props.theme.colors.label};
  }
`;

const OptionIcon = styled(Icon)`
  flex: 0 0 1rem;
  height: 1rem;
  fill: ${props => props.theme.colors.clBlue};
  margin-left: 1rem;
`;

// Typing
import { IOption } from 'typings';

interface Props {
  groupId: string;
}

interface State {
  selectVisible: boolean;
  selection: (IOption & {email: string})[];
  loading: boolean;
}

class MembersAdd extends React.Component<Props & injectedLocalized, State> {
  subscriptions: Rx.Subscription[];
  input$: Rx.Subject<string>;

  constructor () {
    super();

    this.state = {
      selectVisible: false,
      selection: [],
      loading: false,
    };

    this.subscriptions = [];
    this.input$ = new Rx.Subject<string>();
  }

  componentWillMount() {
    this.subscriptions.push(
      this.input$
      .debounceTime(300)
      .switchMap(inputValue => {
        this.setState({ loading: true });
        return findMembership(this.props.groupId, { queryParameters: { query: inputValue } }).observable;
      })
      .subscribe((usersResponse) => {
        const options = this.getOptions(usersResponse.data);
        this.setState({ selection: options, loading: false });
      })
    );
  }

  componentWillUnmount() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
  }

  toggleSelectVisible = () => {
    this.setState({ selectVisible: !this.state.selectVisible });
  }

  handleSearchChange = (inputValue) => {
    // Broadcast change in the the stream for request handling
    this.input$.next(inputValue);
    // Return new value for the component
    return inputValue;
  }

  handleSelection = (selection: IOption) => {
    if (selection && selection.value) {
      addMembership(this.props.groupId, selection.value);
    }
  }

  getOptions = (users: FoundUser[]) => {
    return users.map((user) => {
      return {
        value: user.id,
        label: `${user.attributes.first_name} ${user.attributes.last_name}`,
        email: `${user.attributes.email}`,
        disabled: user.attributes.is_member,
      };
    });
  }

  renderOption = (option) => {
    return (
      <StyledOption className={option.disabled ? 'disabled' : ''}>
        <StyledAvatar size="small" userId={option.value} />
        <OptionName>
          <p>{option.label}</p>
          <p className="email">{option.email}</p>
        </OptionName>
        {!option.disabled &&
          <OptionIcon name="plus-circle" />
        }
      </StyledOption>
    );
  }

  render() {
    return (
      <AddUserRow>
        {!this.state.selectVisible &&
          <AddUserButton onClick={this.toggleSelectVisible} icon="plus-circle" style="text">
            <FormattedMessage {...messages.addUser} />
          </AddUserButton>
        }
        {this.state.selectVisible &&
          <div>
            <StyledSelect
              autofocus={true}
              name="search-user"
              value={{}}
              isLoading={this.state.loading}
              options={this.state.selection}
              onInputChange={this.handleSearchChange}
              onChange={this.handleSelection}
              optionRenderer={this.renderOption}
            />
          </div>
        }
      </AddUserRow>
    );
  }
}

export default localize<Props>(MembersAdd);

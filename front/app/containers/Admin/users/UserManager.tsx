// Libraries
import React, { PureComponent } from 'react';
import { isArray, includes } from 'lodash-es';
import { Subscription } from 'rxjs';

// Components
import UserTable from './UserTable';
import UserTableActions from './UserTableActions';
import Error from 'components/UI/Error';
import NoUsers from './NoUsers';

// Events
import eventEmitter from 'utils/eventEmitter';
import events from './events';

// Resources
import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';
import GetAuthUser from 'resources/GetAuthUser';

// Services
import { MembershipType } from 'services/groups';

// Typings
interface InputProps {
  search: string | undefined;
  groupId?: string;
  groupType?: MembershipType;
  deleteUsersFromGroup?: (userIds: string[]) => void;
}

interface DataProps {
  users: GetUsersChildProps;
}

interface Props extends InputProps, DataProps {}

type error = {
  errorName: string;
  errorElement: JSX.Element;
};

type selectedUsersType = string[] | 'none' | 'all';

export interface State {
  selectedUsers: selectedUsersType;
  errors: error[];
}

const initialState: State = {
  selectedUsers: 'none',
  errors: [],
};

export class UserManager extends PureComponent<Props, State> {
  subscriptions: Subscription[] = [];

  constructor(props) {
    super(props);
    this.state = initialState;
  }

  // When changing group, the user changes views and expects to have a clean state
  componentDidUpdate(prevProps: Props) {
    if (this.props.groupId !== prevProps.groupId) {
      this.setState(initialState);
    }
  }

  // Listening to events coming from the different actions to print messages in case of errors
  componentDidMount() {
    this.subscriptions = [
      eventEmitter
        .observeEvent<JSX.Element>(events.userDeletionFailed)
        .subscribe(({ eventName, eventValue }) => {
          this.handleError(eventName, eventValue);
        }),
      eventEmitter
        .observeEvent<JSX.Element>(events.membershipDeleteFailed)
        .subscribe(({ eventName, eventValue }) => {
          this.handleError(eventName, eventValue);
        }),
      eventEmitter
        .observeEvent<JSX.Element>(events.membershipAddFailed)
        .subscribe(({ eventName, eventValue }) => {
          this.handleError(eventName, eventValue);
        }),
      eventEmitter
        .observeEvent<JSX.Element>(events.userRoleChangeFailed)
        .subscribe(({ eventName, eventValue }) => {
          this.handleError(eventName, eventValue);
        }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  // When an error occurs, print it for 4 seconds then remove the message from the component state
  handleError = (errorName, errorElement) => {
    this.setState({
      errors: [...this.state.errors, { errorName, errorElement }],
    });
    setTimeout(
      () =>
        this.setState({
          errors: this.state.errors.filter(
            (err) => err.errorName !== errorName
          ),
        }),
      4000
    );
  };

  toggleAllUsers = () => {
    this.setState((state) => ({
      selectedUsers: state.selectedUsers === 'all' ? 'none' : 'all',
    }));
  };

  unselectAllUsers = () => {
    this.setState({ selectedUsers: 'none' });
  };

  handleUserSelectedOnChange = (allUsersIds: string[]) => (userId: string) => {
    this.setState((state) => {
      let newSelectedUsers: string[] | 'none' | 'all' = 'none';

      if (isArray(state.selectedUsers)) {
        if (includes(state.selectedUsers, userId)) {
          const userIds = state.selectedUsers.filter((item) => item !== userId);
          newSelectedUsers = userIds.length > 0 ? userIds : 'none';
        } else {
          newSelectedUsers = [...state.selectedUsers, userId];
        }
      } else if (state.selectedUsers === 'none') {
        newSelectedUsers = [userId];
      } else if (isArray(allUsersIds)) {
        newSelectedUsers = allUsersIds
          .filter((user) => user !== userId)
          .map((user) => user);
      }

      return { selectedUsers: newSelectedUsers };
    });
  };

  render() {
    const { users, groupType, groupId, search } = this.props;
    const { selectedUsers, errors } = this.state;

    if (isArray(users.usersList) && users.usersList.length === 0) {
      return search ? (
        <NoUsers noSuchSearchResult={true} />
      ) : (
        <NoUsers groupType={groupType} />
      );
    }

    if (isArray(users.usersList) && users.usersList.length > 0) {
      const allUsersIds = users.usersList.map((user) => user.id);

      return (
        <>
          <UserTableActions
            groupType={groupType}
            groupId={groupId}
            selectedUsers={selectedUsers}
            allUsersIds={allUsersIds}
            toggleSelectAll={this.toggleAllUsers}
            unselectAll={this.unselectAllUsers}
            deleteUsersFromGroup={this.props.deleteUsersFromGroup}
          />

          {errors &&
            errors.length > 0 &&
            errors.map((err) => (
              <Error text={err.errorElement} key={err.errorName} />
            ))}

          <GetAuthUser>
            {(authUser) => (
              <UserTable
                selectedUsers={selectedUsers}
                handleSelect={this.handleUserSelectedOnChange(allUsersIds)}
                authUser={authUser}
                {...users}
              />
            )}
          </GetAuthUser>
        </>
      );
    }

    return null;
  }
}

export default (inputProps: InputProps) => (
  <GetUsers pageSize={20} {...inputProps}>
    {(users) => <UserManager {...inputProps} users={users} />}
  </GetUsers>
);

// Libraries
import React from 'react';
import { get } from 'lodash';

import { IStreamParams, IStream } from 'utils/streams';

// Services
import { IGroupMembershipsFoundUsers, IGroupMembershipsFoundUserData } from 'services/groupMemberships';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

import localize, { injectedLocalized } from 'utils/localize';

// Components
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
import { Async } from 'react-select';
import Avatar from 'components/Avatar';

// Style
import styled from 'styled-components';
import { color } from 'utils/styleUtils';

const AddUserButton = styled(Button)`
  padding-left: 0;
`;

const AddUserRow = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid ${color('separation')};
  border-top: 1px solid ${color('separation')};
`;

const StyledSelectWrapper = styled.div`
  max-width: 300px;
`;

const StyledOption = styled.div`
  display: flex;
  /* align-items: center; */
  /* justify-content: space-between; */
  max-width: 100%;

  &.disabled {
    color: ${color('mediumGrey')};

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
    color: ${color('label')};
  }
`;

const OptionIcon = styled(Icon)`
  flex: 0 0 1rem;
  height: 1rem;
  fill: ${color('clBlueDark')};
  margin-left: 1rem;
`;

// Typing
import { IOption, Message } from 'typings';

interface Props {
  resourceId: string;
  messages: {addUser: Message};
  searchFunction: (resourceId: string, streamParams: IStreamParams) => IStream<IGroupMembershipsFoundUsers>;
  addFunction: (resourceId: string, userId: string) => Promise<{}>;
}

interface State {
  selectVisible: boolean;
  selection: (IOption & {email: string})[];
  loading: boolean;
}

function isModerator(user: IGroupMembershipsFoundUserData) {
  return get(user.attributes, 'is_moderator') !== undefined;
}

class MembersAdd extends React.Component<Props & injectedLocalized, State> {
  constructor(props: Props & injectedLocalized) {
    super(props);

    this.state = {
      selectVisible: false,
      selection: [],
      loading: false,
    };
  }

  loadOptions = (inputValue) => {
    if (inputValue) {
      this.setState({ loading: true });

      return this.props.searchFunction(this.props.resourceId, {
        queryParameters: {
          search: inputValue
        }
      }).observable
      .first()
      .toPromise()
      .then((response) => {
        const options = this.getOptions(response.data);
        this.setState({ loading: false });
        return { options };
      });
    } else {
      return Promise.resolve();
    }
  }

  filterOptions = (options) => {
    // Do no filtering, just return all options
    return options;
  }

  toggleSelectVisible = () => {
    this.setState({ selectVisible: !this.state.selectVisible });
  }

  handleSelection = (selection: IOption) => {
    if (selection && selection.value) {
      this.props.addFunction(this.props.resourceId, selection.value);
    }
  }

  getOptions = (users: IGroupMembershipsFoundUserData[]) => {
    return users.map((user) => {
      return {
        value: user.id,
        label: `${user.attributes.first_name} ${user.attributes.last_name}`,
        email: `${user.attributes.email}`,
        disabled: isModerator(user) ? get(user.attributes, 'is_moderator') : get(user.attributes, 'is_member'),
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
          <AddUserButton
            onClick={this.toggleSelectVisible}
            icon="plus-circle"
            style="text"
            circularCorners={false}
          >
            <FormattedMessage {...this.props.messages.addUser} />
          </AddUserButton>
        }
        {this.state.selectVisible &&
          <StyledSelectWrapper>
            <Async
              autofocus={true}
              name="search-user"
              loadOptions={this.loadOptions}
              isLoading={this.state.loading}
              onChange={this.handleSelection}
              optionRenderer={this.renderOption}
              filterOptions={this.filterOptions}
            />
          </StyledSelectWrapper>
        }
      </AddUserRow>
    );
  }
}

export default localize<Props>(MembersAdd);

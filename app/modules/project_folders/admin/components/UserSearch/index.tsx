// Libraries
import React, { PureComponent } from 'react';
import { get } from 'lodash-es';
import { first } from 'rxjs/operators';
import { isNilOrError, isNonEmptyString } from 'utils/helperUtils';

// Services
import { findMembership, addMembership } from 'services/moderators';
import { IGroupMembershipsFoundUserData } from 'services/groupMemberships';

// Resources
import { GetModeratorsChildProps } from 'resources/GetModerators';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// Components
import Button from 'components/UI/Button';
import AsyncSelect from 'react-select/async';

// Style
import styled from 'styled-components';
import selectStyles from 'components/UI/MultipleSelect/styles';

// Typings
import { IOption } from 'typings';

const Container = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const SelectGroupsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  align-items: center;
  margin-bottom: 30px;
`;

const StyledAsyncSelect = styled(AsyncSelect)`
  min-width: 300px;
`;

const AddGroupButton = styled(Button)`
  flex-grow: 0;
  flex-shrink: 0;
  margin-left: 20px;
`;

interface Props {
  projectId: string;
  moderators: GetModeratorsChildProps;
}

interface State {
  selection: IOption[];
  loading: boolean;
  processing: boolean;
  searchInput: string;
}

function isModerator(user: IGroupMembershipsFoundUserData) {
  return get(user.attributes, 'is_moderator') !== undefined;
}

class MembersAdd extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      selection: [],
      loading: false,
      processing: false,
      searchInput: '',
    };
  }

  getOptions = (users: IGroupMembershipsFoundUserData[]) => {
    return users
      .filter((user) => {
        let userIsNotYetModerator = true;
        const { moderators } = this.props;

        if (!isNilOrError(moderators)) {
          moderators.forEach((moderator) => {
            if (moderator.id === user.id) {
              userIsNotYetModerator = false;
            }
          });
        }

        return userIsNotYetModerator;
      })
      .map((user) => {
        return {
          value: user.id,
          label: `${user.attributes.first_name} ${user.attributes.last_name}`,
          email: `${user.attributes.email}`,
          disabled: isModerator(user)
            ? get(user.attributes, 'is_moderator')
            : get(user.attributes, 'is_member'),
        };
      });
  };

  loadOptions = (inputValue: string, callback) => {
    if (inputValue) {
      this.setState({ loading: true });

      findMembership(this.props.projectId, {
        queryParameters: {
          search: inputValue,
        },
      })
        .observable.pipe(first())
        .subscribe((response) => {
          const options = this.getOptions(response.data);
          this.setState({ loading: false });
          callback(options);
        });
    }
  };

  handleOnChange = async (selection: IOption[]) => {
    this.setState({ selection });
  };

  handleOnAddModeratorsClick = async () => {
    const { selection } = this.state;

    if (selection && selection.length > 0) {
      this.setState({ processing: true });
      const promises = selection.map((item) =>
        addMembership(this.props.projectId, item.value)
      );

      try {
        await Promise.all(promises);
        this.setState({ selection: [], processing: false });
      } catch {
        this.setState({ selection: [], processing: false });
      }
    }
  };

  setSearchInput = (inputValue: string) => {
    this.setState({ searchInput: inputValue });
  };

  noOptionsMessage = (inputValue: string) => {
    if (!isNonEmptyString(inputValue)) {
      return null;
    }
    return this.props.intl.formatMessage(messages.noOptions);
  };

  render() {
    const { selection, searchInput } = this.state;
    const { formatMessage } = this.props.intl;

    const isDropdownIconHidden = !isNonEmptyString(searchInput);
    return (
      <Container>
        <SelectGroupsContainer>
          <StyledAsyncSelect
            name="search-user"
            isMulti={true}
            cacheOptions={false}
            defaultOptions={false}
            loadOptions={this.loadOptions}
            isLoading={this.state.loading}
            isDisabled={this.state.processing}
            value={selection}
            onChange={this.handleOnChange}
            placeholder={formatMessage(messages.searchUsers)}
            styles={selectStyles}
            noOptionsMessage={this.noOptionsMessage}
            onInputChange={this.setSearchInput}
            components={
              isDropdownIconHidden && {
                DropdownIndicator: () => null,
              }
            }
          />

          <AddGroupButton
            text={formatMessage(messages.addModerators)}
            buttonStyle="cl-blue"
            icon="plus-circle"
            padding="13px 16px"
            onClick={this.handleOnAddModeratorsClick}
            disabled={!selection || selection.length === 0}
            processing={this.state.processing}
          />
        </SelectGroupsContainer>
      </Container>
    );
  }
}

export default injectIntl<Props>(MembersAdd);

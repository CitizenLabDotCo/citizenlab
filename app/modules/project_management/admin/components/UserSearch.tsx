// Libraries
import React, { memo, useState } from 'react';
import { get } from 'lodash-es';
import { first } from 'rxjs/operators';
import { isNilOrError, isNonEmptyString } from 'utils/helperUtils';

// Services
import {
  findMembership,
  addMembership,
} from 'modules/project_management/services/projectModerators';
import { IGroupMembershipsFoundUserData } from 'services/groupMemberships';

// hooks
import useProjectModerators from 'modules/project_management/hooks/useProjectModerators';

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
}

function isModerator(user: IGroupMembershipsFoundUserData) {
  return get(user.attributes, 'is_moderator') !== undefined;
}

const UserSearch = memo(
  ({ projectId, intl: { formatMessage } }: Props & InjectedIntlProps) => {
    const [selection, setSelection] = useState<IOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const moderators = useProjectModerators(projectId);

    const getOptions = (users: IGroupMembershipsFoundUserData[]) => {
      return users
        .filter((user) => {
          let userIsNotYetModerator = true;

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

    const loadOptions = (inputValue: string, callback) => {
      if (inputValue) {
        setLoading(true);

        findMembership(projectId, {
          queryParameters: {
            search: inputValue,
          },
        })
          .observable.pipe(first())
          .subscribe((response) => {
            const options = getOptions(response.data);
            setLoading(false);
            callback(options);
          });
      }
    };

    const handleOnChange = async (selection: IOption[]) => {
      setSelection(selection);
    };

    const handleOnAddModeratorsClick = async () => {
      if (selection && selection.length > 0) {
        setProcessing(true);
        const promises = selection.map((item) =>
          addMembership(projectId, item.value)
        );

        try {
          await Promise.all(promises);
          setSelection([]);
          setProcessing(false);
        } catch {
          setSelection([]);
          setProcessing(false);
        }
      }
    };

    const handleSearchInputOnChange = (inputValue: string) => {
      setSearchInput(inputValue);
    };

    const noOptionsMessage = (inputValue: string) => {
      if (!isNonEmptyString(inputValue)) {
        return null;
      }
      return formatMessage(messages.noOptions);
    };

    const isDropdownIconHidden = !isNonEmptyString(searchInput);

    return (
      <Container>
        <SelectGroupsContainer>
          <StyledAsyncSelect
            name="search-user"
            isMulti={true}
            cacheOptions={false}
            defaultOptions={false}
            loadOptions={loadOptions}
            isLoading={loading}
            isDisabled={processing}
            value={selection}
            onChange={handleOnChange}
            placeholder={formatMessage(messages.searchUsers)}
            styles={selectStyles}
            noOptionsMessage={noOptionsMessage}
            onInputChange={handleSearchInputOnChange}
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
            onClick={handleOnAddModeratorsClick}
            disabled={!selection || selection.length === 0}
            processing={processing}
          />
        </SelectGroupsContainer>
      </Container>
    );
  }
);

export default injectIntl(UserSearch);

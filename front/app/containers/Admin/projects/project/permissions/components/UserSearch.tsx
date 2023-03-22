// Libraries
import React, { memo, useState } from 'react';
import { first } from 'rxjs/operators';
import { isNilOrError, isNonEmptyString } from 'utils/helperUtils';

// Services
import { findMembership, addMembership } from 'services/projectModerators';
import { IGroupMembershipsFoundUserData } from 'services/groupMemberships';

// hooks
import useProjectModerators from 'hooks/useProjectModerators';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// Components
import Button from 'components/UI/Button';
import AsyncSelect from 'react-select/async';
import AddCollaboratorsModal from 'components/admin/AddCollaboratorsModal';
import { Box } from '@citizenlab/cl2-component-library';

// Style
import styled from 'styled-components';
import selectStyles from 'components/UI/MultipleSelect/styles';

// Typings
import { IOption } from 'typings';

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
  return user.attributes['is_moderator'] !== undefined;
}

interface UserOption extends IOption {
  email: string;
}

const UserSearch = memo(({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const [selection, setSelection] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const moderators = useProjectModerators(projectId);
  const [showModal, setShowModal] = useState(false);
  const closeModal = () => {
    setShowModal(false);
  };
  const openModal = () => {
    setShowModal(true);
  };

  const getOptions = (users: IGroupMembershipsFoundUserData[]) => {
    return users
      .filter((user) => {
        // Only if user is not an admin
        // And if user is not already a project moderator
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
            ? user.attributes['is_moderator']
            : user.attributes['is_member'],
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

  const handleOnChange = async (selection: UserOption[]) => {
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
    <Box width="100%" mb="20px">
      <Box
        width="100%"
        display="flex"
        flexDirection="row"
        alignItems="center"
        mb="30px"
      >
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
          onClick={openModal}
          disabled={!selection || selection.length === 0}
          processing={processing}
        />
      </Box>
      <AddCollaboratorsModal
        addModerators={handleOnAddModeratorsClick}
        showModal={showModal}
        closeModal={closeModal}
        noOfCollaboratorSeatsToAdd={selection.length}
      />
    </Box>
  );
});

export default UserSearch;

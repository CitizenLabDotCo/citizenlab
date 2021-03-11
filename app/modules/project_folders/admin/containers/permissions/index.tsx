import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { WithRouterProps } from 'react-router';
import AsyncSelect from 'react-select/async';
import { first } from 'rxjs/operators';
import { IOption } from 'typings';
import { isProjectFolderModerator } from '../../../permissions/roles';

// utils
import { isNilOrError, isNonEmptyString } from 'utils/helperUtils';

// services
import { useProjectFolderModerators } from 'modules/project_folders/hooks';
import { IUsers, IUserData, usersStream } from 'services/users';
import useAuthUser from 'hooks/useAuthUser';
import {
  addFolderModerator,
  deleteFolderModerator,
} from 'modules/project_folders/services/projectFolderModerators';

// i18n
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

// components
import { SubSectionTitle } from 'components/admin/Section';
import { IconTooltip } from 'cl2-component-library';
import Button from 'components/UI/Button';
import { List, Row } from 'components/admin/ResourceList';
import Avatar from 'components/Avatar';
import selectStyles from 'components/UI/MultipleSelect/styles';

const Container = styled.div`
  width: 100%;
  margin-bottom: 25px;
`;

const StyledA = styled.a`
  &:hover {
    text-decoration: underline;
  }
`;

const UserSelectSection = styled.section`
  display: flex;
  margin-bottom: 12px;
`;

const UserSelectSelect = styled(AsyncSelect)`
  min-width: 300px;
`;

const UserSelectButton = styled(Button)`
  margin-left: 12px;
`;

const FolderPermissions = ({
  params: { projectFolderId },
  intl: { formatMessage },
}: WithRouterProps & InjectedIntlProps) => {
  const authUser = useAuthUser();
  const folderModerators = useProjectFolderModerators(projectFolderId);

  const [selectedUserOptions, setSelectedUserOptions] = useState<IOption[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  const handleFolderModeratorInputChange = (value: string) => {
    setSearchInput(value);
  };

  const handleFolderModeratorsChange = async (selection: IOption[]) => {
    setSelectedUserOptions(selection);
  };

  const handleOnAddFolderModeratorsClick = useCallback(() => {
    setProcessing(true);
    selectedUserOptions.forEach(({ value: userId }) =>
      addFolderModerator(projectFolderId, userId)
    );
    setProcessing(false);
    setSelectedUserOptions([]);
  }, [selectedUserOptions]);

  const handleDeleteFolderModeratorClick = (
    projectFolderId: string,
    moderatorId: string
  ) => () => {
    deleteFolderModerator(projectFolderId, moderatorId);
  };

  const loadUsers = (inputValue: string, callback) => {
    if (inputValue) {
      setLoading(true);

      usersStream({
        queryParameters: {
          search: inputValue,
        },
      })
        .observable.pipe(first())
        .subscribe((response) => {
          setLoading(false);
          callback(getFolderModeratorOptions(response));
        });
    }
  };

  const getFolderModeratorOptions = (users: IUsers) => {
    // note: this typing info of users above is not correc
    if (!isNilOrError(users)) {
      return users.data
        .filter(
          (user: IUserData) => !isProjectFolderModerator(user, projectFolderId)
        )
        .map((user: IUserData) => {
          return {
            value: user.id,
            label: `${userName(user)} (${user.attributes.email})`,
            email: `${user.attributes.email}`,
            disabled: isProjectFolderModerator(user),
          };
        });
    }

    return [];
  };

  const noOptionsMessage = () => {
    if (isNonEmptyString(searchInput)) {
      return formatMessage(messages.noMatch);
    }

    return null;
  };

  const isDropdownIconHidden = useMemo(() => !isNonEmptyString(searchInput), [
    searchInput,
  ]);

  const userName = (user: IUserData) => {
    return `${user.attributes.first_name} ${user.attributes.last_name}`;
  };

  return (
    <Container>
      <SubSectionTitle>
        <FormattedMessage {...messages.folderManagerSectionTitle} />
        <IconTooltip
          content={
            <FormattedMessage
              {...messages.folderManagerTooltip}
              values={{
                projectManagementInfoCenterLink: (
                  <StyledA
                    href={formatMessage(messages.moreInfoFolderManagerLink)}
                    target="_blank"
                  >
                    <FormattedMessage
                      {...messages.projectManagementInfoCenterLinkText}
                    />
                  </StyledA>
                ),
              }}
            />
          }
        />
      </SubSectionTitle>

      <UserSelectSection>
        <UserSelectSelect
          name="search-user"
          isMulti={true}
          cacheOptions={false}
          defaultOptions={false}
          loadOptions={loadUsers}
          isLoading={loading}
          isDisabled={processing}
          value={selectedUserOptions}
          onChange={handleFolderModeratorsChange}
          placeholder={formatMessage(messages.searchFolderManager)}
          styles={selectStyles}
          noOptionsMessage={noOptionsMessage}
          onInputChange={handleFolderModeratorInputChange}
          components={isDropdownIconHidden && { DropdownIndicator: () => null }}
        />
        <UserSelectButton
          text={formatMessage(messages.addFolderManager)}
          buttonStyle="cl-blue"
          icon="plus-circle"
          padding="13px 16px"
          onClick={handleOnAddFolderModeratorsClick}
          disabled={!selectedUserOptions || selectedUserOptions.length === 0}
          processing={processing}
        />
      </UserSelectSection>

      <List>
        <>
          {!isNilOrError(folderModerators) &&
            !isNilOrError(authUser) &&
            folderModerators.map((folderModerator, index) => (
              <Row
                key={folderModerator.id}
                isLastItem={index === folderModerators.length - 1}
              >
                <Avatar userId={folderModerator.id} size={30} />
                <p className="expand">{userName(folderModerator)}</p>
                <p className="expand">{folderModerator.attributes.email}</p>
                <Button
                  onClick={handleDeleteFolderModeratorClick(
                    projectFolderId,
                    folderModerator.id
                  )}
                  buttonStyle="text"
                  icon="delete"
                  disabled={
                    !isNilOrError(authUser) &&
                    authUser.id === folderModerator.id
                  }
                >
                  <FormattedMessage {...messages.deleteFolderManagerLabel} />
                </Button>
              </Row>
            ))}
        </>
      </List>
    </Container>
  );
};

export default injectIntl(FolderPermissions);

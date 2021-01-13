import React, { ReactElement, useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { WithRouterProps } from 'react-router';
import AsyncSelect from 'react-select/async';
import { first } from 'rxjs/operators';
import { IOption } from 'typings';

// utils
import { isNilOrError, isNonEmptyString } from 'utils/helperUtils';

// services
import { useProjectFolderModerators } from 'modules/project_folders/hooks';
import { IUsers, IUserData, usersStream } from 'services/users';
import useAuthUser from 'hooks/useAuthUser';

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
  params,
  intl,
}: WithRouterProps & InjectedIntlProps): ReactElement => {
  const { projectFolderId } = params;
  const { formatMessage } = intl;
  const authUser = useAuthUser();

  const {
    moderators,
    isModerator,
    isNotModerator,
    addModerator,
    deleteModerator,
  } = useProjectFolderModerators(projectFolderId);

  const [selectedUserOptions, setSelectedUserOptions] = useState<IOption[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  const handleModeratorInputChange = (value: string) => {
    setSearchInput(value);
  };

  const handleModeratorsChange = async (selection: IOption[]) => {
    setSelectedUserOptions(selection);
  };

  const handleOnAddModeratorsClick = useCallback(() => {
    setProcessing(true);
    selectedUserOptions.forEach(({ value: userId }) =>
      addModerator(projectFolderId, userId)
    );
    setProcessing(false);
    setSelectedUserOptions([]);
  }, [selectedUserOptions]);

  const handleDeleteModeratorClick = (
    projectFolderId: string,
    moderatorId: string
  ) => () => {
    deleteModerator(projectFolderId, moderatorId);
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
          callback(getOptions(response));
        });
    }
  };

  const isNotModeratorOrAuthUser = (user: IUserData) => {
    if (!isNilOrError(authUser)) {
      return isNotModerator(user) && user.id !== authUser.data.id;
    }

    return isNotModerator(user);
  };

  const getOptions = (users: IUsers) => {
    if (!isNilOrError(users)) {
      return users.data.filter(isNotModeratorOrAuthUser).map((user) => {
        return {
          value: user.id,
          label: `${userName(user)} (${user.attributes.email})`,
          email: `${user.attributes.email}`,
          disabled: isModerator(user),
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
          onChange={handleModeratorsChange}
          placeholder={formatMessage(messages.searchFolderManager)}
          styles={selectStyles}
          noOptionsMessage={noOptionsMessage}
          onInputChange={handleModeratorInputChange}
          components={isDropdownIconHidden && { DropdownIndicator: () => null }}
        />
        <UserSelectButton
          text={formatMessage(messages.addFolderManager)}
          buttonStyle="cl-blue"
          icon="plus-circle"
          padding="13px 16px"
          onClick={handleOnAddModeratorsClick}
          disabled={!selectedUserOptions || selectedUserOptions.length === 0}
          processing={processing}
        />
      </UserSelectSection>

      <List>
        <>
          {!isNilOrError(moderators) &&
            !isNilOrError(authUser) &&
            moderators.data.map((moderator, index) => (
              <Row
                key={moderator.id}
                isLastItem={index === moderators.data.length - 1}
              >
                <Avatar userId={moderator.id} size="30px" />
                <p className="expand">{userName(moderator)}</p>
                <p className="expand">{moderator.attributes.email}</p>
                <Button
                  onClick={handleDeleteModeratorClick(
                    projectFolderId,
                    moderator.id
                  )}
                  buttonStyle="text"
                  icon="delete"
                  disabled={
                    !isNilOrError(authUser) && authUser.data.id === moderator.id
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

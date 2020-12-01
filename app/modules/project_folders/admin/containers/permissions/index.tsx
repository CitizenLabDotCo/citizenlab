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
import { GetAuthUserChildProps, withAuthUser } from 'resources/GetAuthUser';

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

interface Props {
  authUser: GetAuthUserChildProps;
}

function FolderPermissions({
  params,
  intl,
  authUser,
}: Props & WithRouterProps & InjectedIntlProps): ReactElement {
  const { projectFolderId } = params;
  const { formatMessage } = intl;

  const {
    moderators,
    isModerator,
    isNotModerator,
    addModerator,
    deleteModerator,
  } = useProjectFolderModerators(projectFolderId);

  const [selectedUserOptions, setSelectedUserOptions] = useState<IOption[]>([]);
  const [userOptions, setUserOptions] = useState<IUserData[]>([]);
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
          setUserOptions(response.data);
          setLoading(false);
          callback(getOptions(response));
        });
    }
  };

  const getOptions = (users: IUsers) => {
    if (!isNilOrError(users)) {
      return users.data.filter(isNotModerator).map((user) => {
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

  const noOptionsMessage = useCallback(() => {
    if (isNonEmptyString(searchInput)) {
      return formatMessage(messages.noOptions);
    }

    return formatMessage(messages.typeUserName);
  }, [searchInput]);

  const isDropdownIconHidden = useMemo(() => !isNonEmptyString(searchInput), [
    searchInput,
  ]);

  const selectedUsers = useMemo(() => {
    if (!isNilOrError(userOptions) && !isNilOrError(selectedUserOptions)) {
      return selectedUserOptions.map(({ value }) =>
        userOptions.find((moderator) => value === moderator.id)
      );
    }

    return [];
  }, [selectedUserOptions]);

  const userName = (user: IUserData) => {
    return `${user.attributes.first_name} ${user.attributes.last_name}`;
  };

  return (
    <Container>
      <SubSectionTitle>
        <FormattedMessage {...messages.moderatorsSectionTitle} />
        <IconTooltip
          content={
            <FormattedMessage
              {...messages.moderatorsTooltip}
              values={{
                moderationInfoCenterLink: (
                  <StyledA
                    href={formatMessage(messages.moreInfoModeratorLink)}
                    target="_blank"
                  >
                    <FormattedMessage
                      {...messages.moderationInfoCenterLinkText}
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
          placeholder={formatMessage(messages.searchUsers)}
          styles={selectStyles}
          noOptionsMessage={noOptionsMessage}
          onInputChange={handleModeratorInputChange}
          components={isDropdownIconHidden && { DropdownIndicator: () => null }}
        />
        <UserSelectButton
          text={formatMessage(messages.addModerators)}
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
                isLastItem={index === selectedUsers.length - 1}
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
                  disabled={authUser.id === moderator.id}
                >
                  <FormattedMessage {...messages.deleteModeratorLabel} />
                </Button>
              </Row>
            ))}
        </>
      </List>
    </Container>
  );
}

export default injectIntl(withAuthUser(FolderPermissions));

import React, { ReactElement } from 'react';
import { adopt } from 'react-adopt';
import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';
import ReactSelect, { OptionTypeBase } from 'react-select';
import selectStyles from 'components/UI/MultipleSelect/styles';
import { Icon } from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import styled from 'styled-components';
import { IUserData } from 'services/users';
import useUser from 'hooks/useUser';
import Button from 'components/UI/Button';

interface DataProps {
  users: GetUsersChildProps;
}

interface Props {
  onChange: (id?: string) => void;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id: string;
  inputId: string;
}

export const AvatarImage = styled.img`
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  fill: #596b7a;
  padding: 15px;
  border-radius: 50%;
  background: white;
  margin-right: 0.5rem;
`;

const AvatarIcon = styled(Icon)`
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  background: white;
  border-radius: 50%;
  fill: #596b7a;
  margin-right: 0.5rem;
`;

const UserOption = styled.div`
  display: flex;
  align-items: center;
`;

const UserSelect = ({
  users,
  onChange,
  value,
  placeholder,
  disabled = false,
  className,
  id,
  inputId,
}: DataProps & Props): ReactElement => {
  const canLoadMore = users.lastPage !== users.currentPage;
  const selectedUser = useUser({ userId: value });
  const usersList: IUserData[] = Array.isArray(users.usersList)
    ? users.usersList
    : [];

  const handleChange = (option: OptionTypeBase, { action }) => {
    if (action === 'clear') {
      handleClear();
    } else if (action === 'select-option' && option.value !== 'loadMore') {
      onChange(option.id);
    } else if (action === 'select-option' && option.value === 'loadMore') {
      handleLoadMore();
    }
  };

  const handleInputChange = debounce((searchTerm) => {
    users.onChangeSearchTerm(searchTerm);
  }, 500);

  const handleMenuScrollToBottom = () => {
    handleLoadMore();
  };

  const handleLoadMore = () => {
    users.onLoadMore();
  };

  const Avatar = ({ userId }) => {
    const user = usersList.find((user) => user.id === userId);
    const avatarSrc =
      user?.attributes?.avatar?.medium || user?.attributes?.avatar?.small;
    return (
      <>
        {avatarSrc ? (
          <AvatarImage className="avatarImage" src={avatarSrc} alt="" />
        ) : (
          <AvatarIcon className="avatarIcon" name="user" />
        )}
      </>
    );
  };

  const getOptionLabel = (option: OptionTypeBase): any => {
    if (option.value === 'loadMore' && canLoadMore) {
      return (
        <Button
          onClick={handleLoadMore}
          processing={users.isLoading}
          icon="showMore"
          buttonStyle="text"
          padding="0px"
        />
      );
    } else if (option.attributes) {
      return (
        <UserOption>
          <Avatar userId={option.value} />
          {option.attributes.last_name}, {option.attributes.first_name} (
          {option.attributes.email})
        </UserOption>
      );
    }
  };

  const handleClear = () => {
    onChange();
  };

  const getOptionId = (option: OptionTypeBase) => option.id;

  const filterOption = () => true;

  const options = canLoadMore
    ? [...usersList, { value: 'loadMore' }]
    : usersList;

  return (
    <ReactSelect
      id={id}
      inputId={inputId}
      className={className}
      isSearchable
      blurInputOnSelect
      backspaceRemovesValue={false}
      menuShouldScrollIntoView={false}
      isClearable
      filterOption={filterOption}
      value={selectedUser}
      placeholder={placeholder as string}
      options={options}
      getOptionValue={getOptionId}
      getOptionLabel={getOptionLabel}
      onChange={handleChange}
      onInputChange={handleInputChange}
      isDisabled={disabled}
      menuPlacement="auto"
      styles={selectStyles}
      onMenuScrollToBottom={handleMenuScrollToBottom}
      onMenuOpen={handleClear}
    />
  );
};

const Data = adopt<DataProps>({
  users: <GetUsers pageSize={5} sort="last_name" />,
});

export default (props) => (
  <Data>{(dataProps) => <UserSelect {...dataProps} {...props} />}</Data>
);

import React from 'react';
import { adopt } from 'react-adopt';
import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';
import ReactSelect, { OptionTypeBase } from 'react-select';
import selectStyles from 'components/UI/MultipleSelect/styles';
import { Box } from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import styled from 'styled-components';
import { IUserData } from 'services/users';
import Button from 'components/UI/Button';
import Avatar from './Avatar';

interface DataProps {
  users: GetUsersChildProps;
}

interface InputProps {
  onChange: (id?: string) => void;
  value: string | null;
  placeholder: string;
  className?: string;
  id: string;
  inputId: string;
}

interface Props extends DataProps, InputProps {}

const UserOption = styled.div`
  display: flex;
  align-items: center;
`;

const UserSelect = ({
  users,
  onChange,
  value,
  placeholder,
  className,
  id,
  inputId,
}: DataProps & Props) => {
  const canLoadMore = users.lastPage !== users.currentPage;
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

  const getOptionLabel = (option: OptionTypeBase) => {
    if (option.value === 'loadMore' && canLoadMore) {
      return (
        <Button
          onClick={handleLoadMore}
          processing={users.isLoading}
          icon="refresh"
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

    return null;
  };

  const handleClear = () => {
    onChange();
  };

  const getOptionId = (option: OptionTypeBase) => option.id;

  return (
    <Box id="e2e-user-select">
      <ReactSelect
        id={id}
        inputId={inputId}
        className={className}
        isSearchable
        blurInputOnSelect
        backspaceRemovesValue={false}
        menuShouldScrollIntoView={false}
        isClearable
        filterOption={() => true}
        value={value}
        placeholder={placeholder}
        options={
          canLoadMore ? [...usersList, { value: 'loadMore' }] : usersList
        }
        getOptionValue={getOptionId}
        getOptionLabel={getOptionLabel}
        onChange={handleChange}
        onInputChange={handleInputChange}
        menuPlacement="auto"
        styles={selectStyles}
        onMenuScrollToBottom={handleMenuScrollToBottom}
        onMenuOpen={handleClear}
      />
    </Box>
  );
};

const Data = adopt<DataProps>({
  users: <GetUsers pageSize={5} sort="last_name" />,
});

export default (props: InputProps) => (
  <Data>
    {(dataProps: DataProps) => <UserSelect {...dataProps} {...props} />}
  </Data>
);

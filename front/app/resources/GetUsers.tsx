import { IUserData, IQueryParameters } from 'api/users/types';
import useInfiniteUsers from 'api/users/useInfiniteUsers';
import { useState } from 'react';

type children = (renderProps: GetUsersChildProps) => JSX.Element | null;

type Props = IQueryParameters & {
  children?: children;
};

export type GetUsersChildProps = {
  usersList: IUserData[] | undefined;
  isLoading: boolean;
  onLoadMore: () => void;
  hasNextPage?: boolean;
  onChangeSearchTerm: (search: string) => void;
};

const GetUsers = ({ children, ...queryParameters }: Props) => {
  const [searchValue, setSearchValue] = useState('');
  const {
    data: users,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteUsers({ ...queryParameters, search: searchValue });

  const onChangeSearchTerm = (search: string) => {
    setSearchValue(search);
  };

  const usersList = users?.pages.flatMap((page) => page.data) || [];
  return (children as children)({
    usersList,
    isLoading,
    onLoadMore: fetchNextPage,
    hasNextPage,
    onChangeSearchTerm,
  });
};

export default GetUsers;

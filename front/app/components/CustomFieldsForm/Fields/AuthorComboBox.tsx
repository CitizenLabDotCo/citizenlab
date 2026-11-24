import React, { ReactNode, useEffect, useMemo, useState } from 'react';

import { debounce } from 'lodash-es';

import ComboBox from 'design-system/ComboBox';
import IconButton from 'design-system/IconButton';
import { ListBoxOption } from 'design-system/ListBox';

import { IUserData } from 'api/users/types';
import useInfiniteUsers from 'api/users/useInfiniteUsers';
import useUserById from 'api/users/useUserById';

import formMessages from 'components/UI/FormComponents/messages';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import styles from './AuthorField.module.css';
import 'design-system/tokens.css';

interface Props {
  placeholder: string;
  value: string | null;
  errorMessage?: ReactNode;
  onChange: (userId: string | null) => void;
}

const optionLabel = ({ attributes }: IUserData) => {
  const { last_name, first_name, email } = attributes;
  return `${last_name}, ${first_name}${email ? ` (${email})` : ''}`;
};

const AuthorComboBox = ({
  placeholder,
  value,
  errorMessage,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const [search, setSearch] = useState('');
  const { data: users } = useInfiniteUsers({
    pageSize: 5,
    sort: 'last_name',
    search,
  });
  const { data: selectedUser } = useUserById(value);

  const updateSearch = useMemo(() => debounce(setSearch, 500), []);
  useEffect(() => () => updateSearch.cancel(), [updateSearch]);

  const usersList = users?.pages.flatMap((page) => page.data) ?? [];
  const selected = value ? selectedUser?.data : undefined;
  // The selected user has to be in the list for its name to show in the input.
  const items =
    selected && !usersList.some((user) => user.id === selected.id)
      ? [selected, ...usersList]
      : usersList;

  return (
    <ComboBox
      label={
        <span className={styles.label}>
          {formatMessage(messages.authorFieldLabel)}
          <IconButton
            icon="info-16"
            size={24}
            aria-label={formatMessage(messages.adminFieldTooltip)}
          />
          ({formatMessage(formMessages.optional)})
        </span>
      }
      placeholder={placeholder}
      size={32}
      items={items}
      value={selected?.id ?? null}
      errorMessage={errorMessage}
      isInvalid={!!errorMessage}
      onChange={(key) => onChange(typeof key === 'string' ? key : null)}
      onInputChange={(text) => {
        // Picking a user writes their label into the input; that is not a search.
        if (selected && text === optionLabel(selected)) return;
        updateSearch(text);
      }}
    >
      {(user: IUserData) => (
        <ListBoxOption
          id={user.id}
          data-cy={`e2e-user-${user.attributes.email}`}
        >
          {optionLabel(user)}
        </ListBoxOption>
      )}
    </ComboBox>
  );
};

export default AuthorComboBox;

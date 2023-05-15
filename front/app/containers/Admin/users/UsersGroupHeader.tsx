import React, { memo } from 'react';

import styled from 'styled-components';
import { Multiloc } from 'typings';
import Button from 'components/UI/Button';
import T from 'components/T';
import Outlet from 'components/Outlet';
import { MembershipType } from 'api/groups/types';
import { FormattedMessage } from 'utils/cl-intl';

import {
  FirstRow,
  Spacer,
  StyledSearchInput,
  TextAndButtons,
} from './UsersHeader';
import messages from './messages';

const OnlyRow = styled(FirstRow)`
  min-height: 105px;
  margin-bottom: 30px;
  display: flex;
  align-items: flex-start;
`;

const Buttons = styled.div`
  display: inline-flex;
  align-items: center;
  margin-top: 5px;
  transform: scale(0.9);
`;

interface Props {
  title?: Multiloc;
  groupType?: MembershipType;
  onEdit?: () => void;
  onDelete?: () => void;
  onSearch: (newValue: string) => void;
}
const UsersGroupHeader = memo(
  ({ title, groupType, onEdit, onDelete, onSearch }: Props) => {
    return (
      <OnlyRow>
        {groupType && (
          <Outlet
            id="app.containers.Admin.users.UsersHeader.icon"
            type={groupType}
          />
        )}
        <TextAndButtons>
          <T as="h1" value={title} />
          <Buttons>
            <Button
              hiddenText={<FormattedMessage {...messages.editGroup} />}
              padding=".65em"
              icon="edit"
              buttonStyle="secondary"
              onClick={onEdit}
            />
            <Button
              hiddenText={<FormattedMessage {...messages.deleteGroup} />}
              padding=".65em"
              icon="delete"
              buttonStyle="text"
              onClick={onDelete}
            />
          </Buttons>
        </TextAndButtons>
        <Spacer />
        <StyledSearchInput
          onChange={onSearch}
          // Not important here. Requires quite some refactoring
          // to get users here in a nice and consistent manner.
          // This a11y_... prop needs to be a required one
          // so we always have it on the citizen side.
          // Whenever this components is touched,
          // you can give it the right value (number of users resulting from the search) here.
          a11y_numberOfSearchResults={0}
        />
      </OnlyRow>
    );
  }
);

export default UsersGroupHeader;

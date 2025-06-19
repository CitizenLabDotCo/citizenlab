import React, { memo } from 'react';

import styled from 'styled-components';
import { Multiloc } from 'typings';

import { MembershipType } from 'api/groups/types';

import Outlet from 'components/Outlet';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import { FirstRow, TextAndButtons } from './UsersHeader';

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
}
const UsersGroupHeader = memo(
  ({ title, groupType, onEdit, onDelete }: Props) => {
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
            <ButtonWithLink
              hiddenText={<FormattedMessage {...messages.editGroup} />}
              padding=".65em"
              icon="edit"
              buttonStyle="secondary-outlined"
              onClick={onEdit}
            />
            <ButtonWithLink
              hiddenText={<FormattedMessage {...messages.deleteGroup} />}
              padding=".65em"
              icon="delete"
              buttonStyle="text"
              onClick={onDelete}
            />
          </Buttons>
        </TextAndButtons>
      </OnlyRow>
    );
  }
);

export default UsersGroupHeader;

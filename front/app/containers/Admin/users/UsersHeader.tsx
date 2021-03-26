// Libraries
import React, { memo } from 'react';
import { Multiloc } from 'typings';

// Components
import Button from 'components/UI/Button';
import T from 'components/T';
import SearchInput from 'components/UI/SearchInput';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import Outlet from 'components/Outlet';
import { MembershipType } from 'services/groups';

const TitleWrapper = styled.div`
  min-height: 105px;

  h2 {
    padding: 0;
    margin: 10px;
    margin-top: 20px;
    margin-bottom: 30px;
    color: ${colors.adminSecondaryTextColor};
    font-size: ${fontSizes.base}px;
    font-weight: 400;
  }
`;

const FirstRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  margin-left: 10px;
`;

const OnlyRow = styled(FirstRow)`
  min-height: 105px;
  margin-bottom: 30px;
  display: flex;
  align-items: flex-start;
`;

const Spacer = styled.div`
  flex: 1;
`;

const TextAndButtons = styled.div`
  h1 {
    display: inline;
    padding: 0;
    margin: 0;
    margin-right: 10px;
    font-weight: 600;
  }
`;

const Buttons = styled.div`
  display: inline-flex;
  align-items: center;
  margin-top: 5px;
  transform: scale(0.9);
`;

const StyledSearchInput = styled(SearchInput)`
  flex: 0 0 250px;
  width: 250px;
`;

const EditGroupButton = styled(Button)``;
const DeleteGroupButton = styled(Button)``;

interface Props {
  title?: Multiloc;
  groupType?: MembershipType;
  onEdit?: () => void;
  onDelete?: () => void;
  onSearch: (newValue: string) => void;
}

const UsersHeader = memo(
  ({ title, groupType, onEdit, onDelete, onSearch }: Props) => {
    const handleSearchChange = (newValue: string) => {
      onSearch(newValue);
    };

    if (title) {
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
              <EditGroupButton
                iconTitle={<FormattedMessage {...messages.editGroup} />}
                hiddenText={<FormattedMessage {...messages.editGroup} />}
                padding=".65em"
                icon="edit"
                buttonStyle="secondary"
                onClick={onEdit}
              />
              <DeleteGroupButton
                iconTitle={<FormattedMessage {...messages.deleteGroup} />}
                hiddenText={<FormattedMessage {...messages.deleteGroup} />}
                padding=".65em"
                icon="delete"
                buttonStyle="text"
                onClick={onDelete}
              />
            </Buttons>
          </TextAndButtons>
          <Spacer />
          <StyledSearchInput onChange={handleSearchChange} />
        </OnlyRow>
      );
    }

    return (
      <TitleWrapper>
        <FirstRow>
          <TextAndButtons>
            <FormattedMessage tagName="h1" {...messages.allUsers} />
          </TextAndButtons>
          <Spacer />
          <StyledSearchInput onChange={handleSearchChange} />
        </FirstRow>
        <FormattedMessage tagName="h2" {...messages.usersSubtitle} />
      </TitleWrapper>
    );
  }
);

export default UsersHeader;

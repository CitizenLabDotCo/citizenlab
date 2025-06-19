import React, { useState, useEffect } from 'react';

import { Box, colors, fontSizes } from '@citizenlab/cl2-component-library';
import { rgba } from 'polished';
import { Subscription } from 'rxjs';
import styled from 'styled-components';

import useBlockedUsercount from 'api/blocked_users/useBlockedUsersCount';
import { IGroupData } from 'api/groups/types';
import useGroups from 'api/groups/useGroups';
import useUsersCount from 'api/users_count/useUsersCount';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Outlet from 'components/Outlet';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { trackEventByName } from 'utils/analytics';
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import Link from 'utils/cl-router/Link';
import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

import events, { MembershipAdd } from './events';
import messages from './messages';
import tracks from './tracks';

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 55px 20px;
  padding-bottom: 10px;
  background: ${colors.background};
`;

const Separator = styled.hr`
  background: ${colors.divider};
  border: none;
  height: 1px;
  margin: 1rem 0 3rem 0;
`;

const MenuTitle = styled.div`
  align-items: center;
  border-radius: ${(props) => props.theme.borderRadius};
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  padding-left: 10px;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    padding: 0;
    font-weight: 600;
  }
`;

const ButtonWrapper = styled.div`
  flex: 0 0 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0px;
`;

const AddGroupButton = styled(ButtonWithLink)``;

const GroupsList = styled.div`
  overflow-x: hidden;
  overflow-y: auto;
`;

const MenuLink = styled(Link)`
  color: ${colors.primary};
  font-size: ${fontSizes.base}px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  padding-right: 0px;
  margin-bottom: 6px;
  border-radius: ${(props) => props.theme.borderRadius};
  transition: all 80ms ease-out;

  &.highlight {
    animation-name: highlight;
    animation-duration: 0.7s;
  }

  &.active {
    background: ${rgba(colors.primary, 0.08)};
  }

  &:hover,
  &:focus {
    color: ${colors.primary};
    background: ${rgba(colors.primary, 0.15)};
  }

  @keyframes highlight {
    from {
      background-color: ${rgba(colors.success, 0)};
    }

    30% {
      background-color: ${rgba(colors.success, 0.5)};
    }

    to {
      background-color: ${rgba(colors.success, 0)};
    }
  }
`;

const GroupName = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  span {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const MembersCount = styled.span`
  flex: 0 0 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
`;

export interface Props {
  className?: string;
  onCreateGroup: () => void;
}

export const GroupsListPanel = ({ onCreateGroup, className }: Props) => {
  const { data: groups } = useGroups({});
  const { data: usersCount } = useUsersCount();
  const [highlightedGroups, setHighlightedGroups] = useState(
    new Set<IGroupData['id']>()
  );
  const { data: blockedUsercount } = useBlockedUsercount();
  const isUserBlockingEnabled = useFeatureFlag({
    name: 'user_blocking',
  });

  useEffect(() => {
    const subs: Subscription[] = [];
    subs.push(
      eventEmitter
        .observeEvent<MembershipAdd>(events.membershipAdd)
        .subscribe(({ eventValue: { groupsIds } }) => {
          setHighlightedGroups(new Set(groupsIds));
          setTimeout(removeHighlights, 3000);
        })
    );

    return subs.forEach((sub) => sub.unsubscribe());
  }, []);

  const removeHighlights = () => {
    setHighlightedGroups(new Set([]));
  };

  const handleCreateGroup = (event) => {
    event.preventDefault();
    trackEventByName(tracks.createGroup);
    onCreateGroup();
  };

  return (
    <Container className={className}>
      <MenuLink to="/admin/users" onlyActiveOnIndex>
        <GroupName>
          <FormattedMessage {...messages.allUsers} />
        </GroupName>
        <MembersCount>{usersCount?.data.attributes.count}</MembersCount>
      </MenuLink>
      <MenuLink to="/admin/users/admins">
        <GroupName>
          <FormattedMessage {...messages.admins} />
        </GroupName>
        {usersCount && (
          <MembersCount data-cy="e2e-admin-count">
            {usersCount.data.attributes.administrators_count}
          </MembersCount>
        )}
      </MenuLink>
      <MenuLink to="/admin/users/moderators">
        <GroupName>
          <FormattedMessage {...messages.managers} />
        </GroupName>
        {usersCount && (
          <MembersCount data-cy="e2e-moderator-count">
            {usersCount.data.attributes.moderators_count}
          </MembersCount>
        )}
      </MenuLink>
      {isUserBlockingEnabled && (
        <MenuLink
          to="/admin/users/blocked"
          data-testid="blocked-users-link"
          onlyActiveOnIndex
        >
          <GroupName>
            <FormattedMessage {...messages.blockedUsers} />
          </GroupName>
          {!isNilOrError(blockedUsercount) && (
            <MembersCount>
              {blockedUsercount.data.attributes.count}
            </MembersCount>
          )}
        </MenuLink>
      )}
      <Separator />
      <MenuTitle className="intercom-users-groups-sidebar-section">
        <FormattedMessage tagName="h2" {...messages.groupsTitle} />
        <ButtonWrapper>
          <AddGroupButton
            className="e2e-create-group-button"
            hiddenText={<FormattedMessage {...messages.createGroupButton} />}
            icon="plus"
            iconColor={colors.primary}
            onClick={handleCreateGroup}
            padding="8px"
            borderRadius="50%"
            buttonStyle="secondary-outlined"
            bgColor={rgba(colors.primary, 0.08)}
            bgHoverColor={rgba(colors.primary, 0.15)}
          />
        </ButtonWrapper>
      </MenuTitle>
      <GroupsList className="e2e-groups-list">
        {groups &&
          groups.data.map((group) => (
            <MenuLink
              key={group.id}
              to={`/admin/users/${group.id}`}
              className={() =>
                `${highlightedGroups.has(group.id) ? 'highlight' : ''}`
              }
            >
              <Outlet
                id="app.containers.Admin.users.GroupsListPanel.listitem.icon"
                type={group.attributes.membership_type}
              />
              <GroupName>
                <T value={group.attributes.title_multiloc} />
              </GroupName>
              <MembersCount className="e2e-group-user-count">
                {group.attributes.memberships_count}
              </MembersCount>
            </MenuLink>
          ))}
      </GroupsList>
      <Box display="flex" flexGrow={1} />
      <ButtonWithLink
        linkTo="/admin/users/invitations"
        icon="email"
        className="intercom-users-invite-users-button"
      >
        <FormattedMessage {...messages.inviteUsers} />
      </ButtonWithLink>
    </Container>
  );
};

export default GroupsListPanel;

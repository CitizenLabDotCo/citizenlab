// Libraries
import React from 'react';
import { adopt } from 'react-adopt';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';
import { Subscription } from 'rxjs';

// Resources
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';
import GetUserCount, { GetUserCountChildProps } from 'resources/GetUserCount';
import { IGroupData } from 'services/groups';

// Events
import eventEmitter from 'utils/eventEmitter';
import events, { MembershipAdd } from './events';

// Components
import Button from 'components/UI/Button';
import T from 'components/T';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// Styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { rgba } from 'polished';
import Outlet from 'components/Outlet';

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
  background: ${colors.separation};
  border: none;
  height: 1px;
  margin: 1rem 0 3rem 0;
`;

const MenuTitle = styled.div`
  align-items: center;
  border-radius: ${(props: any) => props.theme.borderRadius};
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

const AddGroupButton = styled(Button)``;

const GroupsList = styled.div`
  overflow-x: hidden;
  overflow-y: auto;
`;

const MenuLink = styled(Link)`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.base}px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  padding-right: 0px;
  margin-bottom: 6px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  transition: all 80ms ease-out;

  &.highlight {
    animation-name: highlight;
    animation-duration: 0.7s;
  }

  &.active {
    background: ${rgba(colors.adminTextColor, 0.08)};
  }

  &:hover,
  &:focus {
    color: ${colors.adminTextColor};
    background: ${rgba(colors.adminTextColor, 0.15)};
  }

  @keyframes highlight {
    from {
      background-color: ${rgba(colors.clGreen, 0)};
    }

    30% {
      background-color: ${rgba(colors.clGreen, 0.5)};
    }

    to {
      background-color: ${rgba(colors.clGreen, 0)};
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

// Typings
export interface InputProps {
  className?: string;
  onCreateGroup: () => void;
}

interface DataProps {
  groups: GetGroupsChildProps;
  usercount: GetUserCountChildProps;
}

interface Props extends InputProps, DataProps {}

export interface State {
  highlightedGroups: Set<IGroupData['id']>;
}

interface Tracks {
  trackCreateGroup: Function;
}

export class GroupsListPanel extends React.PureComponent<
  Props & Tracks,
  State
> {
  subs: Subscription[] = [];

  constructor(props) {
    super(props);
    this.state = {
      highlightedGroups: new Set([]),
    };
  }

  componentDidMount() {
    this.subs.push(
      eventEmitter
        .observeEvent<MembershipAdd>(events.membershipAdd)
        .subscribe(({ eventValue: { groupsIds } }) => {
          this.setState({ highlightedGroups: new Set(groupsIds) });
          setTimeout(this.removeHighlights, 3000);
        })
    );
  }

  componentWillUnmount() {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  removeHighlights = () => {
    this.setState({ highlightedGroups: new Set([]) });
  };

  handleCreateGroup = (event) => {
    event.preventDefault();
    this.props.trackCreateGroup();
    this.props.onCreateGroup();
  };

  render() {
    const {
      usercount,
      groups: { groupsList },
    } = this.props;
    const { highlightedGroups } = this.state;

    return (
      <Container className={this.props.className}>
        <MenuLink to="/admin/users" activeClassName="active" onlyActiveOnIndex>
          <GroupName>
            <FormattedMessage {...messages.allUsers} />
          </GroupName>
          {!isNilOrError(usercount) && <MembersCount>{usercount}</MembersCount>}
        </MenuLink>
        <Separator />
        <MenuTitle>
          <FormattedMessage tagName="h2" {...messages.groupsTitle} />
          <ButtonWrapper>
            <AddGroupButton
              className="e2e-create-group-button"
              hiddenText={<FormattedMessage {...messages.createGroupButton} />}
              icon="plus"
              iconTitle={<FormattedMessage {...messages.createGroupButton} />}
              iconSize="11px"
              iconColor={colors.adminTextColor}
              onClick={this.handleCreateGroup}
              padding="8px"
              borderRadius="50%"
              buttonStyle="secondary"
              bgColor={rgba(colors.adminTextColor, 0.08)}
              bgHoverColor={rgba(colors.adminTextColor, 0.15)}
            />
          </ButtonWrapper>
        </MenuTitle>
        <GroupsList className="e2e-groups-list">
          {!isNilOrError(groupsList) &&
            groupsList.map((group) => (
              <MenuLink
                key={group.id}
                to={`/admin/users/${group.id}`}
                activeClassName="active"
                className={highlightedGroups.has(group.id) ? 'highlight' : ''}
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
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  groups: <GetGroups />,
  usercount: <GetUserCount />,
});

const GroupsListPanelWithHoc = injectTracks<Props>({
  trackCreateGroup: tracks.createGroup,
})(GroupsListPanel);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <GroupsListPanelWithHoc {...inputProps} {...dataProps} />}
  </Data>
);

// Libraries
import React from 'react';
import { adopt } from 'react-adopt';
import { Link } from 'react-router';
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
import Icon from 'components/UI/Icon';
import T from 'components/T';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// Styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { rgba, ellipsis } from 'polished';

const Panel = styled.div`
  align-items: stretch;
  background: ${colors.background};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 55px 20px;
`;

const Separator = styled.hr`
  background: ${colors.separation};
  border: none;
  height: 1px;
  margin: 1rem 0 3rem 0;
`;

const PanelEntry = `
  align-items: center;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  padding: 1rem 1.5rem;
`;

const MenuTitle = styled.div`
  ${PanelEntry}

  h2 {
    margin: 0;
  }

  .creationButton {
    /* Visual alignment */
    margin-right: -.5rem;

    button {
      display: flex;
    }
  }
`;

const MenuLink = styled(Link) `
  ${PanelEntry}
  color: ${colors.adminTextColor};
  margin-bottom: .5rem;
  height: 3rem;

  &.highlight {
    animation-name: highlight;
    animation-duration: .7s;
  }

  &.active {
    background: ${rgba(colors.adminTextColor, .1)};
  }

  &:hover,
  &:focus {
    background: ${rgba(colors.adminTextColor, .2)};
    color: ${colors.adminTextColor};
  }

  .groupName {
    ${ellipsis('200px') as any}
    min-width: 0;
    flex: 1;
  }

  @keyframes highlight {
    from {
      background-color: ${rgba(colors.success, 0)};
    }

    30% {
      background-color: ${rgba(colors.success, .5)};
    }

    to {
      background-color: ${rgba(colors.success, 0)};
    }
  }
`;

const GroupsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    margin: 0;
    padding: 0;
  }
`;

const MembersCount = styled.span`
  margin-left: 1rem;
`;

const LightningBolt = styled(Icon) `
  height: 2rem;
  width: 2rem;
  margin-left: -.7rem;

  .cl-icon-background {
    fill: none;
  }
  .cl-icon-primary {
    fill: ${colors.adminOrangeIcons};
  }
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

export class GroupsListPanel extends React.PureComponent<Props & Tracks, State> {
  subs: Subscription[] = [];

  constructor(props) {
    super(props);
    this.state = {
      highlightedGroups: new Set([]),
    };
  }

  componentDidMount() {
    this.subs.push(
      eventEmitter.observeEvent<MembershipAdd>(events.membershipAdd)
      .subscribe(({ eventValue: { groupsIds } }) => {
        this.setState({ highlightedGroups: new Set(groupsIds) });
        setTimeout(this.removeHighlights, 3000);
      })
    );
  }

  componentWillUnmount() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  removeHighlights = () => {
    this.setState({ highlightedGroups: new Set([]) });
  }

  handleCreateGroup = (event) => {
    event.preventDefault();
    this.props.trackCreateGroup();
    this.props.onCreateGroup();
  }

  render() {
    const { usercount, groups: { groupsList } } = this.props;
    const { highlightedGroups } = this.state;

    return (
      <Panel className={this.props.className}>
        <MenuLink to="/admin/users" activeClassName="active" onlyActiveOnIndex>
          <FormattedMessage {...messages.allUsers} />
          {!isNilOrError(usercount) && usercount}
        </MenuLink>
        <Separator />
        <MenuTitle>
          <FormattedMessage tagName="h2" {...messages.groupsTitle} />
          <Button
            className="creationButton e2e-create-group-button"
            hiddenText={<FormattedMessage {...messages.createGroupButton} />}
            icon="create"
            iconTitle={<FormattedMessage {...messages.createGroupButton} />}
            onClick={this.handleCreateGroup}
            padding="0"
            style="text"
          />
        </MenuTitle>
        <GroupsList className="e2e-groups-list">
          {!isNilOrError(groupsList) && groupsList.map((group) => (
            <li key={group.id}>
              <MenuLink to={`/admin/users/${group.id}`} activeClassName="active" className={highlightedGroups.has(group.id) ? 'highlight' : ''} >
                {group.attributes.membership_type === 'rules' && <LightningBolt name="lightingBolt" />}
                <T className="groupName" value={group.attributes.title_multiloc} />
                <MembersCount>{group.attributes.memberships_count}</MembersCount>
              </MenuLink>
            </li>
          ))}
        </GroupsList>
      </Panel>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  groups: <GetGroups />,
  usercount: <GetUserCount />
});

const GroupsListPanelWithHoc = injectTracks<Props>({
  trackCreateGroup: tracks.createGroup,
})(GroupsListPanel);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <GroupsListPanelWithHoc {...inputProps} {...dataProps} />}
  </Data>
);

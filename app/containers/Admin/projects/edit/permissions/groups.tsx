// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';

// i18n
import { injectIntl, InjectedIntlProps, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { getLocalized } from 'utils/i18n';
import messages from './messages';

// Components
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
import GroupAvatar from 'containers/Admin/groups/all/GroupAvatar';

// Services
import { groupsProjectsByProjectIdStream, IGroupsProjects } from 'services/groupsProjects';

// Style
import styled from 'styled-components';

const EmptyStateMessage = styled.p`
  background: rgba(1, 161, 177, 0.07);
  border-radius: 5px;
  color: #01A1B1;
  display: flex;
  align-items: center;
  font-size: 1.15rem;
  padding: 1.5rem;

  background: color: ${props => props.theme.colorMain || '#333'};
`;

const StyledIcon = styled(Icon)`
  height: 1em;
  margin-right: 2rem;
`;

const Container = styled.div`
  width: 100%;
`;

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: -2rem;
`;

const ListItem = styled.div`
  align-items: center;
  border-bottom: 1px solid #EAEAEA;
  display: flex;
  justify-content: space-between;

  > * {
    margin: 2rem 1rem;

    &:first-child {
      margin-left: 0;
    }

    &:last-child {
      margin-right: 0;
    }
  }

  > .expand {
    flex: 1;
  }
`;

// Typing
interface Props {
  projectId: string;
}

interface State {
  groupsProjects: IGroupsProjects | null;
}

class ProjectGroups extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      groupsProjects: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { projectId } = this.props;
    const groupsProjects$ = groupsProjectsByProjectIdStream(projectId).observable;

    this.subscriptions = [
      groupsProjects$.subscribe((groupsProjects) => {
        console.log('groupsProjects:');
        console.log(groupsProjects);
        this.setState({ groupsProjects });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /*
  const ListWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-top: -2rem;
  `;

  const ListItem = styled.div`
    align-items: center;
    border-bottom: 1px solid #EAEAEA;
    display: flex;
    justify-content: space-between;

    > * {
      margin: 2rem 1rem;

      &:first-child {
        margin-left: 0;
      }

      &:last-child {
        margin-right: 0;
      }
    }

    > .expand {
      flex: 1;
    }
  `;

  <ListWrapper className="e2e-groups-list">
    {groups.map((group) => (
      <ListItem key={group.id}>
        <GroupAvatar groupId={group.id} />
        <p className="expand">
          {getLocalized(group.attributes.title_multiloc, locale, tenantLocales)}
        </p>
        <p className="expand">
          <FormattedMessage {...messages.members} values={{ count: group.attributes.memberships_count }} />
        </p>
        <Button onClick={this.createDeleteGroupHandler(group.id)} style="text" circularCorners={false} icon="delete">
          <FormattedMessage {...messages.deleteButtonLabel} />
        </Button>
        <Button linkTo={`/admin/groups/edit/${group.id}`} style="secondary" circularCorners={false} icon="edit">
          <FormattedMessage {...messages.editButtonLabel} />
        </Button>
      </ListItem>
    ))}
  </ListWrapper>
  */

  render() {
    const { formatMessage } = this.props.intl;
    const { groupsProjects } = this.state;

    const noGroups = (!groupsProjects ? (
      <EmptyStateMessage>
        <StyledIcon name="warning" />
        <FormattedHTMLMessage {...messages.noSelectedGroupsMessage} />
      </EmptyStateMessage>
    ) : null);

    const groupsList = (!groupsProjects ? (
      <span>GroupsList</span>
    ) : null);

    return (
      <Container>
        {noGroups}
        {groupsList}
      </Container>
    );
  }
}

export default injectIntl<Props>(ProjectGroups);

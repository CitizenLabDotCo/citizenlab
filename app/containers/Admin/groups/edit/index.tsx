// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// Services
import { getGroup, IGroupData } from 'services/groups';

// i18n
import { FormattedMessage } from 'react-intl';
import T from 'components/T';
import messages from './messages';
import localize, { injectedLocalized } from 'utils/localize';

// Components
import Icon from 'components/UI/Icon';
import PageWrapper from 'components/admin/PageWrapper';
import MembersList from './MembersList';
import MembersAdd from './MembersAdd';
import { Link } from 'react-router';

// Style
import styled from 'styled-components';

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  color: ${props => props.theme.colors.label};

  svg {
    fill: ${props => props.theme.colors.label};
    height: 1rem;
    margin-right: .5rem;
  }
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin: 1rem 0 3rem 0;
`;

// Typing
interface Props {
  params: {
    groupId: string;
  };
}

interface State {
  group: IGroupData | null;
}

class GroupsEdit extends React.Component<Props & injectedLocalized, State> {
  subscriptions: Rx.Subscription[];

  constructor() {
    super();

    this.state = {
      group: null
    };

    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions.push(
      getGroup(this.props.params.groupId).observable.subscribe((group) => {
        this.setState({ group: group.data });
      })
    );
  }

  componentWillUnmount() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe; });
  }

  render() {
    if (this.state.group) {
      return (
        <div>
          <StyledLink to="/admin/groups">
            <Icon name="arrow-back" />
            <FormattedMessage {...messages.goBack} />
          </StyledLink>
          <PageTitle>
            {this.props.localize(this.state.group.attributes.title_multiloc)}
          </PageTitle>
          <PageWrapper>
            <MembersAdd />
            <MembersList groupId={this.props.params.groupId} />
          </PageWrapper>
        </div>
      );
    }

    return null;
  }
}

export default localize<Props>(GroupsEdit);

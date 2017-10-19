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
import Modal from 'components/UI/Modal';
import GroupAvatar from 'containers/Admin/groups/all/GroupAvatar';

// Services
import { areasStream, IAreas } from 'services/areas';
import { groupsProjectsByProjectIdStream, IGroupsProjects } from 'services/groupsProjects';

// Style
import styled from 'styled-components';
import { transparentize } from 'polished';

const EmptyStateMessage = styled.p`
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-radius: 5px;

  color: ${props => props.theme.colors.clBlue};
  background: ${props => transparentize(0.93, props.theme.colors.clBlue)};
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
  areas: IAreas | null;
}

class AddGroupForm extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      areas: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { projectId } = this.props;
    const areas$ = areasStream().observable;

    this.subscriptions = [
      areas$.subscribe(areas => this.setState({ areas }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { areas } = this.state;

    if (areas) {
      return (
        <Container>
          <span>bleh</span>
        </Container>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(AddGroupForm);

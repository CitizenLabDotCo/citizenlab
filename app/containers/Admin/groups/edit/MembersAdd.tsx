// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// i18n
import { FormattedMessage } from 'react-intl';
import T from 'components/T';
import messages from './messages';
import localize, { injectedLocalized } from 'utils/localize';

// Components
import Button from 'components/UI/Button';

// Style
import styled from 'styled-components';

const AddUserRow = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.colors.separation};
  border-top: 1px solid ${props => props.theme.colors.separation};
`;

// Typing
interface Props {}

interface State {}

class MembersAdd extends React.Component<Props & injectedLocalized, State> {
  subscriptions: Rx.Subscription[];

  constructor () {
    super();

    this.state = {};

    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions.push(

    );
  }

  componentWillUnmount() {
    this.subscriptions.forEach((sub) => { sub.unsubscribe(); });
  }

  render() {
    return (
      <AddUserRow>
        <Button icon="plus-circle" style="text">
          <FormattedMessage {...messages.addUser} />
        </Button>
      </AddUserRow>
    );
  }
}

export default localize<Props>(MembersAdd);

// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// i18n
import { FormattedMessage } from 'react-intl';
import T from 'components/T';
import messages from '../messages';

// Components
import PageWrapper from 'components/admin/PageWrapper';
import MembersList from './MembersList';

// Style
import styled from 'styled-components';


// Typing
interface Props {
  params: {
    groupId: string;
  };
}

interface State {
}

class GroupsEdit extends React.Component<Props, State> {

  render() {
    return (
      <div>
        <h1>
          <FormattedMessage {...messages.editTitle} /> - GroupdID: {this.props.params.groupId}
        </h1>
        <PageWrapper>
          <p>Search</p>
          <MembersList groupId={this.props.params.groupId} />
        </PageWrapper>
      </div>
    );
  }
}

export default GroupsEdit;

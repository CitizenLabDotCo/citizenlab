// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// i18n
import { FormattedMessage } from 'react-intl';
import T from 'components/T';
import messages from '../messages';

// Components
import PageWrapper from 'components/admin/PageWrapper';
import GroupList from './GroupList';

// Style
import styled from 'styled-components';

const PageTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 3rem;
`;

// Typing
interface Props {
}

interface State {
}

class GroupsList extends React.Component {
  constructor () {
    super();
  }

  render() {
    return (
      <div>
        <PageTitle>
          <FormattedMessage {...messages.listTitle} />
        </PageTitle>
        <PageWrapper>
          Add Groups
          <GroupList />
        </PageWrapper>
      </div>
    );
  }
}

export default GroupsList;

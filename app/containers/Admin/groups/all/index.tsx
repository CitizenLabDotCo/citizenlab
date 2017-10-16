// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// i18n
import { FormattedMessage } from 'react-intl';
import T from 'components/T';
import messages from './messages';

// Components
import Button from 'components/UI/Button';
import PageWrapper from 'components/admin/PageWrapper';
import GroupList from './GroupList';

// Style
import styled from 'styled-components';

const PageTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 3rem;
`;

const ButtonWrapper = styled.div`
  border-bottom: 1px solid #EAEAEA;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
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
          <ButtonWrapper>
            <Button><FormattedMessage {...messages.addGroupButton} /></Button>
          </ButtonWrapper>
          <GroupList />
        </PageWrapper>
      </div>
    );
  }
}

export default GroupsList;

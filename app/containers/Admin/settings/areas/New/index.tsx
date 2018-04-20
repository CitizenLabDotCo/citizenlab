import React from 'react';
import styled from 'styled-components';
import { browserHistory } from 'react-router';
import messages from '../messages';

import GoBackButton from 'components/UI/GoBackButton';
import { FormattedMessage } from 'utils/cl-intl';

const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  margin: 1rem 0 3rem 0;
`;

class New extends React.Component {

  goBack = () => {
    browserHistory.push('/admin/settings/areas');
  }

  render() {
    return (
      <>
        <GoBackButton onClick={this.goBack} />
        <PageTitle>
          <FormattedMessage {...messages.addAreaButton} />
        </PageTitle>
      </>
    )
  }
}

export default New;
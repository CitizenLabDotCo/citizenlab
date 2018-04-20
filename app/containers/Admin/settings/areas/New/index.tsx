import React from 'react';
import { browserHistory } from 'react-router';

import GoBackButton from 'components/UI/GoBackButton';

class New extends React.Component {

  goBack = () => {
    browserHistory.push('/admin/settings/areas');
  }

  render() {
    return (
      <GoBackButton onClick={this.goBack} />
    )
  }
}
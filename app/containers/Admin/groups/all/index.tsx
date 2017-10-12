// Libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// i18n
import { FormattedMessage } from 'react-intl';
import T from 'components/T';
import messages from '../messages';

// Style
import styled from 'styled-components';

class GroupsList extends React.Component {

  render() {
    return (
      <h1>
        <FormattedMessage {...messages.listTitle} />
      </h1>
    );
  }
}

export default GroupsList;

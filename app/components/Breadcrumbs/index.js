/**
*
* Breadcrumbs
*
*/

import React from 'react';
// import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

function Breadcrumbs() {
  return (
    <div>
      <FormattedMessage {...messages.header} />
    </div>
  );
}

Breadcrumbs.propTypes = {

};

export default Breadcrumbs;

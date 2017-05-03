/**
*
* Attachment
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Label } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

function Attachment(props) {
  return (
    <Label>
      {(props.file && props.file.name) || <FormattedMessage {...messages.genericFile} />}
    </Label>
  );
}

Attachment.propTypes = {
  file: PropTypes.any.isRequired, // file name
};

export default styled(Attachment)`
  height: 49px;
  width: 100%;
`;

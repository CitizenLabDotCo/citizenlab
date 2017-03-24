/**
*
* Attachment
*
*/

import React, { PropTypes } from 'react';
import styled from 'styled-components';


function Attachment(props) {
  return (
    <div>
      source: {props.source}
    </div>
  );
}

Attachment.propTypes = {
  source: PropTypes.object.isRequired,
};

export default styled(Attachment)`
  height: 49px;
  width: 100%;
`;

/**
*
* Image
*
*/

import React, { PropTypes } from 'react';
import styled from 'styled-components';

function Image(props) {
  return (
    <div className={props.className}>
    </div>
  );
}

Image.propTypes = {
  className: PropTypes.string,
};

export default styled(Image)`
    background: no-repeat center url('${(props) => props.source}');
    background-size: 100%;
    width: 100px;
    height: 100px;
    margin: 10px;
`;

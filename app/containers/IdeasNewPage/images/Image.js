/**
*
* Image
*
*/

import React, { PropTypes } from 'react';
import styled from 'styled-components';
import { Image as ImageSUI } from 'semantic-ui-react';

function Image(props) {
  return (
    <ImageSUI
      as={() => <div className={props.className} />}
    />
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

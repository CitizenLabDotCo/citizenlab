/**
*
* CenteredButton
*
*/

import React, { PropTypes } from 'react';
import styled from 'styled-components';
import { Button } from 'components/Foundation';

function CenteredButton(props) {
  return (
    <Button className={props.className}>
      {props.children}
    </Button>
  );
}

CenteredButton.propTypes = {
  children: PropTypes.any.isRequired,
  className: PropTypes.string,
};

export default styled(CenteredButton)`
  margin: 10px auto;
  display: block;
`;

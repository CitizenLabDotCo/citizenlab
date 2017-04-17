/**
*
* IdeaContent
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

function IdeaContent(props) {
  const { className, children } = props;

  return (
    <div className={className}>
      <span>{ children } </span>
      <hr />
    </div>
  );
}

IdeaContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any.isRequired,
};

export default styled(IdeaContent)`
    // none yet
`;

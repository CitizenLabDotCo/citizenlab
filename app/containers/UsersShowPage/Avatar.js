import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

function Avatar(props) {
  return (
    <div className={props.className}>

    </div>
  );
}

Avatar.propTypes = {
  className: PropTypes.string,
};

export default styled(Avatar)`
  background: no-repeat center url('${(props) => props.avatarURL}');
  background-size: 100%;
  margin: 5% auto;
  width: 200px;
  height: 200px;
`;

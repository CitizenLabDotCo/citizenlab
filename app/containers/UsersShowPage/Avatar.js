import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Segment, Image } from 'semantic-ui-react';

function Avatar(props) {
  return (<Segment>
    {props.avatarURL && <Image
      className={props.className}
      centered
      src={props.avatarURL}
      shape="circular"
    />}
  </Segment>);
}

Avatar.propTypes = {
  className: PropTypes.string,
  avatarURL: PropTypes.string,
};

export default styled(Avatar)`
  width: 200px;
  height: 200px;
`;

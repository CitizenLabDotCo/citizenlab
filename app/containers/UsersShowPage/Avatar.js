import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Segment, Image } from 'semantic-ui-react';

function Avatar({ avatarURL, className }) {
  if (!avatarURL) return null;
  return (
    <Segment>
      <Image
        className={className}
        centered
        src={avatarURL}
        shape="circular"
      />
    </Segment>
  );
}

Avatar.propTypes = {
  className: PropTypes.string,
  avatarURL: PropTypes.string,
};

export default styled(Avatar)`
  width: 200px;
  height: 200px;
`;

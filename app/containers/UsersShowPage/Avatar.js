import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Image } from 'semantic-ui-react';

function Avatar({ avatarURL, className }) {
  if (!avatarURL) return null;
  return (
    <Image
      className={className}
      centered
      src={avatarURL}
      shape="circular"
    />
  );
}

Avatar.propTypes = {
  className: PropTypes.string,
  avatarURL: PropTypes.string,
};

export default styled(Avatar)`
  position: absolute !important;
  margin: -82.5px 0 0 calc(40% - 82.5px) !important;
  width: 165px;
  height: 165px;
  border: solid 5px #ffffff;
`;

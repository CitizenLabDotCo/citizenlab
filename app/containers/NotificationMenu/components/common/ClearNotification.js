import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import * as clearIcon from '../../assets/clear_icon.svg';
import { Image } from 'semantic-ui-react';

const ClearNotification = ({ onClick, className }) => (<button className={className} onClick={onClick}>
  <Image src={clearIcon} />
</button>);

ClearNotification.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default styled(ClearNotification)`
 position: absolute;
 top: 0;
 right: 10px;
`;


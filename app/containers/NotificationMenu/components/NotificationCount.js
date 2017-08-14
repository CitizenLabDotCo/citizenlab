import React from 'react';
import { Image } from 'semantic-ui-react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import * as notificationBell from '../assets/notification_bell.svg';

const Counter = styled.div`
  width: 24px;
  height: 24px;
  background-color: #d0011b;
  border: solid 2px #ffffff;
  border-radius: 10px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #ffffff;
  padding-top: 2px;
  position: absolute;
  top: -16px;
  right: -11px;
  display: ${(props) => props.notZero ? 'block' : 'none'};
`;

// used in Navbar
const NotificationCount = ({ count, className }) => (
  <div className={className}>
    <Image src={notificationBell} />
    <Counter notZero={count > 0}>{count > 0 ? count : ''}</Counter>
  </div>);

NotificationCount.propTypes = {
  count: PropTypes.number,
  className: PropTypes.string,
};

export default styled(NotificationCount)`
  cursor: pointer;
  width: 20.4px;
  height: 24px;
`;

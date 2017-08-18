import React from 'react';
import { Image } from 'semantic-ui-react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import * as notificationBell from '../assets/notification_bell.svg';

const Counter = styled.div`
  width: 24px;
  height: 24px;
  background-color: #D0021B;
  border: solid 2px ${(props) => props.theme.colorNavBg};
  border-radius: 50%;
  text-align: center;
  font-size: 12px;
  font-weight: bold;
  color: #ffffff;
  position: absolute;
  top: -13px;
  right: -12px;
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

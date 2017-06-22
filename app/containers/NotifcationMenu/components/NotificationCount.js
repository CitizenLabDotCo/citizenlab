import React from 'react';
import { Image } from 'semantic-ui-react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import * as notificationBell from '../assets/notification_bell.png';

const Counter = styled.div`
  width: 19px;
  height: 19px;
  background-color: #d0011b;
  border: solid 2px #ffffff;
  border-radius: 1px;
`;

const NotificationCount = ({ count, className }) => (<Image src={notificationBell} className={className}>
  {count && count > 0 && <Counter>{count}</Counter>}
</Image>);

NotificationCount.propTypes = {
  count: PropTypes.number,
  className: PropTypes.string,
};

export default styled(NotificationCount)`
  position: absolute; 
  right: 20px;
  top: 0;
  cursor: pointer;
`;

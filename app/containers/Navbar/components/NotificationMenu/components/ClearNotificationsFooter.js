import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import * as clearIcon from '../assets/clear_icon.svg';
import { Image } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import messages from '../messages';

const ClearNotificationsFooter = ({ onClick, className }) => (<div className={className}>
  <button onClick={onClick}>
    <Image
      src={clearIcon}
      style={{
        display: 'inline-block',
        marginRight: '5px',
      }}
    />
    <FormattedMessage {...messages.clearAll} />
  </button>
</div>);

ClearNotificationsFooter.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default styled(ClearNotificationsFooter)`
  position: absolute;
  right: 0;
  background-color: #fcfcfc;
  padding: 10px;
  font-size: 15px;
  color: #6b6b6b;
  width: 100%;
  -webkit-text-align: right;
  text-align: right;
`;

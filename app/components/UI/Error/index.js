import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Icon from 'components/Icon';
import { CSSTransitionGroup } from 'react-transition-group';
import _ from 'lodash';

const ErrorMessageText = styled.div`
  color: #f93e36;
  font-weight: 400;
`;

const IconWrapper = styled.div`
  margin-right: 8px;

  svg {
    fill: #f93e36;
  }
`;

const StyledErrorMessageInner = styled.div`
  display: flex;
  align-items: center;
  border-radius: 5px;
  background: #feebea;
  background: rgba(252, 60, 45, 0.1);
`;

const StyledErrorMessage = styled.div`
  position: relative;
  overflow: hidden;

  ${StyledErrorMessageInner} {
    margin-top: ${(props) => props.marginTop};
    margin-bottom: ${(props) => props.marginBottom};
    padding: ${(props) => {
      switch (props.size) {
        case '2':
          return '13px';
        case '3':
          return '14px';
        case '4':
          return '15px';
        default:
          return '11px 13px';
      }
    }};
  }

  ${ErrorMessageText} {
    font-size: ${(props) => {
      switch (props.size) {
        case '2':
          return '17px';
        case '3':
          return '18px';
        case '4':
          return '19px';
        default:
          return '16px';
      }
    }};
  }

  ${IconWrapper} {
    height: ${(props) => {
      switch (props.size) {
        case '2':
          return '23px';
        case '3':
          return '24px';
        case '4':
          return '25px';
        default:
          return '22px';
      }
    }};
  }

  &.error-enter {
    max-height: 0px;
    opacity: 0;
    transform: scale(0.8);
    will-change: opacity, transform;
    transition: max-height 250ms cubic-bezier(0.165, 0.84, 0.44, 1),
                transform 250ms cubic-bezier(0.165, 0.84, 0.44, 1),
                opacity 250ms cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  &.error-enter-active {
    max-height: 100px;
    opacity: 1;
    transform: scale(1);
    will-change: auto;
  }

  &.error-leave {
    max-height: 100px;
    opacity: 1;
    will-change: opacity;
    transition: max-height 250ms cubic-bezier(0.19, 1, 0.22, 1),
                opacity 250ms cubic-bezier(0.19, 1, 0.22, 1);
  }

  &.error-leave-active {
    max-height: 0px;
    opacity: 0;
    will-change: auto;
  }
`;

const Error = ({ text, size, marginTop, marginBottom, showIcon }) => {
  const enterTime = 250;
  const leaveTime = 250;
  const opened = (_.isString(text) && !_.isEmpty(text));

  if (opened) {
    return (
      <CSSTransitionGroup
        transitionName="error"
        transitionEnterTimeout={enterTime}
        transitionLeaveTimeout={leaveTime}
      >
        <StyledErrorMessage
          size={size}
          marginTop={marginTop}
          marginBottom={marginBottom}
        >
          <StyledErrorMessageInner>
            { showIcon && <IconWrapper><Icon name="error" /></IconWrapper> }
            <ErrorMessageText>
              {text}
            </ErrorMessageText>
          </StyledErrorMessageInner>
        </StyledErrorMessage>
      </CSSTransitionGroup>
    );
  }

  return (
    <CSSTransitionGroup
      transitionName="error"
      transitionEnterTimeout={enterTime}
      transitionLeaveTimeout={leaveTime}
    />
  );
};

Error.propTypes = {
  text: PropTypes.string,
  size: PropTypes.string,
  marginTop: PropTypes.string,
  marginBottom: PropTypes.string,
  showIcon: PropTypes.bool,
};

Error.defaultProps = {
  text: null,
  size: '1',
  marginTop: '6px',
  marginBottom: '0px',
  showIcon: false,
};

export default Error;

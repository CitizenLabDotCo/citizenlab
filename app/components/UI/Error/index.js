import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Icon from 'components/Icon';
import { CSSTransitionGroup } from 'react-transition-group';
import _ from 'lodash';

const ErrorMessageText = styled.div`
  color: #d30915;
  font-weight: 400;
`;

const ErrorMessageIcon = styled.div`
  padding-top: -2px;
  padding-left: 8px;
  padding-right: 8px;

  svg {
    fill: #d30915;
  }
`;

const StyledErrorMessageInner = styled.div`
  display: flex;
  align-items: center;
  border-radius: 5px;
  background: rgba(211, 9, 21, 0.12);
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
          return '12px';
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

  ${ErrorMessageIcon} {
    height: ${(props) => {
      switch (props.size) {
        case '2':
          return '26px';
        case '3':
          return '27px';
        case '4':
          return '28px';
        default:
          return '25px';
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

const Error = ({ text, size, opened, showIcon, marginTop, marginBottom }) => {
  const enterTime = 250;
  const leaveTime = 250;

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
            {((_.isBoolean(showIcon) && showIcon === true) || !_.isBoolean(showIcon)) &&
              <ErrorMessageIcon>
                <Icon name="error" />
              </ErrorMessageIcon>
            }
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
  marginTop: PropTypes.string.isRequired,
  marginBottom: PropTypes.string.isRequired,
  opened: PropTypes.bool.isRequired,
  showIcon: PropTypes.bool,
};

export default Error;

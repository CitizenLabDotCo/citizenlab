import * as React from 'react';
import Icon from 'components/UI/Icon';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import * as _ from 'lodash';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';

import { API } from 'typings.d';
import messages from './messages';

interface IStyledErrorMessageInner {
  showBackground: boolean;
}

interface IStyledErrorMessage {
  size: string;
  marginTop: string;
  marginBottom: string;
}

const ErrorMessageText = styled.div`
  color: #f93e36;
  font-weight: 400;
  line-height: 22px;
`;

const IconWrapper = styled.div`
  margin-right: 8px;

  svg {
    fill: #f93e36;
  }
`;

const StyledErrorMessageInner = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  border-radius: 5px;
  background: rgba(252, 60, 45, 0.1);
  background: ${(props: IStyledErrorMessageInner) => (props.showBackground ? 'rgba(252, 60, 45, 0.1)' : 'transparent')};
`;

const StyledErrorMessage: any = styled.div`
  position: relative;
  overflow: hidden;
  will-change: auto;

  ${StyledErrorMessageInner} {
    margin-top: ${(props: IStyledErrorMessage) => props.marginTop};
    margin-bottom: ${(props: IStyledErrorMessage) => props.marginBottom};
    padding: ${(props: IStyledErrorMessage) => {
      switch (props.size) {
        case '2':
          return '11px';
        case '3':
          return '12px';
        case '4':
          return '13px';
        default:
          return '10px 13px';
      }
    }};
  }

  ${ErrorMessageText} {
    font-size: ${(props: IStyledErrorMessage) => {
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
    height: ${(props: IStyledErrorMessage) => {
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
    opacity: 0.01;
    will-change: opacity;

    &.error-enter-active {
      max-height: 60px;
      opacity: 1;
      transition: max-height 400ms cubic-bezier(0.165, 0.84, 0.44, 1),
                  opacity 400ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.error-exit {
    max-height: 100px;
    opacity: 1;
    will-change: opacity;

    &.error-exit-active {
      max-height: 0px;
      opacity: 0.01;
      transition: max-height 350ms cubic-bezier(0.19, 1, 0.22, 1),
                  opacity 350ms cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
`;

type Props = {
  text?: string | null;
  fieldName?: string;
  errors?: string[];
  apiErrors?: API.Error[];
  size?: string;
  marginTop?: string;
  marginBottom?: string;
  showIcon?: boolean;
  showBackground?: boolean;
  className?: string;
};

type State = {};

function findMessage(fieldName, error) {
  return messages[`${fieldName}_${error}`] || messages[error];
}


export default class Error extends React.PureComponent<Props, State> {
  render() {
    const { text, errors, apiErrors, fieldName } = this.props;
    let { size, marginTop, marginBottom, showIcon, showBackground, className } = this.props;
    const timeout = 400;

    size = (size || '1');
    marginTop = (marginTop || '5px');
    marginBottom = (marginTop || '0px');
    showIcon = (_.isBoolean(showIcon) ? showIcon : true);
    showBackground = (_.isBoolean(showBackground) ? showBackground : true);
    className = (className || '');

    const errorElement = (text || errors || apiErrors) && (
      <CSSTransition classNames="error" timeout={timeout}>
        <StyledErrorMessage size={size} marginTop={marginTop} marginBottom={marginBottom}>
          <StyledErrorMessageInner showBackground={showBackground}>
            {showIcon && <IconWrapper><Icon name="error" /></IconWrapper>}
            <ErrorMessageText>
              {text &&
                <p>{text}</p>
              }

              {errors && errors.map((error) => (
                <p key={error}>
                  <FormattedMessage {...findMessage(fieldName, error)} />
                </p>
              ))}

              {apiErrors && apiErrors.map((error) => (
                <p key={error.error}>
                  <FormattedMessage {...findMessage(fieldName, error.error)} />
                </p>
              ))}
            </ErrorMessageText>
          </StyledErrorMessageInner>
        </StyledErrorMessage>
      </CSSTransition>
    );

    return (
      <div>
        <TransitionGroup>
          {errorElement}
        </TransitionGroup>
      </div>
    );
  }
}

import * as React from 'react';
import Icon from 'components/UI/Icon';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import * as _ from 'lodash';
import styled from 'styled-components';
import { FormattedMessage } from 'utils/cl-intl';
import { darken } from 'polished';
import { API, Message } from 'typings';
import { IInviteError } from 'services/invites';
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
  color: ${(props) => props.theme.colors.error};
  font-weight: 400;
  line-height: 22px;

  a {
    color: ${(props) => props.theme.colors.error};
    font-weight: 500;
    text-decoration: underline;

    &:hover {
      color: ${(props) => darken(0.2, props.theme.colors.error)};
      text-decoration: underline;
    }
  }
`;

const IconWrapper = styled.div`
  margin-right: 8px;

  svg {
    fill: ${(props) => props.theme.colors.error};
  }
`;

const StyledErrorMessageInner = styled.div`
  display: flex;
  align-items: center;
  border-radius: 5px;
  background: rgba(252, 60, 45, 0.1);
  background: ${(props: IStyledErrorMessageInner) => (props.showBackground ? 'rgba(252, 60, 45, 0.1)' : 'transparent')};
`;

const StyledErrorMessage: any = styled.div`
  position: relative;
  overflow: hidden;

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

    &.error-exit-active {
      max-height: 0px;
      opacity: 0.01;
      transition: max-height 350ms cubic-bezier(0.19, 1, 0.22, 1),
                  opacity 350ms cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
`;

type Props = {
  text?: string | JSX.Element | null;
  fieldName?: string | undefined;
  errors?: string[];
  apiErrors?: (API.Error | IInviteError)[] | null;
  size?: string;
  marginTop?: string;
  marginBottom?: string;
  showIcon?: boolean;
  showBackground?: boolean;
  className?: string;
};

type State = {};

function findMessage(fieldName: string | undefined, error: string) {
  if (fieldName && messages[`${fieldName}_${error}`]) {
    return messages[`${fieldName}_${error}`] as Message;
  }

  if (messages[error]) {
    return messages[error] as Message;
  }

  return null;
}

export default class Error extends React.PureComponent<Props, State> {
  render() {
    const { text, errors, apiErrors, fieldName } = this.props;
    const timeout = { enter: 400, exit: 350 };
    let { size, marginTop, marginBottom, showIcon, showBackground, className } = this.props;

    size = (size || '1');
    marginTop = (marginTop || '3px');
    marginBottom = (marginTop || '0px');
    showIcon = (_.isBoolean(showIcon) ? showIcon : true);
    showBackground = (_.isBoolean(showBackground) ? showBackground : true);
    className = (className || '');

    const errorElement = (text || errors || apiErrors) && (
      <CSSTransition
        classNames="error"
        timeout={timeout}
        exit={true}
      >
        <StyledErrorMessage className="e2e-error-message" size={size} marginTop={marginTop} marginBottom={marginBottom}>
          <StyledErrorMessageInner showBackground={showBackground}>
            {showIcon && <IconWrapper><Icon name="error" /></IconWrapper>}
            <ErrorMessageText>
              {text &&
                <p>{text}</p>
              }

              {errors && errors.map((error) => {
                const errorMessage = findMessage(fieldName, error);

                if (errorMessage) {
                  return (
                    <p key={error}>
                      <FormattedMessage {...errorMessage} />
                    </p>
                  );
                }

                return null;
              })}

              {apiErrors && apiErrors.length > 0 && apiErrors.map((error) => {
                const errorMessage = findMessage(fieldName, error.error);

                if (errorMessage) {
                  return (
                    <p key={error.error}>
                      <FormattedMessage {...errorMessage} />
                    </p>
                  );
                }

                return null;
              })}
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

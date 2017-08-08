import * as React from 'react';
import Icon from 'components/UI/Icon';
// import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import * as _ from 'lodash';
import styled from 'styled-components';

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
    opacity: 0;
    will-change: opacity;
    transition: max-height 400ms cubic-bezier(0.165, 0.84, 0.44, 1),
                opacity 400ms cubic-bezier(0.165, 0.84, 0.44, 1);
  }

  &.error-enter-active {
    max-height: 60px;
    opacity: 1;
    will-change: auto;
  }

  &.error-leave {
    max-height: 100px;
    opacity: 1;
    will-change: opacity;
    transition: max-height 350ms cubic-bezier(0.19, 1, 0.22, 1),
                opacity 350ms cubic-bezier(0.19, 1, 0.22, 1);
  }

  &.error-leave-active {
    max-height: 0px;
    opacity: 0;
    will-change: auto;
  }
`;

const Error: React.SFC<IError> = ({ text, size, marginTop, marginBottom, showIcon, showBackground, className }) => {
  const enterTime = 400;
  const leaveTime = 350;
  const opened = (_.isString(text) && !_.isEmpty(text));

  size = (size || '1');
  marginTop = (marginTop || '10px');
  marginBottom = (marginTop || '0px');
  showIcon = (showIcon || true);
  showBackground = (showBackground || true);
  className = (className || '');

  return null;

//   if (opened) {
//     return (
//       <CSSTransitionGroup
//         transitionName="error"
//         transitionEnterTimeout={enterTime}
//         transitionLeaveTimeout={leaveTime}
//         className={`Error ${className}`}
//       >
//         <StyledErrorMessage
//           size={size}
//           marginTop={marginTop}
//           marginBottom={marginBottom}
//         >
//           <StyledErrorMessageInner showBackground={showBackground}>
//             {showIcon && <IconWrapper><Icon name="error" /></IconWrapper>}
//             <ErrorMessageText>
//               {text}
//             </ErrorMessageText>
//           </StyledErrorMessageInner>
//         </StyledErrorMessage>
//       </CSSTransitionGroup>
//     );
//   }

//   return (
//     <CSSTransitionGroup
//       transitionName="error"
//       transitionEnterTimeout={enterTime}
//       transitionLeaveTimeout={leaveTime}
//     />
//   );
};

interface IError {
  text: string | null;
  size?: string;
  marginTop?: string;
  marginBottom?: string;
  showIcon?: boolean;
  showBackground?: boolean;
  className?: string;
}

export default Error;

import * as React from 'react';
import * as _ from 'lodash';

// components
import Icon from 'components/UI/Icon';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';

// style
import styled from 'styled-components';

interface IStyledSuccessMessageInner {
  showBackground: boolean;
}

interface IStyledSuccessMessage {
  size: string;
  marginTop: string;
  marginBottom: string;
}

const Container = styled.div``;

const SuccessMessageText = styled.div`
  color: #40af65;
  font-weight: 400;
  line-height: 22px;
`;

const IconWrapper = styled.div`
  margin-right: 8px;

  svg {
    fill: #40af65;
  }
`;

const StyledSuccessMessageInner = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  border-radius: 5px;
  background: ${(props: IStyledSuccessMessageInner) => (props.showBackground ? '#ecf7ef' : 'transparent')};
`;

const StyledSuccessMessage: any = styled.div`
  position: relative;
  overflow: hidden;

  ${StyledSuccessMessageInner} {
    margin-top: ${(props: IStyledSuccessMessage) => props.marginTop};
    margin-bottom: ${(props: IStyledSuccessMessage) => props.marginBottom};
    padding: ${(props: IStyledSuccessMessage) => {
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

  ${SuccessMessageText} {
    font-size: ${(props: IStyledSuccessMessage) => {
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
    height: ${(props: IStyledSuccessMessage) => {
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

  &.success-enter {
    max-height: 0px;
    opacity: 0.01;

    &.success-enter-active {
      max-height: 60px;
      opacity: 1;
      transition: max-height 400ms cubic-bezier(0.165, 0.84, 0.44, 1),
                  opacity 400ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.success-exit {
    max-height: 100px;
    opacity: 1;

    &.success-exit-active {
      max-height: 0px;
      opacity: 0.01;
      transition: max-height 350ms cubic-bezier(0.19, 1, 0.22, 1),
                  opacity 350ms cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
`;

type Props = {
  text: string | null;
  size?: string;
  marginTop?: string;
  marginBottom?: string;
  showIcon?: boolean;
  showBackground?: boolean;
};

type State = {};

export default class Success extends React.PureComponent<Props, State> {
  render() {
    const className = this.props['className'];
    const { text } = this.props;
    let { size, marginTop, marginBottom, showIcon, showBackground } = this.props;
    const timeout = 400;

    size = (size || '1');
    marginTop = (marginTop || '5px');
    marginBottom = (marginTop || '0px');
    showIcon = (_.isBoolean(showIcon) ? showIcon : true);
    showBackground = (_.isBoolean(showBackground) ? showBackground : true);

    const successElement = (text ? (
      <CSSTransition classNames="success" timeout={timeout}>
        <StyledSuccessMessage className="e2e-success-message" size={size} marginTop={marginTop} marginBottom={marginBottom}>
          <StyledSuccessMessageInner showBackground={showBackground}>
            {showIcon && <IconWrapper><Icon name="checkmark" /></IconWrapper>}
            <SuccessMessageText>
              {text}
            </SuccessMessageText>
          </StyledSuccessMessageInner>
        </StyledSuccessMessage>
      </CSSTransition>
    ) : null);

    return (
      <Container className={className}>
        <TransitionGroup>
          {successElement}
        </TransitionGroup>
      </Container>
    );
  }
}

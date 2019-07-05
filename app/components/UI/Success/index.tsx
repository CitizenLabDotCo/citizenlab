import React from 'react';
import { isBoolean } from 'lodash-es';

// components
import Icon from 'components/UI/Icon';
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';

// style
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

interface IStyledSuccessMessageInner {
  showBackground: boolean;
}

const Container = styled.div``;

const SuccessMessageText = styled.div`
  font-size: ${fontSizes.base}px;
  color: #40af65;
  font-weight: 400;
  line-height: 22px;
`;

const CheckmarkIcon = styled(Icon)`
  fill: #40af65;
  margin-right: 13px;
  width: 28px;
  height: 22px;
`;

const StyledSuccessMessageInner = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${(props: IStyledSuccessMessageInner) => (props.showBackground ? '#ecf7ef' : 'transparent')};
  padding: 10px 13px;
  margin-top: 5px;
`;

const StyledSuccessMessage: any = styled.div`
  position: relative;
  overflow: hidden;

  &.success-enter {
    max-height: 0px;
    opacity: 0;

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
      opacity: 0;
      transition: max-height 350ms cubic-bezier(0.19, 1, 0.22, 1),
                  opacity 350ms cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
`;

type Props = {
  text: string | null;
  showIcon?: boolean;
  showBackground?: boolean;
  className?: string;
};

type State = {};

export default class Success extends React.PureComponent<Props, State> {
  render() {
    const { text, className } = this.props;
    let { showIcon, showBackground } = this.props;
    const timeout = 400;

    showIcon = (isBoolean(showIcon) ? showIcon : true);
    showBackground = (isBoolean(showBackground) ? showBackground : true);

    const successElement = (text ? (
      <CSSTransition classNames="success" timeout={timeout}>
        <StyledSuccessMessage className="e2e-success-message">
          <StyledSuccessMessageInner showBackground={showBackground}>
            {showIcon && <CheckmarkIcon name="checkmark" />}
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

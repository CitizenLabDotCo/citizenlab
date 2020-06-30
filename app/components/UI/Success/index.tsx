import React, { PureComponent } from 'react';
import { isBoolean } from 'lodash-es';

// components
import { Icon } from 'cl2-component-library';
import CSSTransition from 'react-transition-group/CSSTransition';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

const timeout = 350;

const SuccessMessageText = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${colors.clGreenSuccess};
  font-weight: 400;
  line-height: normal;
`;

const CheckmarkIcon = styled(Icon)`
  flex: 0 0 22px;
  width: 22px;
  fill: ${colors.clGreenSuccess};
  margin-right: 13px;
`;

const StyledSuccessMessageInner = styled.div<{ showBackground: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${(props => props.showBackground ? colors.clGreenSuccessBackground : 'transparent')};
  padding: 10px 13px;
`;

const Container = styled.div`
  position: relative;
  overflow: hidden;

  &.success-enter {
    max-height: 0px;
    opacity: 0;

    &.success-enter-active {
      max-height: 60px;
      opacity: 1;
      transition: max-height ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1),
                  opacity ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.success-exit {
    max-height: 100px;
    opacity: 1;

    &.success-exit-active {
      max-height: 0px;
      opacity: 0;
      transition: max-height ${timeout}ms cubic-bezier(0.19, 1, 0.22, 1),
                  opacity ${timeout}ms cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
`;

interface Props {
  text: string | JSX.Element | null;
  showIcon?: boolean;
  showBackground?: boolean;
  animate: boolean;
  className?: string;
}

interface State {
  mounted: boolean;
}

export default class Success extends PureComponent<Props, State> {
  static defaultProps = {
    animate: true
  };

  constructor(props) {
    super(props);
    this.state = {
      mounted: false
    };
  }

  componentDidMount() {
    this.setState({ mounted: true });
  }

  componentWillUnmount() {
    this.setState({ mounted: false });
  }

  render() {
    const { text, className, animate } = this.props;
    const { mounted } = this.state;
    const showIcon = isBoolean(this.props.showIcon) ? this.props.showIcon : true;
    const showBackground = isBoolean(this.props.showBackground) ? this.props.showBackground : true;

    return (
      <CSSTransition
        in={!!(mounted && text)}
        timeout={timeout}
        mountOnEnter={true}
        unmountOnExit={true}
        enter={animate}
        exit={animate}
        classNames="success"
      >
        <Container className={`e2e-success-message ${className}`}>
          <StyledSuccessMessageInner showBackground={showBackground}>
            {showIcon && <CheckmarkIcon name="checkmark" />}
            <SuccessMessageText>
              {text}
            </SuccessMessageText>
          </StyledSuccessMessageInner>
        </Container>
      </CSSTransition>
    );
  }
}

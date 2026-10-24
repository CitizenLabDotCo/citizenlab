import React, { PureComponent } from 'react';

import { darken } from 'polished';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';

import { colors, fontSizes } from '../../utils/styleUtils';
import Icon from '../Icon';

const timeout = 350;

const ErrorMessageText = styled.div`
  flex: 1 1 100%;
  color: ${colors.red600};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;

  a {
    color: ${colors.red600};
    font-weight: 500;
    text-decoration: underline;

    &:hover {
      color: ${darken(0.2, colors.red600)};
      text-decoration: underline;
    }
  }

  strong {
    font-weight: 500;
  }
`;

const ErrorIcon = styled(Icon)`
  flex: 0 0 24px;
  fill: ${colors.red600};
  padding: 0px;
  margin: 0px;
  margin-right: 10px;
`;

const ContainerInner = styled.div<{ showBackground: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 13px;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${colors.red100};
  background: ${(props) =>
    props.showBackground ? colors.red100 : 'transparent'};
`;

const Container = styled.div<{ marginTop: string; marginBottom: string }>`
  position: relative;
  overflow: hidden;

  ${ContainerInner} {
    margin-top: ${(props) => props.marginTop};
    margin-bottom: ${(props) => props.marginBottom};
  }

  &.error-enter {
    max-height: 0px;
    opacity: 0;

    &.error-enter-active {
      max-height: 60px;
      opacity: 1;
      transition: max-height ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1),
        opacity ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.error-exit {
    max-height: 100px;
    opacity: 1;

    &.error-exit-active {
      max-height: 0px;
      opacity: 0;
      transition: max-height ${timeout}ms cubic-bezier(0.19, 1, 0.22, 1),
        opacity ${timeout}ms cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
`;

interface DefaultProps {
  marginTop: string;
  marginBottom: string;
  showIcon: boolean;
  showBackground: boolean;
  className: string;
  animate: boolean | undefined;
}

interface Props extends DefaultProps {
  text?: string | null;
}

interface State {
  mounted: boolean;
}

class Error extends PureComponent<Props, State> {
  static defaultProps: DefaultProps = {
    marginTop: '3px',
    marginBottom: '0px',
    showIcon: true,
    showBackground: true,
    className: '',
    animate: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      mounted: false,
    };
  }

  componentDidMount() {
    this.setState({ mounted: true });
  }

  componentWillUnmount() {
    this.setState({ mounted: false });
  }

  render() {
    const { mounted } = this.state;
    const {
      text,
      marginTop,
      marginBottom,
      showIcon,
      showBackground,
      className,
      animate,
    } = this.props;

    return (
      <CSSTransition
        classNames="error"
        in={!!(mounted && text)}
        timeout={timeout}
        mounOnEnter={true}
        unmountOnExit={true}
        enter={animate}
        exit={animate}
      >
        <Container
          className={`e2e-error-message ${className}`}
          marginTop={marginTop}
          marginBottom={marginBottom}
          role="alert"
        >
          <ContainerInner showBackground={showBackground}>
            {showIcon && (
              <ErrorIcon name="alert-circle" ariaHidden fill={colors.error} />
            )}
            <ErrorMessageText>{text && <p>{text}</p>}</ErrorMessageText>
          </ContainerInner>
        </Container>
      </CSSTransition>
    );
  }
}

export default Error;

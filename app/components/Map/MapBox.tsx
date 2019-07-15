import React, { PureComponent, MouseEvent } from 'react';
import Icon from 'components/UI/Icon';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { lighten } from 'polished';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: strech;
  padding: 30px;
  position: relative;
  background: #fff;
`;

const CloseIcon = styled(Icon)`
  height: 10px;
  fill: ${colors.label};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: fill 100ms ease-out;
`;

const CloseButton = styled.div`
  height: 34px;
  width: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  cursor: pointer;
  top: 12px;
  right: 12px;
  border-radius: 50%;
  border: solid 1px ${lighten(0.4, colors.label)};
  transition: border-color 100ms ease-out;

  &:hover {
    border-color: #000;

    ${CloseIcon} {
      fill: #000;
    }
  }
`;

interface Props {
  opened: boolean;
  onClose: (event: MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

interface State {}

export default class IdeaBox extends PureComponent<Props, State> {
  render() {
    const { opened, onClose, className, children } = this.props;

    if (opened) {
      return (
        <Container className={className}>
          <CloseButton onClick={onClose}>
            <CloseIcon name="close" />
          </CloseButton>

          {children}
        </Container>
      );
    }

    return null;
  }
}

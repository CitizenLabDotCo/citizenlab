import * as React from 'react';
import * as _ from 'lodash';

// components
import Icon from 'components/UI/Icon';

// style
import styled from 'styled-components';
import { darken } from 'polished';

const Container = styled.div`
  width: 23px;
  height: 23px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const NotificationIcon = styled(Icon)`
  height: 23px;
  fill: #84939E;
  transition: all 150ms ease;

  &:hover {
    fill: ${(props) => darken(0.2, props.theme.colors.label)};
  }
`;

const NewNotificationsIndicator = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: solid 2px #fff;
  background: #FF672F;
  position: absolute;
  top: -4px;
  right: -4px;
`;

type Props = {
  count?: number;
  onClick?: () => void;
};

type State = {};

export default class NotificationCount extends React.PureComponent<Props, State> {
  render() {
    const { count } = this.props;

    return (
      <Container onClick={this.props.onClick}>
        <NotificationIcon name="notification" />
        {(_.isNumber(count) && count > 0) ? <NewNotificationsIndicator /> : null}
      </Container>
    );
  }
}

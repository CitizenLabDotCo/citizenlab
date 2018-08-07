import React from 'react';
import { isNumber } from 'lodash';

// components
import Icon from 'components/UI/Icon';

// style
import styled from 'styled-components';
import { darken } from 'polished';
import { colors } from 'utils/styleUtils';

const Container = styled.button`
  width: 24px;
  height: 24px;
  align-items: center;
  cursor: pointer;
  display: flex;
  fill: ${colors.label};
  justify-content: center;
  padding: 0;
  position: relative;

  &:hover,
  &:focus {
    fill: ${darken(.2, colors.label)};
  }
`;

const NotificationIcon = styled(Icon)`
  height: 24px;
  fill: inherit;
  transition: all 150ms ease;`
;

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
        {(isNumber(count) && count > 0) ? <NewNotificationsIndicator /> : null}
      </Container>
    );
  }
}

import React, { PureComponent } from 'react';
import { isNumber } from 'lodash-es';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// components
import Icon from 'components/UI/Icon';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import messages from '../../messages';

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
  outline: none;

  &:hover,
  &:focus {
    fill: ${colors.text};
  }
`;

const NotificationIcon = styled(Icon)`
  height: 24px;
  fill: inherit;
  transition: all 150ms ease;`
;

const NewNotificationsIndicator = styled.div`
  color: #fff;
  font-size: ${fontSizes.xs}px;
  line-height: ${fontSizes.xs}px;
  background: ${colors.clRed};
  padding: 2px;
  border-radius: 5px;
  border: solid 1px #fff;
  position: absolute;
  top: -8px;
  left: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 18px;
  min-height: 18px;
`;

type Props = {
  count?: number;
  onClick?: (event: React.FormEvent<any>) => void;
};

type State = {};

class NotificationCount extends PureComponent<Props & InjectedIntlProps, State> {
  render() {
    const { count } = this.props;

    return (
      <Container aria-label={this.props.intl.formatMessage(messages.notificationsLabel)} onClick={this.props.onClick}>
        <NotificationIcon name="notification" />
        {(isNumber(count) && count > 0) ?
          <NewNotificationsIndicator>
            {count}
          </NewNotificationsIndicator>
          :
          null
        }
      </Container>
    );
  }
}

export default injectIntl<Props>(NotificationCount);

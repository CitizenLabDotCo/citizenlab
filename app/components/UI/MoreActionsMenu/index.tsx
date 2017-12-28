// Libraries
import * as React from 'react';

// Components
import Tooltip from '../Tooltip';
import Button from '../Button';
import Icon, { IconNames } from '../Icon';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Styling
import styled, { css } from 'styled-components';
import { darken } from 'polished';

const MoreOptionsIcon = styled(Icon)`
  fill: ${(props) => props.theme.colors.label};
  transition: all 100ms ease-out;
`;

const StyledTooltip = styled(Tooltip)`
  position: absolute;
  top: 150%;
  left: -12px;
`;

const MoreOptionsIconWrapper = styled.div`
  position: relative;
`;

const MoreOptionsLabel = styled.div`
  color: ${(props) => props.theme.colors.label};
  font-size: 15px;
  font-weight: 300;
  white-space: nowrap;
  margin-left: 10px;
  transition: all 100ms ease-out;
`;

const Container: any = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  user-select: none;

  * {
    user-select: none;
  }

  ${MoreOptionsIcon} {
    height: ${(props: any) => props.height};
  }

  &:hover {
    ${MoreOptionsIcon} {
      fill: #000;
    }

    ${MoreOptionsLabel} {
      color: #000;
    }
  }
`;

const Action = styled(Button)``;

export interface IAction {
  label: string;
  handler: {(): void};
  icon?: IconNames;
}

export interface Props {
  height: string;
  actions: IAction[];
  label?: string | JSX.Element | undefined;
}

interface State {
  visible: boolean;
}

export default class MoreActionsMenu extends React.PureComponent<Props, State> {
  constructor (props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  hideMenu = (event) => {
    event.stopPropagation();
    this.setState({ visible: false });
  }

  toggleMenu = (event) => {
    this.setState(state => ({ visible: !state.visible }));
  }

  render () {
    const { height, label, actions } = this.props;
    const className = this.props['className'];

    if (!actions || actions.length === 0) {
      return null;
    }

    return (
      <Container
        className={className}
        onClick={this.toggleMenu}
        height={height}
      >
        <MoreOptionsIconWrapper>
          <MoreOptionsIcon name="more-options" />
          <StyledTooltip
            visible={this.state.visible}
            hideTooltip={this.hideMenu}
            theme="dark"
            position="bottom"
          >
            {actions.map((action, index) => (
              <Action
                style="text"
                width="100%"
                justify="left"
                key={index}
                onClick={action.handler}
                icon={action.icon}
                text={action.label}
                circularCorners={false}
              />
            ))}
          </StyledTooltip>
        </MoreOptionsIconWrapper>

        {label ? (
          <MoreOptionsLabel>
            {label}
          </MoreOptionsLabel>
        ) : null }
      </Container>
    );
  }

}

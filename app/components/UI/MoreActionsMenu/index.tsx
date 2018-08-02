// Libraries
import React, { PureComponent } from 'react';

// Components
import Tooltip from '../Tooltip';
import Button from '../Button';
import Icon, { IconNames } from '../Icon';

// Styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  position: relative;
  display: inline-block;

  * {
    user-select: none;
    outline: none;
  }
`;

const MoreOptionsIcon = styled(Icon)`
  width: 20px;
  height: 5px;
  fill: ${colors.clGrey};
  transition: all 100ms ease-out;
`;

const MoreOptionsLabel = styled.div`
  color: ${colors.clGrey};
  font-size: 15px;
  font-weight: 400;
  white-space: nowrap;
  margin-left: 10px;
  transition: all 100ms ease-out;
`;

const MoreOptions = styled.div`
  height: 25px;
  display: flex;
  align-items: center;
  cursor: pointer;

  * {
    user-select: none;
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

const MoreOptionsDropdown = styled(Tooltip)`
  position: absolute;
  top: 30px;
  left: -15px;
`;

const Action = styled(Button)``;

export interface IAction {
  label: string | JSX.Element;
  handler: {(): void};
  icon?: IconNames;
}

export interface Props {
  actions: IAction[];
  label?: string | JSX.Element | undefined;
  className?: string;
}

interface State {
  visible: boolean;
}

export default class MoreActionsMenu extends PureComponent<Props, State> {
  constructor (props: Props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  hideMenu = (event) => {
    event.stopPropagation();
    this.setState({ visible: false });
  }

  toggleMenu = () => {
    this.setState(state => ({ visible: !state.visible }));
  }

  render () {
    const { label, actions } = this.props;
    const className = this.props.className;

    if (!actions || actions.length === 0) {
      return null;
    }

    return (
      <Container className={className}>
        <MoreOptions onClick={this.toggleMenu}>
          <MoreOptionsIcon name="more-options" />
          {label && <MoreOptionsLabel>{label}</MoreOptionsLabel>}
        </MoreOptions>

        <MoreOptionsDropdown
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
              size="1"
              key={index}
              onClick={action.handler}
              icon={action.icon}
              text={action.label}
              textColor="#fff"
              textHoverColor="#fff"
              circularCorners={false}
            />
          ))}
        </MoreOptionsDropdown>
      </Container>
    );
  }
}

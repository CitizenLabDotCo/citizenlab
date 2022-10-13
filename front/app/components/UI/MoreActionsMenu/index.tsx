// Libraries
import React, { PureComponent } from 'react';
import { removeFocusAfterMouseClick } from 'utils/helperUtils';

// Components
import { Icon, IconNames } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

// Styling
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const MoreOptionsIcon = styled(Icon)<{ color?: string }>`
  fill: ${({ color }) => color || colors.textSecondary};
  transition: all 100ms ease-out;
`;

const MoreOptionsLabel = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  line-height: normal;
  font-weight: 400;
  white-space: nowrap;
  margin-left: 10px;
  transition: all 100ms ease-out;

  ${media.tablet`
    display: none;
  `}
`;

const MoreOptionsButton = styled.button`
  min-width: 25px;
  min-height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  &:hover,
  &:focus {
    ${MoreOptionsIcon} {
      fill: #000;
    }

    ${MoreOptionsLabel} {
      color: #000;
    }
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-top: 3px;
  margin-bottom: 3px;
`;

const ListItem = styled.button`
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${colors.white};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  white-space: nowrap;
  padding: 10px;
  border-radius: ${(props) => props.theme.borderRadius};
  cursor: pointer;
  white-space: nowrap;
  transition: all 100ms ease-out;

  & > span {
    margin-right: 5px;
  }

  &:hover,
  &:focus {
    color: white;
    background: ${colors.grey600};
  }
`;

export interface IAction {
  label: string | JSX.Element;
  handler: () => void;
  icon?: IconNames;
  name?: string;
}

export interface Props {
  actions: IAction[];
  // required for a11y
  label: string | JSX.Element;
  showLabel?: boolean;
  className?: string;
  color?: string;
  id?: string;
}

interface State {
  visible: boolean;
}

export default class MoreActionsMenu extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  hideMenu = (event) => {
    event.preventDefault();
    this.setState({ visible: false });
  };

  toggleMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    this.setState(({ visible }) => ({ visible: !visible }));
  };

  handleListItemOnClick =
    (handler: () => void) => (event: React.MouseEvent) => {
      event.preventDefault();
      this.setState({ visible: false });
      handler();
    };

  render() {
    const {
      actions,
      showLabel = true,
      color,
      label,
      className,
      id,
    } = this.props;
    const { visible } = this.state;

    if (!actions || actions.length === 0) {
      return null;
    }

    return (
      <Container className={className || ''}>
        <Tippy
          placement="bottom"
          interactive={true}
          trigger="click"
          duration={[200, 0]}
          content={
            <List className="e2e-more-actions-list">
              {actions.map((action, index) => {
                const { handler, label, icon, name } = action;

                return (
                  <ListItem
                    key={index}
                    onMouseDown={removeFocusAfterMouseClick}
                    onClick={this.handleListItemOnClick(handler)}
                    className={name ? `e2e-action-${name}` : undefined}
                  >
                    {label}
                    {icon && <Icon name={icon} />}
                  </ListItem>
                );
              })}
            </List>
          }
        >
          <MoreOptionsButton
            onMouseDown={removeFocusAfterMouseClick}
            onClick={this.toggleMenu}
            aria-expanded={visible}
            id={id}
            className="e2e-more-actions"
          >
            <MoreOptionsIcon
              title={label}
              name="dots-horizontal"
              color={color}
              ariaHidden={!showLabel}
            />
            {showLabel && <MoreOptionsLabel>{label}</MoreOptionsLabel>}
          </MoreOptionsButton>
        </Tippy>
      </Container>
    );
  }
}

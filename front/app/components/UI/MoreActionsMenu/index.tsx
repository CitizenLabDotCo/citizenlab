// Libraries
import React, { PureComponent } from 'react';

// Components
import { Icon, IconNames } from 'cl2-component-library';
import Tippy from '@tippyjs/react';

// Styling
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { lighten } from 'polished';

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const MoreOptionsIcon = styled(Icon)<{ color?: string }>`
  width: 20px;
  height: 6px;
  fill: ${({ color }) => color || colors.label};
  transition: all 100ms ease-out;
`;

const MoreOptionsLabel = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  line-height: normal;
  font-weight: 400;
  white-space: nowrap;
  margin-left: 10px;
  transition: all 100ms ease-out;

  ${media.smallerThanMaxTablet`
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
  color: ${colors.adminLightText};
  font-size: ${fontSizes.small}px;
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
    background: ${lighten(0.12, colors.adminMenuBackground)};
  }
`;

const StyledIcon = styled(Icon)`
  width: 20px;
  height: 20px;
`;

export interface IAction {
  label: string | JSX.Element;
  handler: () => void;
  icon?: IconNames;
  name?: string;
}

export interface Props {
  actions: IAction[];
  label?: string | JSX.Element;
  ariaLabel?: string | JSX.Element;
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

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  toggleMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    this.setState(({ visible }) => ({ visible: !visible }));
  };

  handleListItemOnClick = (handler: () => void) => (
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    this.setState({ visible: false });
    handler();
  };

  render() {
    const { actions, ariaLabel, color, label, className, id } = this.props;
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
                    onMouseDown={this.removeFocus}
                    onClick={this.handleListItemOnClick(handler)}
                    className={name ? `e2e-action-${name}` : undefined}
                  >
                    {label}
                    {icon && <StyledIcon name={icon} />}
                  </ListItem>
                );
              })}
            </List>
          }
        >
          <MoreOptionsButton
            onMouseDown={this.removeFocus}
            onClick={this.toggleMenu}
            aria-expanded={visible}
            id={id}
            className="e2e-more-actions"
          >
            <MoreOptionsIcon
              title={label || ariaLabel}
              name="more-options"
              color={color}
              ariaHidden={!!label}
            />
            {label && <MoreOptionsLabel>{label}</MoreOptionsLabel>}
          </MoreOptionsButton>
        </Tippy>
      </Container>
    );
  }
}

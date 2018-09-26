// Libraries
import React, { PureComponent } from 'react';

// Components
import Popover from 'components/UI/Popover';
import Icon, { IconNames } from 'components/UI/Icon';

// Styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { lighten } from 'polished';

const Container = styled.div`
  position: relative;
  display: inline-block;

  * {
    user-select: none;
  }
`;

const MoreOptionsIcon = styled(Icon)`
  width: 20px;
  height: 6px;
  fill: ${colors.label};
  transition: all 100ms ease-out;
`;

const MoreOptionsLabel = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: ${fontSizes.base}px;
  font-weight: 400;
  white-space: nowrap;
  margin-left: 10px;
  transition: all 100ms ease-out;
`;

const MoreOptions = styled.div`
  height: 20px;
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

const List = styled.div`
  max-height: 210px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin: 6px;
`;

const ListItem = styled.button`
  flex: 1 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${colors.adminLightText};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  white-space: nowrap;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap;

  & > span {
    margin-right: 5px;
  }

  &:hover,
  &:focus {
    outline: none;
    color: white;
    background: ${lighten(.1, colors.adminMenuBackground)};
  }
`;

const StyledIcon  = styled(Icon)`
  width: 20px;
  height: 20px;
`;

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
  constructor (props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  hideMenu = (event) => {
    event.preventDefault();
    this.setState({ visible: false });
  }

  toggleMenu = (event) => {
    event.preventDefault();
    this.setState(({ visible }) => ({ visible: !visible }));
  }

  render () {
    const { actions } = this.props;
    const { visible } = this.state;
    const className = this.props.className;

    if (!actions || actions.length === 0) {
      return null;
    }

    return (
      <Container className={className}>
        <Popover
          content={
            <List>
              {actions.map((action, index) => {
                const { handler, label, icon } = action;
                const onClick = () => {
                  this.setState({ visible: false });
                  handler();
                };

                return (
                  <ListItem key={index} onClick={onClick}>
                    {label}
                    {icon && <StyledIcon name={icon} />}
                  </ListItem>
                );
              })}
            </List>
          }
          top="32px"
          backgroundColor={colors.adminMenuBackground}
          borderColor={colors.adminMenuBackground}
          onClickOutside={this.hideMenu}
          dropdownOpened={visible}
        >
          <MoreOptions onClick={this.toggleMenu}>
            <MoreOptionsIcon name="more-options" />
            {this.props.label && <MoreOptionsLabel>{this.props.label}</MoreOptionsLabel>}
          </MoreOptions>
        </Popover>
      </Container>
    );
  }
}

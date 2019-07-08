// Libraries
import React, { PureComponent } from 'react';

// Components
import Popover from 'components/UI/Popover';
import Icon, { IconNames } from 'components/UI/Icon';

// Styling
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { lighten } from 'polished';

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const MoreOptionsIcon = styled(Icon)`
  width: 20px;
  height: 6px;
  fill: ${colors.label};
  transition: all 100ms ease-out;
`;

const MoreOptionsLabel: any = styled.div`
  color: ${colors.label};
  font-size: ${(props: any) => props.fontSize ? `${props.fontSize}px` : `${fontSizes.base}px`};
  line-height: ${(props: any) => props.fontSize ? `${props.fontSize}px` : `${fontSizes.base}px`};
  font-weight: 400;
  white-space: nowrap;
  margin-left: 10px;
  transition: all 100ms ease-out;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const MoreOptions = styled.button`
  height: 20px;
  display: flex;
  align-items: center;
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
  max-height: 210px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin: 6px;
`;

const ListItem: any = styled.button`
  flex: 1 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${colors.adminLightText};
  font-size: ${(props: any) => props.fontSize ? `${props.fontSize}px` : `${fontSizes.base}px`};
  font-weight: 400;
  white-space: nowrap;
  padding: 10px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  cursor: pointer;
  white-space: nowrap;
  transition: all 100ms ease-out;

  & > span {
    margin-right: 5px;
  }

  &:hover,
  &:focus {
    color: white;
    background: ${lighten(.12, colors.adminMenuBackground)};
  }
`;

const StyledIcon = styled(Icon)`
  width: 20px;
  height: 20px;
`;

export interface IAction {
  label: string | JSX.Element;
  handler: { (): void };
  icon?: IconNames;
  name?: string;
}

export interface Props {
  actions: IAction[];
  label?: string | JSX.Element;
  ariaLabel?: string;
  className?: string;
  fontSize?: number;
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
  }

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  }

  toggleMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    this.setState(({ visible }) => ({ visible: !visible }));
  }

  handleListItemOnClick = (handler: () => void) => (event: React.MouseEvent) => {
    event.preventDefault();
    this.setState({ visible: false });
    handler();
  }

  render() {
    const { actions, ariaLabel, fontSize, id } = this.props;
    const { visible } = this.state;
    const className = this.props.className;

    if (!actions || actions.length === 0) {
      return null;
    }

    return (
      <Container className={className} >
        <Popover
          id={id}
          content={
            <List>
              {actions.map((action, index) => {
                const { handler, label, icon, name } = action;

                return (
                  <ListItem
                    key={index}
                    onMouseDown={this.removeFocus}
                    onClick={this.handleListItemOnClick(handler)}
                    className={`e2e-action-${name}`}
                    fontSize={fontSize}
                  >
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
          <MoreOptions
            aria-label={ariaLabel}
            onMouseDown={this.removeFocus}
            onClick={this.toggleMenu}
          >
            <MoreOptionsIcon title={this.props.label} name="more-options" />
            {this.props.label && <MoreOptionsLabel fontSize={fontSize}>{this.props.label}</MoreOptionsLabel>}
          </MoreOptions>
        </Popover>
      </Container>
    );
  }
}

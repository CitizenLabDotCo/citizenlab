// libraries
import React from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import clickOutside from 'utils/containers/clickOutside';

// style
import styled from 'styled-components';

const Dropdown = styled.div`
  position: relative;
  &>:focus {
    outline: none;
  }
`;

const Menu = styled(clickOutside) `
box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);
border-radius: 5px;
background-color: ${(props: any) => props.color};
border: solid 1px ${(props: any) => props.color};
top: ${(props: any) => props.top};
left: ${(props: any) => props.left || 0};
position: absolute;
z-index: 5;
width: 250px;
max-height: 240px;

* {
  user-select: none;
}

::before,
::after {
  content: '';
  display: block;
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

&.dropdown-enter {
  opacity: 0;
  transform: scale(0.9);

  &.dropdown-enter-active {
    opacity: 1;
    transform: scale(1);
    transition: all 200ms cubic-bezier(0.19, 1, 0.22, 1);
  }
}
:focus {
  outline: none;
  border: 1px solid #044D6C;
}
`;

const DropdownMenu = Menu.extend`
  ::after {
    top: -20px;
    left: 110px;
    border-color: transparent transparent ${(props: any) => props.color} transparent;
    border-width: 10px;
  }

  ::before {
    top: -22px;
    left: 109px;
    border-color: transparent transparent ${(props: any) => props.color} transparent;
    border-width: 11px;
  }
`;

const DropdownMenuUp = Menu.extend`
  ::after {
    bottom: -20px;
    left: 110px;
    border-color: ${(props: any) => props.color} transparent transparent transparent;
    border-width: 10px;
  }

  ::before {
    top: 22px;
    left: 109px;
    border-color: ${(props: any) => props.color} transparent transparent transparent;
    border-width: 11px;
  }
`;

interface Props {
  children: JSX.Element;
  content: JSX.Element;
  top: string;
  left?: string;
  color: string;
  handleDropdownOnClickOutside: (Event) => void;
  dropdownOpened: boolean;
  up?: boolean;
}

export default class PresentationalDropdown extends React.PureComponent<Props> {
  render() {
    const { handleDropdownOnClickOutside, dropdownOpened, children, content, up } = this.props;
    return (
      <Dropdown>
        {children}
        <CSSTransition
          in={dropdownOpened}
          timeout={200}
          mountOnEnter={true}
          unmountOnExit={true}
          classNames="dropdown"
          exit={false}
        >
          {up ? (
            <DropdownMenuUp
              onClickOutside={handleDropdownOnClickOutside}
              {...this.props}
            >
              {content}
            </DropdownMenuUp>) : (
              <DropdownMenu
                onClickOutside={handleDropdownOnClickOutside}
                {...this.props}
              >
                {content}
              </DropdownMenu>)
          }
        </CSSTransition>
      </Dropdown>
    );
  }
}

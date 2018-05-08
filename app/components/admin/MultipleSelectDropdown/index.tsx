// libraries
import React from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import clickOutside from 'utils/containers/clickOutside';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

// Components
import T from 'components/T';

// style
import styled from 'styled-components';

// typing
import { Message, Multiloc } from 'typings';

const DropdownMenu = styled(clickOutside)`
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);
  border: solid 1px #e0e0e0;
  position: absolute;
  top: 35px;
  left: -10px;
  transform-origin: left top;
  z-index: 5;

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

  ::after {
    top: -20px;
    left: 20px;
    border-color: transparent transparent #fff transparent;
    border-width: 10px;
  }

  ::before {
    top: -22px;
    left: 19px;
    border-color: transparent transparent #e0e0e0 transparent;
    border-width: 11px;
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
`;

const DropdownMenuInner = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DropdownList = styled.div`
  max-height: 210px;
  width: 280px;
  display: flex;
  flex-direction: column;
  margin: 10px;
  margin-right: 5px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const DropdownListItem = styled.div`
  color: #044D6C;
  font-size: 16px;
  font-weight: 400;
  text-decoration: none;
  padding: 10px;
  margin-right: 5px;
  background: #fff;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    color: #000;
    text-decoration: none;
    background: #f6f6f6;
  }
`;

const DropdownFooter = styled.div`
  width: 100%;
  color: #000;
  font-size: 18px;
  font-weight: 400;
  text-align: center;
  text-decoration: none;
  padding: 15px 15px;
  cursor: pointer;
  background: #044D6C;
  border-radius: 5px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  transition: all 80ms ease-out;

  &:hover {
    color: #000;
    background: #044D6C;
    text-decoration: none;
  }
`;

type choiceItem = {
  text: Multiloc;
  id: string;
};

interface Props {
  choices: choiceItem[];
  messages: {DropdownFooterMessage: Message};
}

interface State {
  dropdownOpened: boolean;
}

export default class MultipleSelectDropdown extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      dropdownOpened: false
    };
  }

  handleProjectsDropdownOnClickOutside = (event: React.FormEvent<MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ dropdownOpened: false });
  }

  render() {
    const { choices } = this.props;
    return (
      <CSSTransition
        in={this.state.dropdownOpened}
        timeout={200}
        mountOnEnter={true}
        unmountOnExit={true}
        classNames="dropdown"
        exit={false}
      >
        <DropdownMenu onClickOutside={this.handleProjectsDropdownOnClickOutside}>
          <DropdownMenuInner>
            <DropdownList>
              {choices.length > 0 && choices.map((choice) => (
                <DropdownListItem key={choice.id}>
                  <T value={choice.text}/>
                </DropdownListItem>
              ))}
            </DropdownList>

            <DropdownFooter>
              <FormattedMessage {...this.props.messages.DropdownFooterMessage} />
            </DropdownFooter>
          </DropdownMenuInner>
        </DropdownMenu>
      </CSSTransition>
    );
  }
}

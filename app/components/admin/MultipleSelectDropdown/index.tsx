// libraries
import React from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import clickOutside from 'utils/containers/clickOutside';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// Components
import T from 'components/T';
import Checkbox from 'components/UI/Checkbox';

// style
import styled from 'styled-components';

// typing
import { Message, Multiloc } from 'typings';

const Dropdown = styled.div`
  position: relative;
  &>:focus {
    outline: none;
  }
`;

const DropdownMenu = styled(clickOutside)`
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);
  border: solid 1px #e0e0e0;
  position: absolute;
  top: 30px;
  left: -95px;
  transform-origin: left top;
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

  ::after {
    top: -20px;
    left: 110px;
    border-color: transparent transparent #fff transparent;
    border-width: 10px;
  }

  ::before {
    top: -22px;
    left: 109px;
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
  :focus {
    outline: none;
    border: 1px solid #044D6C;
  }
`;

const DropdownMenuInner = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DropdownList = styled.div`
  max-height: 210px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin: 10px;
  margin-right: 5px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const DropdownListItem = styled.button`
  align-items: center;
  color: #044D6C;
  font-size: 16px;
  font-weight: 400;
  padding: 10px;
  padding-left: 15px;
  margin-right: 5px;
  background: #fff;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  flex: 1 0;
  justify-content: space-between !important;

  &:hover, &:focus {
    outline: none;
    color: #000;
    background: #f6f6f6;
  }
`;

const DropdownFooter = styled.div`
  width: 100%;
  color: #fff;
  font-size: 18px;
  font-weight: 400;
  text-align: center;
  padding: 15px 15px;
  cursor: pointer;
  background: #044D6C;
  border-radius: 5px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  transition: all 80ms ease-out;

  &:hover, &:focus {
    color: #000;
    background: #044D6C;
    text-decoration: none;
    outline: none;
  }
`;

type choiceItem = {
  text: Multiloc;
  id: string;
};


interface Props {
  choices: choiceItem[];
  messages: {dropdownFooterMessage: Message};
  onSubmit: (ids: string[]) => void;
  children?: JSX.Element;
}

interface State {
  dropdownOpened: boolean;
  chosen: string[];
}

class MultipleSelectDropdown extends React.PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpened: false,
      chosen: []
    };
  }

  handleDropdownOnClickOutside = (event: React.FormEvent<MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ dropdownOpened: false });
  }
  handleDropdownToggle = () => {
    this.setState(state => ({ dropdownOpened: !state.dropdownOpened }));
  }

  onClickRow = (id) => () => {
    const index = this.state.chosen.indexOf(id);
    if (index < 0) {
      this.setState({ chosen: [...this.state.chosen, id] });
    } else {
      this.setState({ chosen: this.state.chosen.filter((chosenId) => {
        return id !== chosenId;
      })});
    }
  }


  submit = (chosen) => () => {
    if (this.state.chosen.length > 0) {
      this.props.onSubmit(chosen);
      this.setState({ chosen: [], dropdownOpened: false });
    }
  }

  render() {
    const { choices } = this.props;
    return (
      <Dropdown>
        <button onClick={this.handleDropdownToggle}>
          {this.props.children}
        </button>
        <CSSTransition
          in={this.state.dropdownOpened}
          timeout={200}
          mountOnEnter={true}
          unmountOnExit={true}
          classNames="dropdown"
          exit={false}
        >
          <DropdownMenu onClickOutside={this.handleDropdownOnClickOutside}>
            <DropdownMenuInner>
              <DropdownList>
                {choices.length > 0 && choices.map((choice) => {
                  const id = choice.id;
                  return (
                    <DropdownListItem key={id} onClick={this.onClickRow(id)}>
                      <T value={choice.text} truncate={21}/>
                      <Checkbox
                        onChange={this.onClickRow(id)}
                        value={this.state.chosen.includes(id)}
                        size="26px"
                      />
                    </DropdownListItem>
                  );
                })}
              </DropdownList>

              <DropdownFooter onClick={this.submit(this.state.chosen)}>
                <FormattedMessage {...this.props.messages.dropdownFooterMessage} />
              </DropdownFooter>
            </DropdownMenuInner>
          </DropdownMenu>
        </CSSTransition>
      </Dropdown>
    );
  }
}

export default injectIntl(MultipleSelectDropdown);

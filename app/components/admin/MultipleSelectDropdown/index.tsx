// libraries
import React from 'react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

// Components
import T from 'components/T';
import Checkbox from 'components/UI/Checkbox';
import PresentationalDropdown from './PresentationalDropdown';

// style
import styled from 'styled-components';
import { ellipsis } from 'polished';

// typing
import { Message, Multiloc } from 'typings';

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

  & span {
    ${ellipsis('144px') as any}
  }

  &:hover, &:focus {
    outline: none;
    color: #000;
    background: #f6f6f6;
  }

`;

const DropdownFooter = styled.button`
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
  messages: { dropdownFooterMessage: Message };
  onSubmit: (ids: string[]) => Promise<any>;
  children: JSX.Element;
  emitSuccess: (ids: string) => void;
  emitError: () => void;
}

interface State {
  chosen: string[];
  dropdownOpened: boolean;
}

export default class MultipleSelectDropdown extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      chosen: [],
      dropdownOpened: false,
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
      this.setState({
        chosen: this.state.chosen.filter((chosenId) => {
          return id !== chosenId;
        })
      });
    }
  }

  submit = (chosen) => () => {
    if (chosen.length > 0) {
      this.props.onSubmit(chosen).then(() => {
        this.props.emitSuccess(chosen);
        this.setState({ chosen: [], dropdownOpened: false });
      }).catch(() => {
        this.props.emitError();
        this.setState({ dropdownOpened: false });
      });
    }
  }

  renderContent = () => (
    <DropdownMenuInner>
      <DropdownList>
        {this.props.choices.length > 0 && this.props.choices.map((choice) => {
          const id = choice.id;
          return (
            <DropdownListItem key={id} onClick={this.onClickRow(id)} className="e2e-dropdown-item">
              <T value={choice.text} />
              <Checkbox
                onChange={this.onClickRow(id)}
                value={this.state.chosen.includes(id)}
                size="26px"
              />
            </DropdownListItem>
          );
        })}
      </DropdownList>

      <DropdownFooter onClick={this.submit(this.state.chosen)} className="e2e-dropdown-submit">
        <FormattedMessage {...this.props.messages.dropdownFooterMessage} />
      </DropdownFooter>
    </DropdownMenuInner>
  )

  render() {
    // Thanks for your concern a11y, but I'm wrapping a button, this not the best, but pretty accessible.
    return (
      <PresentationalDropdown
        content={this.renderContent()}
        top="45px"
        color="#fff"
        handleDropdownOnClickOutside={this.handleDropdownOnClickOutside}
        dropdownOpened={this.state.dropdownOpened}
      >
        <div role="button" onClick={this.handleDropdownToggle}>
          {this.props.children}
        </div>
      </PresentationalDropdown>
    );
  }
}

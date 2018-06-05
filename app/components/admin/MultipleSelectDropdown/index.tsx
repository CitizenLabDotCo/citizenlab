// libraries
import React from 'react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

// Components
import T from 'components/T';
import Checkbox from 'components/UI/Checkbox';
import StatefulDropdown from './StatefulDropdown';

// style
import styled from 'styled-components';

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
  &.success {
    background: green;
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
  children: JSX.Element;
}

interface State {
  chosen: string[];
  status: undefined | 'success' | 'error';
}

export default class MultipleSelectDropdown extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      chosen: [],
      status: undefined,
    };
  }

  onClickRow = (id) => () => {
    const index = this.state.chosen.indexOf(id);
    if (index < 0) {
      this.setState({ chosen: [...this.state.chosen, id], status: undefined });
    } else {
      this.setState({ chosen: this.state.chosen.filter((chosenId) => {
        return id !== chosenId;
      }), status: undefined});
    }
  }


  submit = (chosen) => () => {
    if (this.state.chosen.length > 0) {
      this.props.onSubmit(chosen);
      this.setState({ chosen: [], status: 'success' });
    }
  }

  renderContent = () => (
    <DropdownMenuInner>
      <DropdownList>
        {this.props.choices.length > 0 && this.props.choices.map((choice) => {
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

      <DropdownFooter onClick={this.submit(this.state.chosen)} className={(this.state.status) ? this.state.status : ''}>
        <FormattedMessage {...this.props.messages.dropdownFooterMessage} />
      </DropdownFooter>
    </DropdownMenuInner>
  )

  render() {
    return (
      <StatefulDropdown
        content={this.renderContent()}
        top="45px"
        color="#fff"
      >
      {this.props.children}
      </StatefulDropdown>
    );
  }
}

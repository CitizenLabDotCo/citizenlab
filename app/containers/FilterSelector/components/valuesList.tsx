// Libraries
import * as React from 'react';
import * as _ from 'lodash';
import styledComponents from 'styled-components';
const styled = styledComponents;

// Components
import Icon from 'components/UI/Icon';

// Styles
const Overlay = styled.div`
  border-radius: 5px;
  background-color: #ffffff;
  box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.1);
  border: solid 1px #eaeaea;
  display: none;
  padding: 10px;
  position: absolute;
  top: 2rem;
  right: -22px;
  z-index: 10;

  &.deployed {
    display: block;
  }

  ::after {
    border-color: white;
    border-left-color: transparent;
    border-right-color: transparent;
    border-style: solid;
    border-top-color: transparent;
    border-width: 1rem;
    content: "";
    display: block;
    position:absolute;
    top: -2rem;
    right: 1rem;
  }
`;

const ListWrapper = styled.ul`
  list-style: none;
  margin: 0;
  max-height: 15rem;
  overflow-y: auto;
  padding: 0;
`;

const StyledOption = styled.li`
  padding: .8rem;
  color: #888;
  display: flex;

  :hover, &.focused {
    background-color: #f9f9f9;
    color: #222;
  }
`;

const OptionText = styled.span`
  flex: 1;
`;

const Checkmark: any = styled.span`
  background: ${(props: any) => props.selected ? '#32b67a' : '#fff'};
  border-color: ${(props: any) => props.selected ? '#32b67a' : '#a6a6a6'};
  border-radius: 3px;
  border-style: solid;
  border-width: 1px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, .1);
  color: white;
  display: inline-block;
  height: 1.5rem;
  margin-left: .5rem;
  text-align: center;
  width: 1.5rem;

  svg {
    transform: scale(.8);
    display: ${(props: any) => props.selected ? 'block' : 'none'};
  }
`;

type Value = {
  text: string,
  value: any,
};

type Props = {
  values: Value[]
  onChange: Function,
  selected: any[],
  multiple?: boolean,
  deployed: boolean,
  baseID: string,
};

type State = {
  currentFocus: number
};

export default class ValuesList extends React.PureComponent<Props, State> {
  state: State;

  constructor() {
    super();
    this.state = {
      currentFocus: 0,
    };
  }

  isSelected(value: Value): boolean {
    return _.includes(this.props.selected, value);
  }

  updateFocus = (newIndex: number): void => {
    this.setState({ currentFocus: newIndex });

    const focusedElement = document.getElementById(`${this.props.baseID}-${newIndex}`);

    if (focusedElement) {
      focusedElement.scrollIntoView();
    }
  }

  keypressHandler = (event): void => {
    const keyCodes = {
      BACKSPACE: 8,
      TAB: 9,
      RETURN: 13,
      ESC: 27,
      SPACE: 32,
      PAGE_UP: 33,
      PAGE_DOWN: 34,
      END: 35,
      HOME: 36,
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40,
      DELETE: 46,
    };
    const maxIndex = this.props.values.length - 1;

    switch (event.keyCode) {
      case keyCodes.UP:
        event.preventDefault();
        this.updateFocus(Math.max(0, this.state.currentFocus - 1));
        break;
      case keyCodes.DOWN:
        event.preventDefault();
        this.updateFocus(Math.min(maxIndex, this.state.currentFocus + 1));
        break;
      case keyCodes.HOME:
        event.preventDefault();
        this.updateFocus(0);
        break;
      case keyCodes.END:
        event.preventDefault();
        this.updateFocus(maxIndex);
        break;
      case keyCodes.SPACE:
        event.preventDefault();
        this.props.onChange(this.props.values[this.state.currentFocus].value);
        break;

      default:
        break;
    }
  }

  render() {
    const { values, multiple, deployed, baseID } = this.props;
    const { currentFocus } = this.state;

    return (
      <Overlay className={deployed ? 'deployed' : ''}>
        <ListWrapper
          onKeyDown={this.keypressHandler}
          role="listbox"
          tabIndex={0}
          aria-labelledby={`${baseID}-label`}
          aria-multiselectable={multiple}
          aria-activedescendant={`${baseID}-${currentFocus}`}
        >
          {values && values.map((entry, index) => {
            const clickHandler = () => { this.props.onChange(entry.value); };

            return (
              <StyledOption
                id={`${baseID}-${index}`}
                role="option"
                aria-selected={this.isSelected(entry.value)}
                key={entry.value}
                onClick={clickHandler}
                className={currentFocus === index ? 'focused' : ''}
              >
                <OptionText>{entry.text}</OptionText>
                {multiple && <Checkmark selected={this.isSelected(entry.value)}>
                  <Icon name="checkmark" />
                </Checkmark>}
              </StyledOption>
            );
          }
          )}
        </ListWrapper>
      </Overlay>
    );
  }
}

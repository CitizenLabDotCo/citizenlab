import * as React from 'react';
import { includes } from 'lodash';

// components
import Checkbox from 'components/UI/Checkbox';

// animation
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const timeout = 200;
const easing = `cubic-bezier(0.19, 1, 0.22, 1)`;

const Overlay = styled.div`
  min-width: 180px;
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.15);
  border: solid 1px #e0e0e0;
  padding-right: 5px;
  padding-left: 5px;
  padding-top: 10px;
  padding-bottom: 10px;
  position: absolute;
  top: 35px;
  right: -10px;
  z-index: 2;
  transform-origin: right top;

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
    right: 20px;
    border-color: transparent transparent #fff transparent;
    border-width: 10px;
  }

  ::before {
    top: -22px;
    right: 19px;
    border-color: transparent transparent #e0e0e0 transparent;
    border-width: 11px;
  }

  &.overlay-enter {
    opacity: 0;
    transform: scale(0.9);

    &.overlay-enter-active {
      opacity: 1;
      transform: scale(1);
      transition: all ${timeout}ms ${easing};
    }
  }
`;

const ListWrapper = styled.ul`
  list-style: none;
  margin: 0;
  max-height: 320px;
  overflow-y: auto;
  padding: 0;

  ${media.smallerThanMinTablet`
    max-height: 220px;
  `}
`;

const StyledOption: any = styled.li`
  color: ${(props) => props.theme.colors.label};
  font-size: 17px;
  font-weight: 400;
  padding: 10px 15px;
  background: #fff;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 5px;
  margin-left: 5px;
  margin-right: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 80ms ease-out;

  &:last {
    margin-bottom: 0px;
  }

  &.focused,
  &:hover {
    color: #000;
    background: #f6f6f6;
  }
`;

const OptionText = styled.span`
  flex: 1;
  white-space: nowrap;
  margin-right: 10px;
`;

type Value = {
  text: string | JSX.Element;
  value: any;
};

type Props = {
  title: string | JSX.Element;
  values: Value[];
  onChange: (arg: string) => void;
  selected: any[];
  multiple?: boolean;
  deployed: boolean;
  baseID: string;
};

type State = {
  currentFocus: number;
};

export default class ValuesList extends React.PureComponent<Props, State> {
  dropdownElement: HTMLElement | null;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      currentFocus: 0
    };
    this.dropdownElement = null;
  }

  componentWillUnmount() {
    if (this.dropdownElement) {
      this.dropdownElement.removeEventListener('wheel', this.scrolling, false);
    }
  }

  scrolling = (event: WheelEvent) => {
    if (this.dropdownElement) {
      const deltaY = (event.deltaMode === 1 ? event.deltaY * 20 : event.deltaY);
      this.dropdownElement.scrollTop += deltaY;
      event.preventDefault();
    }
  }

  setRef = (element: HTMLElement) => {
    if (element) {
      this.dropdownElement = element;

      if (this.dropdownElement) {
        this.dropdownElement.addEventListener('wheel', this.scrolling, false);
      }
    }
  }

  isSelected(value: Value) {
    return includes(this.props.selected, value);
  }

  updateFocus = (newIndex: number) => {
    this.setState({ currentFocus: newIndex });

    const focusedElement = document.getElementById(`${this.props.baseID}-${newIndex}`);

    if (focusedElement) {
      focusedElement.scrollIntoView();
    }
  }

  keypressHandler = (event) => {
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

  handleOnToggle = (entry, index) => (event: React.FormEvent<MouseEvent>) => {
    event.preventDefault();
    this.setState({ currentFocus: index });
    this.props.onChange(entry.value);
  }

  render() {
    const { values, multiple, deployed, baseID } = this.props;
    const { currentFocus } = this.state;

    const dropdown = ((deployed) ? (
      <CSSTransition
        classNames="overlay"
        timeout={timeout}
        exit={false}
      >
        <Overlay className="deployed">
          <ListWrapper
            onKeyDown={this.keypressHandler}
            role="listbox"
            tabIndex={0}
            innerRef={this.setRef}
            className="e2e-filter-selector-dropdown-list"
            aria-labelledby={`${baseID}-label`}
            aria-multiselectable={multiple}
            aria-activedescendant={`${baseID}-${currentFocus}`}
          >
            {values && values.map((entry, index) => {
              const checked = this.isSelected(entry.value);
              const focussed = currentFocus === index ? 'focused' : '';

              return (
                <StyledOption
                  id={`${baseID}-${index}`}
                  role="option"
                  aria-selected={checked}
                  selected={checked}
                  key={entry.value}
                  onClick={this.handleOnToggle(entry, index)}
                  className={`${focussed}`}
                >
                  <OptionText>{entry.text}</OptionText>

                  {multiple &&
                    <Checkbox size="22px" checked={checked} toggle={this.handleOnToggle(entry, index)} />
                  }
                </StyledOption>
              );
            }
            )}
          </ListWrapper>
        </Overlay>
      </CSSTransition>
    ) : null);

    return (
      <TransitionGroup>
        {dropdown}
      </TransitionGroup>
    );
  }
}

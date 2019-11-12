import React, { PureComponent } from 'react';
import { includes, isNil } from 'lodash-es';

// components
import Checkbox from 'components/UI/Checkbox';
import Dropdown from 'components/UI/Dropdown';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const ListItemText = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 21px;
  text-align: left;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

const ListItemCheckbox = styled(Checkbox)`
  margin-left: 10px;
`;

const ListItem = styled.li`
  width: 100%;
  display: flex;
  align-items: center;
  margin: 0px;
  margin-bottom: 4px;
  padding: 10px;
  list-style: none;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  cursor: pointer;
  transition: all 80ms ease-out;

  &.last {
    margin-bottom: 0px;
  }

  &:hover,
  &:focus,
  &.selected {
    background: ${colors.clDropdownHoverBackground};

    ${ListItemText} {
      color: #000;
    }
  }
`;

interface Value {
  text: string | JSX.Element;
  value: any;
}

interface DefaultProps {
  width?: string;
  mobileWidth?: string;
  maxHeight?: string;
  mobileMaxHeight?: string;
  top?: string;
  left? : string;
  mobileLeft?: string;
  right?: string;
  mobileRight?: string;
}

interface Props extends DefaultProps {
  title: string | JSX.Element;
  values: Value[];
  onChange: (arg: string) => void;
  onClickOutside?: (event: FormEvent) => void;
  selected: any[];
  right?: string;
  mobileRight?: string;
  multiple?: boolean;
  opened: boolean;
  baseID: string;
}

interface State {}

export default class ValuesList extends PureComponent<Props, State> {
  static defaultProps: DefaultProps = {
    width: undefined,
    mobileWidth: undefined,
    maxHeight: undefined,
    mobileMaxHeight: undefined,
    top: '34px',
    left: undefined,
    mobileLeft: undefined,
    right: undefined,
    mobileRight:undefined
  };

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  }

  handleOnToggle = (entry) => (event: React.MouseEvent | React.KeyboardEvent) => {
    if (event.type === 'click' || (event.type === 'keydown' && event['key'] === 'Enter')) {
      event.preventDefault();
      this.props.onChange(entry.value);
    }
  }

  handleOnClickOutside = (event: FormEvent) => {
    this.props.onClickOutside && this.props.onClickOutside(event);
  }

  render() {
    const { values, selected, multiple, opened, baseID, width, mobileWidth, maxHeight, mobileMaxHeight, top, left, mobileLeft, right, mobileRight } = this.props;

    // ARIA reference example: https://www.w3.org/TR/wai-aria-practices/examples/listbox/listbox-collapsible.html
    return (
      <Dropdown
        width={width}
        mobileWidth={mobileWidth}
        maxHeight={maxHeight}
        mobileMaxHeight={mobileMaxHeight}
        top={top}
        left={left}
        mobileLeft={mobileLeft}
        right={right}
        mobileRight={mobileRight}
        opened={opened}
        onClickOutside={this.handleOnClickOutside}
        content={(
          <List
            className="e2e-sort-items"
            tabIndex={-1}
            role="listbox"
          >
            {values && values.map((entry, index) => {
              const checked = includes(selected, entry.value);
              const last = (index === values.length - 1);
              const classNames = [
                `e2e-sort-item-${entry.value !== '-new' ? entry.value : 'old'}`,
                !multiple && checked ? 'selected' : null,
                last ? 'last' : null,
              ].filter(item => !isNil(item)).join(' ');

              return (
                <ListItem
                  id={`${baseID}-${index}`}
                  role="option"
                  aria-posinset={index + 1}
                  aria-selected={checked}
                  key={entry.value}
                  onMouseDown={this.removeFocus}
                  onKeyDown={this.handleOnToggle(entry)}
                  onClick={this.handleOnToggle(entry)}
                  tabIndex={0}
                  className={classNames}
                >
                  <ListItemText>
                    {entry.text}
                  </ListItemText>

                  {multiple &&
                    <ListItemCheckbox
                      checked={checked}
                      onChange={this.handleOnToggle(entry)}
                    />
                  }
                </ListItem>
              );
            }
            )}
          </List>
        )}
      />
    );
  }
}

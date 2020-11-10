import React, { PureComponent } from 'react';
import { includes, isNil } from 'lodash-es';

// components
import Checkbox from 'components/UI/Checkbox';
import { Dropdown } from 'cl2-component-library';

// style
import styled from 'styled-components';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const ListItemText = styled.span`
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
  ${isRtl`
    text-align: right;
  `}
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

const CheckboxListItem = styled.li`
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
  padding: 0 10px;

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

const CheckboxLabel = styled.span`
  flex: 1;
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 21px;
  text-align: left;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  display: block;
  padding: 10px 0;
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
  left?: string;
  mobileLeft?: string;
  right?: string;
  mobileRight?: string;
}

interface Props extends DefaultProps {
  title: string | JSX.Element;
  values: Value[];
  onChange: (arg: string) => void;
  onClickOutside?: (event: React.FormEvent) => void;
  selected: any[];
  right?: string;
  mobileRight?: string;
  multipleSelectionAllowed?: boolean;
  opened: boolean;
  baseID: string;
  name: string;
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
    mobileRight: undefined,
  };

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  handleOnToggleCheckbox = (entry) => (_event: React.ChangeEvent) => {
    this.props.onChange(entry.value);
  };

  handleOnSelectSingleValue = (entry) => (
    event: React.MouseEvent | React.KeyboardEvent
  ) => {
    if (
      event.type === 'click' ||
      (event.type === 'keydown' && event['key'] === 'Enter')
    ) {
      event.preventDefault();
      this.props.onChange(entry.value);
    }
  };

  handleOnClickOutside = (event: React.FormEvent) => {
    this.props.onClickOutside && this.props.onClickOutside(event);
  };

  render() {
    const {
      values,
      selected,
      multipleSelectionAllowed,
      opened,
      baseID,
      width,
      mobileWidth,
      maxHeight,
      mobileMaxHeight,
      top,
      left,
      mobileLeft,
      right,
      mobileRight,
      name,
    } = this.props;

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
        content={
          <List
            className="e2e-sort-items"
            tabIndex={-1}
            role="listbox"
            aria-multiselectable={multipleSelectionAllowed}
          >
            {values &&
              values.map((entry, index) => {
                const checked = includes(selected, entry.value);
                const last = index === values.length - 1;
                const classNames = [
                  `e2e-sort-item-${
                    entry.value !== '-new' ? entry.value : 'old'
                  }`,
                  !multipleSelectionAllowed && checked ? 'selected' : '',
                  last ? 'last' : '',
                ]
                  .filter((item) => !isNil(item))
                  .join(' ');

                return multipleSelectionAllowed ? (
                  <CheckboxListItem
                    id={`${baseID}-${index}`}
                    role="option"
                    aria-posinset={index + 1}
                    aria-selected={checked}
                    key={entry.value}
                    onMouseDown={this.removeFocus}
                    className={classNames}
                  >
                    <Checkbox
                      checked={checked}
                      onChange={this.handleOnToggleCheckbox(entry)}
                      label={<CheckboxLabel>{entry.text}</CheckboxLabel>}
                      name={name}
                    />
                  </CheckboxListItem>
                ) : (
                  <ListItem
                    id={`${baseID}-${index}`}
                    role="option"
                    aria-posinset={index + 1}
                    aria-selected={checked}
                    key={entry.value}
                    onMouseDown={this.removeFocus}
                    className={classNames}
                    onClick={this.handleOnSelectSingleValue(entry)}
                    onKeyDown={this.handleOnSelectSingleValue(entry)}
                    tabIndex={0}
                  >
                    <ListItemText>{entry.text}</ListItemText>
                  </ListItem>
                );
              })}
          </List>
        }
      />
    );
  }
}

// TODO: page jump on landing page (doesn't happen on projects page)

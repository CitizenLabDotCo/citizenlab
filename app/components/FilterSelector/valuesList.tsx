import React, { PureComponent, FormEvent } from 'react';
import { includes, isNil } from 'lodash-es';

// components
import AccessibleCheckbox from 'components/UI/AccessibleCheckbox';
import Dropdown from 'components/UI/Dropdown';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const List = styled.div`
  width: 100%;
`;

const ListItemText = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 21px;
  text-align: left;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
`;

const ListItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0px;
  margin-bottom: 4px;
  padding: 10px;
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

const StyledCheckbox = styled(AccessibleCheckbox)`
  margin-left: 10px;
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

  removeFocus = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  }

  handleOnToggle = (entry, index) => (event: FormEvent) => {
    event.preventDefault();
    this.setState({ currentFocus: index });
    this.props.onChange(entry.value);
  }

  render() {
    const { values, selected, multiple, opened, baseID, width, mobileWidth, maxHeight, mobileMaxHeight, top, left, mobileLeft, right, mobileRight } = this.props;

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
        content={(
          <List className="e2e-sort-items">
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
                  onClick={this.handleOnToggle(entry, index)}
                  className={classNames}
                >
                  <ListItemText>{entry.text}</ListItemText>

                  {multiple &&
                    <StyledCheckbox
                      checked={checked}
                      onChange={this.handleOnToggle(entry, index)}
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

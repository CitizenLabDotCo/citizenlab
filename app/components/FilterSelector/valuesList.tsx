import React, { PureComponent, FormEvent } from 'react';
import { includes } from 'lodash';

// components
import Checkbox from 'components/UI/Checkbox';
import Dropdown from 'components/UI/Dropdown';

// style
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';

const List = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const ListItem = styled.button`
  color: ${colors.label};
  font-size: 17px;
  font-weight: 400;
  line-height: 22px;
  text-decoration: none;
  padding: 10px;
  background: #fff;
  border-radius: 5px;
  padding: 10px;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 80ms ease-out;

  &:hover,
  &:focus {
    color: ${colors.clGreyHover};
    background: ${colors.clDropdownHoverBackground};
  }
`;

const OptionText = styled.span`
  flex: 1;
  margin-right: 10px;
`;

/*
  color: ${colors.label};
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
    color: ${colors.clGreyHover};
    background: ${colors.clDropdownHoverBackground};
  }
*/

/*
const ProjectsListItem = styled(Link)`
  color: ${colors.label};
  font-size: 17px;
  font-weight: 400;
  line-height: 22px;
  text-decoration: none;
  padding: 10px;
  background: #fff;
  border-radius: 5px;
  padding: 10px;
  text-decoration: none;

  &:hover,
  &:focus {
    color: ${colors.clGreyHover};
    background: ${colors.clDropdownHoverBackground};
    text-decoration: none;
  }
`;
*/

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
  maxWidth?: string | null | undefined;
  mobileMaxWidth?: string | null | undefined;
  enterFrom?: 'left' | 'right';
};

type State = {};

export default class ValuesList extends PureComponent<Props, State> {
  handleOnToggle = (entry, index) => (event: FormEvent) => {
    event.preventDefault();
    this.setState({ currentFocus: index });
    this.props.onChange(entry.value);
  }

  render() {
    const { values, multiple, deployed, baseID } = this.props;

    return (
      <Dropdown
        top="30px"
        right="-10px"
        opened={deployed}
        content={(
          <List className="e2e-filter-selector-dropdown-list">
            {values && values.map((entry, index) => {
              const checked = includes(this.props.selected, entry.value);

              return (
                <ListItem
                  id={`${baseID}-${index}`}
                  role="option"
                  aria-posinset={index + 1}
                  aria-selected={checked}
                  key={entry.value}
                  onClick={this.handleOnToggle(entry, index)}
                >
                  <OptionText>{entry.text}</OptionText>

                  {multiple &&
                    <Checkbox value={checked} onChange={this.handleOnToggle(entry, index)} />
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

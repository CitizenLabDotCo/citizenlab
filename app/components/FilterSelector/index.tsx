import React, { PureComponent } from 'react';
import {
  isArray,
  find,
  isEmpty,
  isString,
  cloneDeep,
  includes,
  without,
} from 'lodash-es';

// components
import Title from './title';
import ValuesList from './valuesList';

// style
import styled from 'styled-components';
import { media, isRtl } from 'utils/styleUtils';

const Container = styled.div`
  display: inline-block;
  position: relative;

  &:not(:last-child) {
    margin-right: 40px;

    ${media.smallerThanMaxTablet`
      margin-right: 30px;
    `}

    ${media.smallerThanMinTablet`
      margin-right: 25px;
    `}

    ${media.smallPhone`
      margin-right: 20px;
    `}
  }

  &.last {
    margin-right: 0px;
  }

  ${isRtl`
    &:not(:last-child) {
      margin-left: 40px;

      ${media.smallerThanMaxTablet`
        margin-left: 30px;
      `}

      ${media.smallPhone`
        margin-left: 20px;
      `}
    }

    &.last {
      margin-left: 0px;
    }
  `}
`;

export interface IFilterSelectorValue {
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
  last?: boolean;
}

interface Props extends DefaultProps {
  id?: string | undefined;
  title: string | JSX.Element;
  name: string;
  values: IFilterSelectorValue[];
  onChange?: (value: any) => void;
  multipleSelectionAllowed: boolean;
  selected: string[];
}

interface State {
  opened: boolean;
}

export default class FilterSelector extends PureComponent<Props, State> {
  baseID: string;

  static defaultProps: DefaultProps = {
    width: undefined,
    mobileWidth: undefined,
    maxHeight: undefined,
    mobileMaxHeight: undefined,
    top: undefined,
    left: undefined,
    mobileLeft: undefined,
    right: undefined,
    mobileRight: undefined,
  };

  constructor(props) {
    super(props);
    this.state = {
      opened: false,
    };
    this.baseID = `filter-${Math.floor(Math.random() * 10000000)}`;
  }

  getTitle = (selection, values, multipleSelectionAllowed, title) => {
    let newTitle: any = '';

    if (
      !multipleSelectionAllowed &&
      isArray(selection) &&
      !isEmpty(selection)
    ) {
      const selected = find(values, { value: selection[0] });
      newTitle = selected ? selected['text'] : '';
    } else if (isArray(selection) && !isEmpty(selection)) {
      if (isString(title)) {
        newTitle = `${title} (${selection.length})`;
      } else {
        newTitle = [
          title,
          ' ',
          <span key={Math.floor(Math.random() * 10000000)}>
            ({selection.length})
          </span>,
        ];
      }
    } else {
      newTitle = title;
    }

    return newTitle;
  };

  toggleExpanded = () => {
    this.setState((state) => ({ opened: !state.opened }));
  };

  closeExpanded = () => {
    this.setState({ opened: false });
  };

  selectionChange = (value: string) => {
    let newSelection = cloneDeep(this.props.selected);

    if (!this.props.multipleSelectionAllowed) {
      newSelection = [value];
    } else if (includes(newSelection, value)) {
      newSelection = without(newSelection, value);
    } else {
      newSelection.push(value);
    }

    if (this.props.onChange) {
      this.props.onChange(newSelection);
    }

    if (!this.props.multipleSelectionAllowed) {
      this.closeExpanded();
    }
  };

  handleClickOutside = () => {
    this.closeExpanded();
  };

  render() {
    const className = this.props['className'];
    const { opened } = this.state;
    const {
      id,
      values,
      multipleSelectionAllowed,
      selected,
      title,
      width,
      mobileWidth,
      maxHeight,
      mobileMaxHeight,
      top,
      left,
      mobileLeft,
      right,
      mobileRight,
      last,
      name,
    } = this.props;
    const currentTitle = this.getTitle(
      selected,
      values,
      multipleSelectionAllowed,
      title
    );

    return (
      <Container
        id={id}
        className={`e2e-filter-selector-${this.props.name} ${className} ${
          last ? 'last' : ''
        }`}
      >
        <Title
          key={this.baseID}
          title={currentTitle}
          opened={opened}
          onClick={this.toggleExpanded}
          baseID={this.baseID}
        />
        <ValuesList
          title={currentTitle}
          opened={opened}
          values={values}
          selected={selected}
          onChange={this.selectionChange}
          onClickOutside={this.handleClickOutside}
          multipleSelectionAllowed={multipleSelectionAllowed}
          baseID={this.baseID}
          width={width}
          mobileWidth={mobileWidth}
          maxHeight={maxHeight}
          mobileMaxHeight={mobileMaxHeight}
          top={top}
          left={left}
          mobileLeft={mobileLeft}
          right={right}
          mobileRight={mobileRight}
          name={name}
        />
      </Container>
    );
  }
}

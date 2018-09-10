import React, { PureComponent } from 'react';
import { isArray, find, isEmpty, isString, cloneDeep, includes, without } from 'lodash-es';

// components
import Title from './title';
import ValuesList from './valuesList';
import clickOutside from 'utils/containers/clickOutside';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled(clickOutside)`
  display: inline-block;
  position: relative;
  user-select: none;
  outline: none;

  &:not(:last-child) {
    margin-right: 40px;

    ${media.smallerThanMaxTablet`
      margin-right: 30px;
    `}

    ${media.smallPhone`
      margin-right: 20px;
    `}
  }

  * {
    user-select: none;
  }
`;

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
  id?: string | undefined;
  title: string | JSX.Element;
  name: string;
  values: {
    text: string | JSX.Element,
    value: any
  }[];
  onChange?: (value: any) => void;
  multiple: boolean;
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
    mobileRight:undefined
  };

  constructor(props) {
    super(props);
    this.state = {
      opened: false
    };
    this.baseID = `filter-${Math.floor(Math.random() * 10000000)}`;
  }

  getTitle = (selection, values, multiple, title) => {
    let newTitle: any = '';

    if (!multiple && isArray(selection) && !isEmpty(selection)) {
      const selected = find(values, { value: selection[0] });
      newTitle = selected ? selected['text'] : '';
    } else if (isArray(selection) && !isEmpty(selection)) {
      if (isString(title)) {
        newTitle = `${title} (${selection.length})`;
      } else {
        newTitle = [
          title,
          ' ',
          <span key={Math.floor(Math.random() * 10000000)}>({selection.length})</span>
        ];
      }
    } else {
      newTitle = title;
    }

    return newTitle;
  }

  toggleExpanded = () => {
    this.setState(state => ({ opened: !state.opened }));
  }

  closeExpanded = () => {
    this.setState({ opened: false });
  }

  selectionChange = (value: string) => {
    let newSelection = cloneDeep(this.props.selected);

    if (!this.props.multiple) {
      newSelection = [value];
    } else if (includes(newSelection, value)) {
      newSelection = without(newSelection, value);
    } else {
      newSelection.push(value);
    }

    if (this.props.onChange) {
      this.props.onChange(newSelection);
    }

    if (!this.props.multiple) {
      this.closeExpanded();
    }
  }

  handleClickOutside = () => {
    this.closeExpanded();
  }

  render() {
    const className = this.props['className'];
    const { opened } = this.state;
    const { id, values, multiple, selected, title, width, mobileWidth, maxHeight, mobileMaxHeight, top, left, mobileLeft, right, mobileRight } = this.props;
    const currentTitle = this.getTitle(selected, values, multiple, title);

    return (
      <Container
        id={id}
        onClickOutside={this.handleClickOutside}
        className={`e2e-filter-selector-${this.props.name} ${className}`}
      >
        <Title
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
          multiple={multiple}
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
        />
      </Container>
    );
  }
}

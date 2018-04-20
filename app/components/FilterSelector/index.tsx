import * as React from 'react';
import { isArray, find, isEmpty, isString, cloneDeep, includes, without } from 'lodash';

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
  outline: none;
  user-select: none;

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
    outline: none;
    user-select: none;
  }
`;

interface Props {
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
  maxWidth?: string | null | undefined;
  mobileMaxWidth?: string | null | undefined;
}

interface State {
  deployed: boolean;
}

export default class FilterSelector extends React.PureComponent<Props, State> {
  baseID: string;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      deployed: false
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
    this.setState(state => ({ deployed: !state.deployed }));
  }

  closeExpanded = () => {
    this.setState({ deployed: false });
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
    const { deployed } = this.state;
    const { id, values, multiple, selected, title, maxWidth, mobileMaxWidth } = this.props;
    const currentTitle = this.getTitle(selected, values, multiple, title);

    return (
      <Container
        id={id}
        onClickOutside={this.handleClickOutside}
        className={`e2e-filter-selector-${this.props.name} ${className}`}
      >
        <Title
          title={currentTitle}
          deployed={deployed}
          onClick={this.toggleExpanded}
          baseID={this.baseID}
        />
        <ValuesList
          title={currentTitle}
          deployed={deployed}
          values={values}
          selected={selected}
          onChange={this.selectionChange}
          multiple={multiple}
          baseID={this.baseID}
          maxWidth={maxWidth}
          mobileMaxWidth={mobileMaxWidth}
        />
      </Container>
    );
  }
}

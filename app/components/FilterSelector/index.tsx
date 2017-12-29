import * as React from 'react';
import * as _ from 'lodash';

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
}

interface State {
  deployed: boolean;
  currentTitle: string | JSX.Element;
}

export default class FilterSelector extends React.PureComponent<Props, State> {
  state: State;
  baseID: string;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      deployed: false,
      currentTitle: this.getTitle(props.selected, props.values, props.multiple, props.title),
    };
    this.baseID = `filter-${Math.floor(Math.random() * 10000000)}`;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ currentTitle: this.getTitle(nextProps.selected) });
  }

  getTitle = (selection, values = this.props.values, multiple = this.props.multiple, title = this.props.title) => {
    let newTitle: any = '';

    if (!multiple && _.isArray(selection) && !_.isEmpty(selection)) {
      const selected = _.find(values, { value: selection[0] });
      newTitle = selected ? selected.text : '';
    } else if (_.isArray(selection) && !_.isEmpty(selection)) {
      if (_.isString(title)) {
        newTitle = `${title} (${selection.length})`;
      } else {
        newTitle = [
          title,
          ' ',
          <span key={1}>({selection.length})</span>
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

  selectionChange = (value) => {
    let newSelection = _.cloneDeep(this.props.selected);

    if (!this.props.multiple) {
      newSelection = [value];
    } else if (_.includes(newSelection, value)) {
      newSelection = _.without(newSelection, value);
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
    if (this.state.deployed) {
      this.toggleExpanded();
    }
  }

  render() {
    const { deployed, currentTitle } = this.state;
    const { id, values, multiple, selected } = this.props;

    return (
      <Container
        id={id}
        onClickOutside={this.handleClickOutside}
        className={`e2e-filter-selector-${this.props.name}`}
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
        />
      </Container>
    );
  }
}

// Libraries
import * as React from 'react';
import * as _ from 'lodash';
import styled, { StyledFunction } from 'styled-components';

// Components
import Title from './components/title';
import ValuesList from './components/valuesList';
import clickOutside from 'utils/containers/clickOutside';

// Style
const Container = styled(clickOutside)`
  display: inline-block;
  position: relative;
  outline: none;

  & + & {
    margin-left: 2rem;
  }
`;

interface Props {
  title: string;
  name: string;
  values: { text: string, value: any}[];
  onChange?: Function;
  multiple: boolean;
  selected: any[];
}

interface State {
  deployed: boolean;
  currentTitle: string;
}

class FilterSelector extends React.Component<Props, State> {
  baseID: string = `filter-${Math.floor(Math.random() * 10000000)}`;

  constructor(props) {
    super(props);

    this.state = {
      deployed: false,
      currentTitle: this.getTitle(props.selected, props.values, props.multiple, props.title),
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ currentTitle: this.getTitle(nextProps.selected) });
  }

  getTitle = (selection, values = this.props.values, multiple = this.props.multiple, title = this.props.title) => {
    let newTitle = '';

    if (!multiple && selection.length > 0) {
      const selected = _.find(values, { value: selection[0] });
      newTitle = selected ? selected.text : '';
    } else if (selection.length > 0) {
      newTitle = `${title} (${selection.length})`;
    } else {
      newTitle = title;
    }

    return newTitle;
  }

  toggleExpanded = () => {
    this.setState({ deployed: !this.state.deployed });
  }

  selectionChange = (value) => {
    let newSelection = _.clone(this.props.selected);

    if (!this.props.multiple) {
      newSelection = [value];
    } else if (_.includes(newSelection, value)) {
      newSelection = _.without(newSelection, value);
    } else {
      newSelection.push(value);
    }

    if (this.props.onChange) {
      this.props.onChange(this.props.name, newSelection);
    }
  }

  handleClickOutside = () => {
    if (this.state.deployed) {
      this.toggleExpanded();
    }
  }

  render() {
    const { deployed, currentTitle } = this.state;
    const { values, multiple, selected } = this.props;

    return (
      <Container onClickOutside={this.handleClickOutside}>
        <Title title={currentTitle} deployed={deployed} onClick={this.toggleExpanded} baseID={this.baseID} />
        <ValuesList deployed={deployed} values={values} selected={selected} onChange={this.selectionChange} multiple={multiple} baseID={this.baseID} />
      </Container>
    );
  }
}

export default FilterSelector;

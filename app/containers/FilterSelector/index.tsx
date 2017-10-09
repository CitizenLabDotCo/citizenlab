import * as React from 'react';
import * as _ from 'lodash';

// components
import Title from './components/title';
import ValuesList from './components/valuesList';
import clickOutside from 'utils/containers/clickOutside';

// style
import styled from 'styled-components';

const Container = styled(clickOutside) `
  display: inline-block;
  position: relative;

  &:not(:last-child) {
    margin-right: 40px;
  }

  * {
    outline: none;
  }
`;

interface Props {
  title: string;
  name: string;
  values: { text: string, value: any }[];
  onChange?: Function;
  multiple: boolean;
  selected: any[];
}

interface State {
  deployed: boolean;
  currentTitle: string;
}

export default class FilterSelector extends React.PureComponent<Props, State> {
  state: State;
  baseID: string;

  constructor(props) {
    super(props);
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
    this.setState(state => ({ deployed: !state.deployed }));
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
      <Container onClickOutside={this.handleClickOutside} className={`e2e-filter-selector-${this.props.name}`}>
        <Title title={currentTitle} deployed={deployed} onClick={this.toggleExpanded} baseID={this.baseID} />
        <ValuesList deployed={deployed} values={values} selected={selected} onChange={this.selectionChange} multiple={multiple} baseID={this.baseID} />
      </Container>
    );
  }
}

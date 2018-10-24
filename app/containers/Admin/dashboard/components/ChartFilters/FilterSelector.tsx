import React from 'react';

interface Props {
  onFilter: (filter: string) => void;
  filterOptions: string[];
  currentFilter?: string;
  hide?: boolean | undefined;
}

interface State {}

export default class ChartFilters extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  handleSelect = (event) => {
    const filter = event.target.value;
    this.props.onFilter(filter);
  }

  render() {
    const { filterOptions, currentFilter, hide } = this.props;

    if (hide === true) {
      return null;
    }

    return (
      <select value={currentFilter} onChange={this.handleSelect}>
        {filterOptions.map(filterOption => {
          return (
            <option
              key={filterOption}
              role="option"
              value={filterOption}
              selected={filterOption === currentFilter}
              aria-selected={filterOption === currentFilter}
            >
            {filterOption}
            </option>
          );
        })}
      </select>
    );
  }

}

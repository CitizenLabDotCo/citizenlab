
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'semantic-ui-react';

class Pagination extends PureComponent {

  constructor() {
    super();
    this.handleItemClick = this.handleItemClick.bind(this);
  }

  calculateMenuItems(c, m) {
    const current = c;
    const last = m;
    const delta = 2;
    const left = current - delta;
    const right = current + delta + 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= last; i += 1) {
      if (i === 1 || i === last || (i >= left && i < right)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push(-i);
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  }

  handleItemClick(event, data) {
    this.props.loadPage(data.name);
  }

  render() {
    const { currentPage, totalPages } = this.props;
    const pageItems = this.calculateMenuItems(currentPage, totalPages);
    return (
      <Menu pagination floated="right">
        {pageItems.map((item) => (
          <Menu.Item
            key={item}
            name={item < 0 ? '...' : item.toString()}
            active={item === currentPage}
            onClick={this.handleItemClick}
            disabled={item < 0}
          />
        ))}
      </Menu>
    );
  }
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  loadPage: PropTypes.function,
};

export default Pagination;

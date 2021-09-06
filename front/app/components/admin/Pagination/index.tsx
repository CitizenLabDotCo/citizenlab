import React from 'react';
import { Menu } from 'semantic-ui-react';

// Typing
interface Props {
  currentPage: number;
  totalPages: number;
  loadPage: (arg: number) => void;
}

class Pagination extends React.PureComponent<Props> {
  constructor(props) {
    super(props);
    this.handleItemClick = this.handleItemClick.bind(this);
  }

  calculateMenuItems(c, m) {
    const current = c;
    const last = m;
    const delta = 2;
    const left = current - delta;
    const right = current + delta + 1;
    const range: number[] = [];
    const rangeWithDots: number[] = [];
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

  handleItemClick(_event, data) {
    this.props.loadPage(parseInt(data.name, 10));
  }

  render() {
    const { currentPage, totalPages } = this.props;
    const pageItems = this.calculateMenuItems(currentPage, totalPages);
    if (totalPages > 1) {
      return (
        <Menu pagination={true} floated="right">
          {pageItems.map((item) => (
            <Menu.Item
              key={item}
              name={item < 0 ? '...' : item.toString()}
              active={item === currentPage}
              onClick={this.handleItemClick}
              disabled={item < 0 || item === currentPage}
            />
          ))}
        </Menu>
      );
    }
    return null;
  }
}

export default Pagination;

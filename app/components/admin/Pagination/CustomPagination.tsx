import React from 'react';
import styled from 'styled-components';

import Icon from 'components/UI/Icon';

import { FormattedMessage } from 'utils/cl-intl';

// i18n
import messages from './messages';

// Typing
interface Props {
  currentPage: number;
  totalPages: number;
  loadPage: Function;
}

const Spagination = styled.div`
  display: flex;
  font-size: 16px;
  align-items: baseline;
  justify-content: center;
`;
const Back = styled.button`
  color: #044D6C;
  margin-right: 30px;
  font-weight: bold;
  display: flex;
  align-items: baseline;
  &:hover, &:focus {
    color: #01A1B1;
    outline: none;
  }
  & svg {
    transform: rotate(180deg);
  }
`;
const Next = styled.button`
  color: #044D6C;
  margin-left: 30px;
  font-weight: bold;
  display: flex;
  align-items: baseline;
  &:hover, &:focus {
    color: #01A1B1;
    outline: none;
  }
`;

const Item = styled.button`
  background: rgba(132, 147, 158, 0.07);
  color: #044D6C;
  border-radius: 5px;
  height: 36px;
  width: 36px;
  margin-left: 5px;
  font-weight: bold;

  &>:first-child {
    margin-left: 0px;
  }
  &.active {
    background: #044D6C;
    color: #FFFFFF;
    &:focus, &:focus:hover {
      background: #044D6C;
      color: #01A1B1;
      outline: none;
    }
    &:hover {
      background: #044D6C;
      color: #FFFFFF;
    }
  }
  &:hover, &:focus {
    background: rgba(132, 147, 158, 0.15);
    outline: none;
  }
`;

const ChevronIcon = styled(Icon) `
  height: 12px;
  margin: 9px;
  fill: #01A1B1;
`;


class CustomPagination extends React.PureComponent<Props> {

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

  handleItemClick = item => () => {
    this.props.loadPage(item);
  }
  goTo = page => () => {
    if (page > 0 && page <= this.props.totalPages) { this.props.loadPage(page); }
  }

  render() {
    const { currentPage, totalPages } = this.props;
    const pageItems = this.calculateMenuItems(currentPage, totalPages);
    return (
      <Spagination>
        <Back onClick={this.goTo(currentPage - 1)}>
          <ChevronIcon name="chevron-right" />
          <FormattedMessage {...messages.back} />
        </Back>
        {pageItems.map((item) => (
          <Item
            key={item}
            className={`${item === currentPage ? 'active' : ''}`}
            onClick={this.handleItemClick(item)}
            disabled={item < 0}
          >
            <span>{item < 0 ? '...' : item.toString()}</span>
          </Item>
        ))}
        <Next onClick={this.goTo(currentPage + 1)}>
          <FormattedMessage {...messages.next} />
          <ChevronIcon name="chevron-right" />
        </Next>
      </Spagination>
    );
  }
}

export default CustomPagination;

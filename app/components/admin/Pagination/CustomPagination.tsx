import React from 'react';
import styled from 'styled-components';
import Icon from 'components/UI/Icon';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { colors } from 'utils/styleUtils';
import { rgba } from 'polished';

// Typing
export interface Props {
  currentPage: number;
  totalPages: number;
  loadPage: Function;
}

const Spagination = styled.div`
  display: flex;
  font-size: 16px;
  align-items: baseline;
  justify-content: center;
  padding-top: 15px;
`;

const Next = styled.button`
  margin-left: 30px;
  font-weight: 500;
  display: flex;
  align-items: baseline;
  cursor: pointer;

  &:hover,
  &:focus {
    color: ${colors.clIconAccent};
    outline: none;
  }
`;

const Back = styled(Next) `
  margin-right: 30px;
  margin-left: 0;

  & svg {
    transform: rotate(180deg);
  }
`;

const Item = styled.button`
  background: ${colors.adminBackground};
  border-radius: 5px;
  height: 34px;
  width: 34px;
  margin-left: 5px;
  font-weight: 500;
  cursor: pointer;

  &>:first-child {
    margin-left: 0px;
  }

  &.active {
    background: ${colors.adminTextColor};
    color: #fff;

    &:focus,
    &:focus:hover {
      background: ${colors.adminTextColor};
      color: #fff;
      outline: none;
    }

    &:hover {
      background: ${colors.adminTextColor};
      color: #fff;
    }
  }

  &:hover,
  &:focus {
    background: ${rgba(colors.adminTextColor, .2)};
    outline: none;
  }
`;

const ChevronIcon = styled(Icon) `
  height: 12px;
  margin: 9px;
  fill: ${colors.clIconAccent};
`;

class CustomPagination extends React.PureComponent<Props> {

  constructor(props) {
    super(props);
    this.handleItemClick = this.handleItemClick.bind(this);
  }

  calculateMenuItems(c: number, m: number) {
    const current = c;
    const last = m;
    const delta = 2;
    const left = current - delta;
    const right = current + delta + 1;
    const range: number[] = [];
    const rangeWithDots: number[] = [];
    let l: number;

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

    if (totalPages > 1) {
      return (
        <Spagination className={this.props['className']}>
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
    return null;
  }
}

export default CustomPagination;

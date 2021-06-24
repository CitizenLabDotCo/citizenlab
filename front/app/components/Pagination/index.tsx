import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { Icon } from 'cl2-component-library';
import { colors, fontSizes } from 'utils/styleUtils';
import { rgba } from 'polished';

const Container = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ContainerInner = styled.div`
  display: flex;
  align-items: center;
`;

const ChevronIcon = styled(Icon)`
  height: 12px;
  fill: ${colors.adminTextColor};
`;

const NavigateButton = styled.button`
  width: 38px;
  height: 38px;
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${(props: any) => props.theme.borderRadius};

  &.disabled {
    color: #bbb;
    cursor: not-allowed;

    ${ChevronIcon} {
      fill: #bbb;
    }
  }

  &:not(.disabled) {
    cursor: pointer;

    &:hover,
    &:focus {
      ${ChevronIcon} {
        fill: ${colors.clIconAccent};
      }
    }
  }
`;

const Next = styled(NavigateButton)``;

const Back = styled(NavigateButton)`
  ${ChevronIcon} {
    transform: rotate(180deg);
  }
`;

const Pages = styled.div`
  margin-left: 14px;
  margin-right: 14px;
  display: flex;
  align-items: center;
`;

const Item = styled.button<{ useColorsTheme?: boolean }>`
  min-width: 38px;
  height: 38px;
  color: ${({ useColorsTheme, theme }) =>
    useColorsTheme ? theme.colorText : colors.adminTextColor};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  margin-left: 5px;
  padding-left: 10px;
  padding-right: 10px;
  transition: all 80ms ease-out;

  &:first-child {
    margin-left: 0px;
  }

  &:not(.disabled) {
    border-radius: ${(props: any) => props.theme.borderRadius};
    background: ${colors.lightGreyishBlue};
    cursor: pointer;

    &.active {
      color: #fff;
      background: ${({ useColorsTheme, theme }) =>
        useColorsTheme ? theme.colorMain : colors.adminTextColor};
    }

    &:not(.active) {
      &:hover,
      &:focus {
        background: ${({ useColorsTheme, theme }) =>
          rgba(useColorsTheme ? theme.colorMain : colors.adminTextColor, 0.2)};
      }
    }
  }
`;

export interface Props {
  currentPage: number;
  totalPages: number;
  loadPage: (page: number) => void;
  className?: string;
  useColorsTheme?: boolean;
}

class Pagination extends PureComponent<Props> {
  calculateMenuItems(currentPage: number, totalPages: number) {
    const current = currentPage;
    const last = totalPages;
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

  handleItemClick = (item: number) => () => {
    this.props.loadPage(item);
  };

  goTo = (page: number) => () => {
    if (page > 0 && page <= this.props.totalPages) {
      this.props.loadPage(page);
    }
  };

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  render() {
    const { currentPage, totalPages, className, useColorsTheme } = this.props;
    const pageItems = this.calculateMenuItems(currentPage, totalPages);

    if (totalPages > 1) {
      return (
        <Container className={className} data-testid="pagination">
          <ContainerInner>
            <Back
              onMouseDown={this.removeFocus}
              onClick={this.goTo(currentPage - 1)}
              disabled={currentPage === 1}
              className={currentPage === 1 ? 'disabled' : ''}
            >
              <ChevronIcon name="chevron-right" />
            </Back>

            <Pages>
              {pageItems.map((item) => (
                <Item
                  key={item}
                  className={`${item === currentPage ? 'active' : ''} ${
                    item < 0 ? 'disabled' : ''
                  }`}
                  onMouseDown={this.removeFocus}
                  onClick={this.handleItemClick(item)}
                  disabled={item < 0}
                  useColorsTheme={useColorsTheme}
                >
                  <span>{item < 0 ? '...' : item.toString()}</span>
                </Item>
              ))}
            </Pages>

            <Next
              onMouseDown={this.removeFocus}
              onClick={this.goTo(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={currentPage === totalPages ? 'disabled' : ''}
            >
              <ChevronIcon name="chevron-right" />
            </Next>
          </ContainerInner>
        </Container>
      );
    }

    return null;
  }
}

export default Pagination;

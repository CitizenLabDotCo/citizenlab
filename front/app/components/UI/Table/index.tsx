import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

const StyledTable = styled.table`
  width: 100%;
  padding: 0;
  margin: 0;
  border: none;
  border-spacing: 0;
  border-collapse: collapse;
  table-layout: auto;

  th,
  td {
    padding: 0;
    margin: 0;
  }

  thead {
    tr {
      th {
        fill: ${colors.text};
        color: ${colors.adminTextColor};
        font-size: ${fontSizes.small}px;
        font-weight: 600;
        text-align: left;
        text-transform: uppercase;
        line-height: normal;
        padding-top: 0px;
        padding-bottom: 15px;
        border-bottom: solid 1px #ddd;

        div {
          display: flex;
          align-items: center;
        }
      }
    }
  }

  tbody {
    tr {
      border-radius: ${(props: any) => props.theme.borderRadius};
      border-bottom: solid 1px #ccc;

      td {
        color: ${colors.adminTextColor};
        font-size: ${fontSizes.small}px;
        font-weight: 400;
        line-height: normal;
        text-align: left;
        padding-top: 15px;
        padding-bottom: 15px;

        &.center {
          justify-content: center;
        }

        a {
          color: ${colors.clBlue};
          text-decoration: underline;

          &:hover {
            color: ${darken(0.2, colors.clBlue)};
            text-decoration: underline;
          }
        }
      }
    }
  }

  tfoot {
    display: flex;

    tr {
      display: flex;

      td {
        display: flex;
      }
    }
  }
`;

interface Props {
  className?: string;
}

interface State {}

export default class Table extends PureComponent<Props, State> {
  render() {
    const { children, className } = this.props;

    return (
      <StyledTable cellSpacing="0" cellPadding="0" className={className}>
        {children}
      </StyledTable>
    );
  }
}

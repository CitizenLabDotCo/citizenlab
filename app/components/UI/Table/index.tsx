import React from 'react';
import styled from 'styled-components';
import { fontSize, color } from 'utils/styleUtils';

const StyledTable: any = styled.table`
  width: 100%;
  padding: 0;
  margin: 0;
  border: none;
  border-spacing: 0;
  border-collapse: collapse;

  th, td {
    padding: 0;
    margin: 0;
  }

  thead {
    tr {
      th {
        fill: ${color('label')};
        color: ${color('label')};
        font-size: ${fontSize('small')};
        font-weight: 500;
        text-transform: uppercase;
        line-height: 18px;
        margin-left: 20px;
        margin-right: 20px;
        padding-top: 0px;
        padding-bottom: 0px;

        &.sortable {
          cursor: pointer;

          &:hover,
          &.active {
            fill: ${color('text')};
            color: ${color('text')};
          }
        }
      }
    }
  }

  tbody {
    tr {
      border-radius: 5px;
      padding-top: 50px;
      padding-bottom: 50px;

      td {
        color: ${color('clBlue2Darkest')};
        font-size: ${fontSize('small')};
        font-weight: 400;
        line-height: 18px;
        margin-left: 20px;
        margin-right: 20px;
        padding-top: 11px;
        padding-bottom: 11px;

        &.center {
          justify-content: center;
        }
      }

      &:hover {
        cursor: pointer;
        background: ${color('background')};
        color: #999;
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

interface Props {}

interface State {}

export default class Tabel extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { children } = this.props;
    const className = this.props['className'];

    return (
      <StyledTable cellspacing="0" cellpadding="0" className={className}>{children}</StyledTable>
    );
  }
}

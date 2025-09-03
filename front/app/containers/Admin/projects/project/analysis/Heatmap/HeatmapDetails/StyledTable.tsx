import { colors, Table } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

interface StyledTableProps {
  columns: number;
}
const StyledTable = styled(Table)<StyledTableProps>`
  table-layout: fixed;
  // Set the min-width to the sum of the first column width and the rest of the columns
  min-width: ${({ columns }) => `${200 + 120 * columns}px`};

  /* Set first column width */
  & th:first-child,
  & td:first-child {
    width: 200px;
    min-width: 200px;
    max-width: 200px;
  }

  & th:not(:first-child),
  & td:not(:first-child) {
    width: auto;
  }

  /* Make the table support sticky positioning */
  border-collapse: separate;
  border-spacing: 0;

  /* Make thead sticky */
  & thead th {
    position: sticky;
    top: 0;
    background-color: ${colors.white};
    z-index: 10;
    text-align: center;
  }

  /* Make first column sticky */
  & tr th:first-child,
  & tr td:first-child {
    position: sticky;
    left: 0;
    z-index: 5;
  }

  /* Increase z-index for the corner cell (thead first cell) */
  & thead th:first-child {
    z-index: 15;
  }

  /* Add striped rows */
  & tbody tr:nth-child(odd) td {
    background-color: ${colors.white};
  }

  & tbody tr:nth-child(even) td {
    background-color: ${colors.grey100};
  }
`;

export default StyledTable;

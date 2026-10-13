import styled from 'styled-components';

import SortableRow from 'components/admin/ResourceList/SortableRow';

const IndentedSortableRow = styled(SortableRow)<{ depth: number }>`
  padding-left: ${(props) => props.depth * 32}px;
`;

export default IndentedSortableRow;

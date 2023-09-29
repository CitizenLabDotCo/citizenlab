import styled from 'styled-components';

const EllipsisFilterValue = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  min-width: 0;
  max-width: 90px;
`;

export default EllipsisFilterValue;

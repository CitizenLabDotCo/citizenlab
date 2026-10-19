import styled from 'styled-components';

// Spaces and folders: as many 232px-wide tiles as fit on a row.
const TileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(232px, 1fr));
  gap: 12px;
`;

export default TileGrid;

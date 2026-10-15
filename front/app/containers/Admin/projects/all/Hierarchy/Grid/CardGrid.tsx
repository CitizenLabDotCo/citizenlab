import styled from 'styled-components';

// Projects: as many 216px-wide cards as fit on a row.
const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(216px, 1fr));
  gap: 20px;
`;

export default CardGrid;

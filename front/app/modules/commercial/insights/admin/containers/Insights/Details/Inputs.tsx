import React from 'react';
import styled from 'styled-components';
import Search from 'components/UI/SearchInput';
import { colors } from 'utils/styleUtils';

const InputsContainer = styled.div`
  min-width: 420px;
  overflow-x: auto;
  padding: 20px;
  background-color: ${colors.emailBg};
  border-left: 1px solid ${colors.separation};
`;

const Inputs = () => {
  const handleSearchChange = () => {};
  return (
    <InputsContainer>
      <Search onChange={handleSearchChange} size="small" />
    </InputsContainer>
  );
};

export default Inputs;

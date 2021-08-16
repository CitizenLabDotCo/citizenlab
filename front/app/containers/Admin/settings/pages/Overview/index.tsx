import React, { useState } from 'react';
import styled from 'styled-components';
import Core from './Core';
import Outlet from 'components/Outlet';

const Container = styled.div`
  margin: 0px auto;
  max-width: 1042px;
`;

export default () => {
  const [isCommercial, setIsCommercial] = useState(false);
  // const setIsCommercialToTrue = () => setIsCommercial(true);
  const setIsCommercialToFalse = () => setIsCommercial(false); // testing

  return (
    <Container>
      {!isCommercial && <Core />}

      <Outlet
        id="app.containers.Admin.settings.pages.Overview"
        onMount={setIsCommercialToFalse}
      />
    </Container>
  );
};

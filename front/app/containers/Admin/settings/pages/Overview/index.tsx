import React, { useState } from 'react';
import styled from 'styled-components';
import Core from './Core';
import Outlet from 'components/Outlet';

const Container = styled.div`
  padding: 0px 105px;
`;

export default () => {
  const [isCommercial, setIsCommercial] = useState(false);

  return (
    <Container>
      {!isCommercial && <Core />}

      <Outlet
        id="app.containers.Admin.settings.pages.Overview"
        onData={setIsCommercial}
      />
    </Container>
  );
};

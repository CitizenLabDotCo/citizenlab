import React from 'react';

import styled from 'styled-components';

const Wrapper = styled.div`
  padding: 12px;
`;

const Tabs = ({ link }: { link: string; color: string }) => (
  <Wrapper>{link}</Wrapper>
);

export default Tabs;

import React, { memo } from 'react';
import ContentContainer from 'components/ContentContainer';
import styled from 'styled-components';

const SeparatorInner = styled.div`
  height: 1px;
  background: red;
  margin-top: 70px;
  margin-bottom: 70px;
`;

const Separator = memo(() => (
  <ContentContainer>
    <SeparatorInner />
  </ContentContainer>
));

export default Separator;

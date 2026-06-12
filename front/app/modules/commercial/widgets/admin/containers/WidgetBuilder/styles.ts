import styled from 'styled-components';

import { Section } from 'components/admin/Section';
import Collapse from 'components/UI/Collapse';

export const StyledCollapse = styled(Collapse)`
  flex: 1;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
`;

export const StyledSection = styled(Section)`
  width: 100%;
  max-width: 500px;
  padding: 20px;
  border-radius: ${(props) => props.theme.borderRadius};
  border: solid 1px #ddd;
  background: #fff;
`;

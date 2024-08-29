import { Icon, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const HeaderIcon = styled(Icon).attrs({ name: 'flash' })`
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  fill: ${colors.orange500};
  margin-top: 16px;
  margin-right: 12px;
`;

export default HeaderIcon;

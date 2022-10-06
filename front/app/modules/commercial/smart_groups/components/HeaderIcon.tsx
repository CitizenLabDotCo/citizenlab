import styled from 'styled-components';
import { Icon } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';

const HeaderIcon = styled(Icon).attrs({ name: 'flash' })`
  flex: 0 0 24px;
  fill: ${colors.orange};
  margin-top: 10px;
  margin-right: 12px;
`;

export default HeaderIcon;

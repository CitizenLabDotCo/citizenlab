import styled from 'styled-components';
import { Icon } from 'cl2-component-library';
import { colors } from 'utils/styleUtils';

const HeaderIcon = styled(Icon).attrs({ name: 'lightningBolt' })`
  flex: 0 0 13px;
  width: 13px;
  fill: ${colors.adminOrangeIcons};
  margin-top: 10px;
  margin-right: 12px;
`;

export default HeaderIcon;

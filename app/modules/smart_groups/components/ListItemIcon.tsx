import styled from 'styled-components';
import { Icon } from 'cl2-component-library';
import { colors } from 'utils/styleUtils';

const LightningBolt = styled(Icon).attrs({ name: 'lightningBolt' })`
  flex: 0 0 18px;
  height: 18px;
  fill: ${colors.adminOrangeIcons};
  margin-right: 4px;
`;

export default LightningBolt;

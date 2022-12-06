import { Icon } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';

const LightningBolt = styled(Icon).attrs({ name: 'flash' })`
  flex: 0 0 24px;
  fill: ${colors.orange};
  margin-right: 4px;
`;

export default LightningBolt;

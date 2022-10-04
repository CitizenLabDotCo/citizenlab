import { Label } from '@citizenlab/cl2-component-library';
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';

const SettingsLabel = styled(Label)`
  font-weight: bold;
  margin-bottom: 18px;
  color: ${colors.primary};
`;

export default SettingsLabel;

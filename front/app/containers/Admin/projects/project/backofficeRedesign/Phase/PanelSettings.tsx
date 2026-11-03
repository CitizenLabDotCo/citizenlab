import { Box, colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { SubSectionTitle } from 'components/admin/Section';

const PanelSettings = styled(Box)`
  ${SubSectionTitle} {
    font-size: ${fontSizes.s}px;
    color: ${colors.textPrimary};
  }
`;

export default PanelSettings;

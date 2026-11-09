import { colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

// A sibling selector, so a section that renders nothing leaves no stray divider.
const SettingsSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;

  > * + * {
    padding-top: 24px;
    border-top: 1px solid ${colors.grey200};
  }
`;

export default SettingsSections;

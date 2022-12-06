// components
// styling
import styled from 'styled-components';
import { Input } from '@citizenlab/cl2-component-library';
import { fontSizes } from 'utils/styleUtils';
import Warning from 'components/UI/Warning';
import { SectionField } from 'components/admin/Section';

export const StyledSectionField = styled(SectionField)`
  max-width: 100%;
  margin-bottom: 40px;
`;

export const StyledWarning = styled(Warning)`
  margin-bottom: 15px;
`;

export const StyledInput = styled(Input)`
  margin-bottom: 20px;
`;

export const SlugPreview = styled.div`
  margin-bottom: 20px;
  font-size: ${fontSizes.base}px;
`;

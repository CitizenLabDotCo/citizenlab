// components
import { Input } from '@citizenlab/cl2-component-library';
import { SectionField } from 'components/admin/Section';
import Warning from 'components/UI/Warning';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

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

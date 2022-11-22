import QuillEditedContent from 'components/UI/QuillEditedContent';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

export const StyledQuillEditedContent = styled(QuillEditedContent)`
  h1,
  h2 {
    color: ${(props) => props.theme.colors.tenantText};
  }

  p,
  li {
    color: ${colors.textSecondary};
  }
`;

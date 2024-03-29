import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import Link from 'utils/cl-router/Link';

const ProjectsListItem = styled(Link)`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 21px;
  text-decoration: none;
  padding: 10px;
  margin-bottom: 4px;
  background: transparent;
  border-radius: ${(props) => props.theme.borderRadius};

  &:hover,
  &:focus {
    color: #000;
    background: ${colors.grey300};
    text-decoration: none;
  }
`;

export default ProjectsListItem;

import { colors, fontSizes } from '@citizenlab/cl2-component-library';

import Link, { typedStyled } from 'utils/cl-router/Link';

const ProjectsListItem = typedStyled(Link)`
  color: ${colors.coolGrey700};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  line-height: 21px;
  text-decoration: none;
  padding: 10px;
  margin-bottom: 8px;
  display: block;
  background: transparent;
  border-radius: ${(props) => props.theme.borderRadius};
  /* The dropdown panel is a fixed width, so a long unbroken title (a project
     name without spaces, say) would otherwise spill out of it. */
  overflow-wrap: break-word;

  &:hover,
  &:focus {
    color: #000;
    background: ${colors.grey300};
    text-decoration: none;
  }
`;

export default ProjectsListItem;

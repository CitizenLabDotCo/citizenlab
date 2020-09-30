import React, { memo } from 'react';
import Link from 'utils/cl-router/Link';
import styled from 'styled-components';
import useProject from 'hooks/useProject';
import useLocalize from 'hooks/useLocalize';
import { isNilOrError } from 'utils/helperUtils';
import { colors, fontSizes } from 'utils/styleUtils';
import { Icon } from 'cl2-component-library';
import { darken } from 'polished';

interface Props {
  projectId: string;
  className?: string;
}

const StyledIcon = styled(Icon)`
  fill: ${colors.label};
  margin-right: 10px;
  width: 26px;
  height: 26px;
`;

const StyledLink = styled(Link)`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;

  &:hover {
    color: ${darken(0.1, colors.label)};
    text-decoration: underline;

    ${StyledIcon} {
      fill: ${darken(0.1, colors.label)};
    }
  }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const ProjectLink = memo(({ projectId, className }: Props) => {
  const project = useProject({ projectId });
  const localize = useLocalize();

  if (!isNilOrError(project)) {
    return (
      <Container className={className}>
        <StyledLink
          id="e2e-idea-other-link"
          to={`/projects/${project.attributes.slug}`}
        >
          <StyledIcon ariaHidden name="circle-arrow-left" />
          {localize(project.attributes.title_multiloc)}
        </StyledLink>
      </Container>
    );
  }

  return null;
});

export default ProjectLink;

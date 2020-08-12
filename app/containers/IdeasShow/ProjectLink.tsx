import React, { memo } from 'react';
import Link from 'utils/cl-router/Link';
import styled from 'styled-components';
import useProject from 'hooks/useProject';
import useLocalize from 'hooks/useLocalize';
import { isNilOrError } from 'utils/helperUtils';
import { colors, fontSizes } from 'utils/styleUtils';
import { Icon } from 'cl2-component-library';

interface Props {
  projectId: string;
}

const StyledLink = styled(Link)`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;

  &:hover {
    color: inherit;
    text-decoration: underline;
  }
`;

const StyledIcon = styled(Icon)`

`;

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const ProjectLink = memo(({ projectId }: Props) => {
  const project = useProject({ projectId });
  const localize = useLocalize();

  if (!isNilOrError(project)) {
    return (
      <Container>
        <StyledIcon name='arrowLeft' />
        <StyledLink to={`/projects/${project.attributes.slug}`}>
          {localize(project.attributes.title_multiloc)}
        </StyledLink>
      </Container>

    );
  }

  return null;
});

export default ProjectLink;

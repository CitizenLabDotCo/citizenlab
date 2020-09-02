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
  className?: string;
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
  fill: #84939e;
  margin-right: 10px;
  width: 26px;
  height: 26px;
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
        <StyledIcon name="circle-arrow-left" />
        <StyledLink to={`/projects/${project.attributes.slug}`}>
          {localize(project.attributes.title_multiloc)}
        </StyledLink>
      </Container>
    );
  }

  return null;
});

export default ProjectLink;

import React from 'react';

import {
  Box,
  Icon,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { lighten } from 'polished';
import styled from 'styled-components';

import useCustomPages from 'api/custom_pages/useCustomPages';

import useLocalize from 'hooks/useLocalize';

import Link, { typedStyled } from 'utils/cl-router/Link';

// Mirrors the attachment styling in components/UI/FileAttachments/FileDisplay
// so page links read as the same kind of list item as file attachments.
const PageLink = typedStyled(Link)`
  display: flex;
  align-items: center;
  color: ${colors.textSecondary};
  border: 1px solid ${lighten(0.4, colors.textSecondary)};
  border-radius: ${(props) => props.theme.borderRadius};
  font-size: ${fontSizes.base}px;
  line-height: 24px;
  padding: 10px 20px;
  margin-bottom: 10px;
  text-decoration: underline;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

const PageIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-right: 15px;
  flex-shrink: 0;
`;

interface Props {
  projectId: string;
  projectSlug: string;
}

const ProjectPages = ({ projectId, projectSlug }: Props) => {
  const localize = useLocalize();
  const { data: pages } = useCustomPages({ projectId });

  if (!pages || pages.data.length === 0) {
    return null;
  }

  return (
    <Box>
      {pages.data.map((page) => (
        <PageLink
          key={page.id}
          to="/projects/$slug/pages/$pageSlug"
          params={{ slug: projectSlug, pageSlug: page.attributes.slug }}
        >
          <PageIcon name="file" width="20px" height="20px" />
          {localize(page.attributes.title_multiloc)}
        </PageLink>
      ))}
    </Box>
  );
};

export default ProjectPages;

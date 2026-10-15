import React from 'react';

import {
  Box,
  Icon,
  Image,
  Text,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';

import useProjectImage from 'api/project_images/useProjectImage';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import useLocalize from 'hooks/useLocalize';

import Link, { typedStyled } from 'utils/cl-router/Link';

import SearchHighlight from '../SearchHighlight';
import useProjectLabels from '../useProjectLabels';

const CardLink = typedStyled(Link)`
  display: block;
  min-width: 0;
  border-radius: ${bo.borderRadius};

  .project-card-image {
    outline: 1px solid ${colors.grey200};
    outline-offset: -1px;
  }

  &:hover .project-card-image {
    outline-color: ${colors.coolGrey500};
  }
`;

interface Props {
  project: ProjectMiniAdminData;
  // Where the project sits ("Space › Folder"), when that isn't the level shown.
  path?: string;
}

// Projects are the only items with a large image: their own, or a quiet
// placeholder.
const ProjectCard = ({ project, path }: Props) => {
  const localize = useLocalize();
  const { status, method, when } = useProjectLabels(project);
  // "Live · Voting · open until 19 Oct"
  const meta = [status, method, when].filter(Boolean).join(' · ');

  const { data: image } = useProjectImage({
    projectId: project.id,
    imageId: project.relationships.project_images.data[0]?.id,
  });
  const versions = image?.data.attributes.versions;
  const imageUrl = versions?.large ?? versions?.medium;

  return (
    <CardLink
      to="/admin/projects/$projectId"
      params={{ projectId: project.id }}
    >
      <Box
        className="project-card-image"
        aspectRatio="16 / 10"
        borderRadius={bo.borderRadius}
        overflow="hidden"
        background={colors.grey100}
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb="8px"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            width="100%"
            height="100%"
            objectFit="cover"
          />
        ) : (
          <Icon
            name="image"
            width="24px"
            height="24px"
            fill={colors.coolGrey500}
          />
        )}
      </Box>
      <Text
        m="0"
        variant="boControl"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        <SearchHighlight text={localize(project.attributes.title_multiloc)} />
      </Text>
      <Text
        m="0"
        variant="boMicro"
        color="coolGrey500"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        {meta}
      </Text>
      {path && (
        <Text
          m="0"
          variant="boMicro"
          color="coolGrey500"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {path}
        </Text>
      )}
    </CardLink>
  );
};

export default ProjectCard;

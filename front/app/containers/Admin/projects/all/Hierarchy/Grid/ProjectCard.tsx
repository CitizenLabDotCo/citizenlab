import React from 'react';

import {
  Box,
  Icon,
  Image,
  Text,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useProjectImage from 'api/project_images/useProjectImage';
import { ProjectMiniAdminData } from 'api/projects_mini_admin/types';

import useLocalize from 'hooks/useLocalize';

import Link, { typedStyled } from 'utils/cl-router/Link';

import useProjectActions from '../Actions/useProjectActions';
import { ArrangePlace } from '../Arrange/arrangeTargets';
import DragHandle from '../Arrange/DragHandle';
import useDragArrange from '../Arrange/useDragArrange';
import {
  dragStates,
  itemFocusRing,
  revealActions,
  stretchedLink,
} from '../itemStyles';
import MoreActions from '../Menu/MoreActions';
import SearchHighlight from '../SearchHighlight';
import useProjectLabels from '../useProjectLabels';

const Card = styled.div`
  position: relative;
  min-width: 0;
  border-radius: ${bo.borderRadius};

  .project-card-image {
    outline: 1px solid ${colors.grey200};
    outline-offset: -1px;
  }

  &:hover .project-card-image {
    outline-color: ${colors.coolGrey500};
  }

  ${itemFocusRing}
  ${revealActions}
  ${dragStates}
`;

const TitleLink = typedStyled(Link)`
  color: inherit;
  ${stretchedLink}

  &:hover {
    color: inherit;
  }
`;

interface Props {
  project: ProjectMiniAdminData;
  // Where the project sits ("Space › Folder"), when that isn't the level shown.
  path?: string;
  // Where it can be arranged, when it can.
  place?: ArrangePlace;
}

// Projects are the only items with a large image: their own, or a quiet
// placeholder.
const ProjectCard = ({ project, path, place }: Props) => {
  const localize = useLocalize();
  const { status, method, when } = useProjectLabels(project);
  const { entries, arrangeTo } = useProjectActions(project, place);
  const drag = useDragArrange({ id: project.id, place, arrangeTo });
  // "Live · Voting · open until 19 Oct"
  const meta = [status, method, when].filter(Boolean).join(' · ');

  const { data: image } = useProjectImage({
    projectId: project.id,
    imageId: project.relationships.project_images.data[0]?.id,
  });
  const versions = image?.data.attributes.versions;
  const imageUrl = versions?.large ?? versions?.medium;

  return (
    <Card ref={drag.item} className={drag.dragging ? 'dragging' : undefined}>
      <Box
        className="project-card-image"
        position="relative"
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
        <DragHandle handle={drag.handle} over={{ top: '8px', left: '8px' }} />
        <Box
          data-actions
          position="absolute"
          top="8px"
          right="8px"
          zIndex="1"
          bgColor={colors.white}
          borderRadius={bo.borderRadius}
        >
          <MoreActions entries={entries} />
        </Box>
      </Box>
      <Text
        m="0"
        variant="boControl"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        <TitleLink
          data-item-link
          to="/admin/projects/$projectId"
          params={{ projectId: project.id }}
        >
          <SearchHighlight text={localize(project.attributes.title_multiloc)} />
        </TitleLink>
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
    </Card>
  );
};

export default ProjectCard;

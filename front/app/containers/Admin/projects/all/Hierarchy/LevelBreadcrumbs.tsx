import React, { Fragment } from 'react';

import {
  Box,
  Text,
  bo,
  colors,
  fontSizes,
  media,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';

import allMessages from '../messages';

import { Level } from './level';
import useLevelDetails, { SubLevel } from './useLevelDetails';
import useLevelSearch from './useLevelSearch';

// The level's name is the page's heading, at the size of a title, smaller on
// narrow screens. The shared breadcrumbs only come at the size of the text
// around them.
const crumbSize = `
  font-size: ${fontSizes.xl}px;
  line-height: 28px;

  ${media.tablet`
    font-size: ${fontSizes.m}px;
    line-height: 24px;
  `}
`;

const CrumbLink = typedStyled(Link)`
  ${crumbSize}
  flex: none;
  padding: 0 4px;
  border-radius: ${bo.borderRadius};
  color: ${colors.coolGrey600};
  white-space: nowrap;

  &:hover {
    background: ${colors.grey100};
    color: ${bo.colors.textHeadingStrong};
  }
`;

const Title = styled.h2`
  ${crumbSize}
  min-width: 0;
  margin: 0 0 0 4px;
  font-weight: 500;
  color: ${bo.colors.textHeadingStrong};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface Props {
  level: SubLevel;
  // Whether the top level is where this user lands. When they land inside a
  // space or folder, there's nothing above it for them to go back to.
  showRoot: boolean;
}

// "Projects / Space / Folder", the last one being the level's name.
const LevelBreadcrumbs = ({ level, showRoot }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const levelSearch = useLevelSearch();
  const { folder, space } = useLevelDetails(level);

  const crumbs: { label: string; level: Level }[] = [];
  if (showRoot) {
    crumbs.push({
      label: formatMessage(allMessages.projects),
      level: { kind: 'root' },
    });
  }
  if (level.kind === 'folder' && space) {
    crumbs.push({
      label: localize(space.attributes.title_multiloc),
      level: { kind: 'space', id: space.id },
    });
  }

  const current = level.kind === 'folder' ? folder : space;

  return (
    <Box
      data-cy="projects-hierarchy-breadcrumbs"
      display="flex"
      alignItems="center"
      minWidth="0"
    >
      {crumbs.map((crumb, index) => (
        // Two crumbs can share a label, like a folder named after its space.
        <Fragment key={index}>
          <CrumbLink to="/admin/projects" search={levelSearch(crumb.level)}>
            {crumb.label}
          </CrumbLink>
          <Text as="span" m="0" mx="2px" color="coolGrey500" aria-hidden>
            /
          </Text>
        </Fragment>
      ))}
      {current && (
        <Title title={localize(current.attributes.title_multiloc)}>
          {localize(current.attributes.title_multiloc)}
        </Title>
      )}
    </Box>
  );
};

export default LevelBreadcrumbs;

import React from 'react';

import { Box, fontSizes } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';

import { ContentBuildableType } from 'api/content_builder/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import messages from 'containers/DescriptionBuilder/messages';

import { injectIntl } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';
import { useParams } from 'utils/router';

type DescriptionBuilderToggleProps = {
  contentBuildableType: ContentBuildableType;
} & WrappedComponentProps;

const StyledLink = typedStyled(Link)`
  font-size: ${fontSizes.base}px;
`;

// Project and folder descriptions are edited exclusively in the Content Builder,
// so this renders just the "Edit description in Content Builder" link. New
// buildables are provisioned with a Content Builder layout on creation and
// existing ones are migrated, so there is no longer an inline WYSIWYG editor.
const DescriptionBuilderToggle = ({
  intl: { formatMessage },
  contentBuildableType,
}: DescriptionBuilderToggleProps) => {
  const params = useParams({ strict: false }) as Record<string, string>;
  const featureEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });

  const contentBuildableId =
    contentBuildableType === 'folder'
      ? params.projectFolderId
      : params.projectId;

  if (!featureEnabled) {
    return null;
  }

  const linkProps =
    contentBuildableType === 'project'
      ? ({
          to: '/admin/description-builder/projects/$projectId/description',
          params: { projectId: contentBuildableId },
        } as const)
      : ({
          to: '/admin/description-builder/folders/$folderId/description',
          params: { folderId: contentBuildableId },
        } as const);

  return (
    <Box data-testid="descriptionBuilderToggle">
      <StyledLink id="e2e-project-description-builder-link" {...linkProps}>
        {formatMessage(messages.linkText)}
      </StyledLink>
    </Box>
  );
};

export default injectIntl(DescriptionBuilderToggle);

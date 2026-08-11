import React from 'react';

import { Box, fontSizes } from '@citizenlab/cl2-component-library';

import messages from 'containers/DescriptionBuilder/messages';

import { useIntl } from 'utils/cl-intl';
import Link, { typedStyled } from 'utils/cl-router/Link';
import { useParams } from 'utils/router';

const StyledLink = typedStyled(Link)`
  font-size: ${fontSizes.base}px;
`;

// Folder descriptions are edited exclusively in the Content Builder, so this
// renders just the "Edit description in Content Builder" link.
const DescriptionBuilderLink = () => {
  const { formatMessage } = useIntl();
  const params = useParams({ strict: false }) as Record<string, string>;

  return (
    <Box data-testid="descriptionBuilderLink">
      <StyledLink
        id="e2e-project-description-builder-link"
        to="/admin/description-builder/folders/$folderId/description"
        params={{ folderId: params.projectFolderId }}
      >
        {formatMessage(messages.linkText)}
      </StyledLink>
    </Box>
  );
};

export default DescriptionBuilderLink;

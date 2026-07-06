import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { UserComponent } from '@craftjs/core';

import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from '../messages';

type Props = {
  children?: React.ReactNode;
};

// The project description: a canvas pinned in place during the transition to
// the new project page, so the legacy page (which renders this same subtree in
// a fixed position) always matches. Its content is freely editable, both here
// and via the legacy description editor.
const ProjectDescriptionSection: UserComponent<Props> = ({ children }) => {
  const padding = useCraftComponentDefaultPadding();
  // The public route carries a slug; there an empty section takes no space.
  // The min-height only exists in the builder, as a visible selection target.
  const { slug } = useParams({ strict: false }) as { slug?: string };

  return (
    <Box
      id="e2e-project-page-description-section"
      maxWidth={`${maxPageWidth}px`}
      margin="0 auto"
      px={padding}
      w="100%"
      minHeight={slug ? undefined : '40px'}
    >
      {children}
    </Box>
  );
};

const DescriptionSectionSettings = () => (
  <Box my="20px">
    <Text color="textSecondary" fontSize="s">
      <FormattedMessage {...messages.descriptionSectionNote} />
    </Text>
  </Box>
);

ProjectDescriptionSection.craft = {
  related: {
    settings: DescriptionSectionSettings,
  },
  rules: {
    canDrag: () => false,
  },
  custom: {
    title: messages.descriptionSectionTitle,
    locked: true,
  },
};

export default ProjectDescriptionSection;

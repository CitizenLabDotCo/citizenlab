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

const ProjectDescriptionSection: UserComponent<Props> = ({ children }) => {
  const padding = useCraftComponentDefaultPadding();
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

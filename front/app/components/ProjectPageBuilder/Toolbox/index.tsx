import React from 'react';

import Container from 'components/admin/ContentBuilder/Toolbox/Container';
import DescriptionToolboxSections from 'components/DescriptionBuilder/DescriptionBuilderToolbox/DescriptionToolboxSections';
import builderMessages from 'components/ProjectPageBuilder/messages';
import LockedNote from 'components/ProjectPageBuilder/Widgets/LockedNote';

const ProjectPageBuilderToolbox = () => {
  return (
    <Container>
      <LockedNote message={builderMessages.toolboxLockedNote} />
      <DescriptionToolboxSections />
    </Container>
  );
};

export default ProjectPageBuilderToolbox;

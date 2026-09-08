import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { CLErrors } from 'typings';

import ProjectContextSection from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection';
import { SpaceAndFolderId } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/types';
import { StyledSectionField } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/styling';

import { SubSectionTitle } from 'components/admin/Section';
import SlugInput from 'components/admin/SlugInput';

import { FormattedMessage } from 'utils/cl-intl';

import generalMessages from '../../../general/messages';

interface Props {
  spaceId?: string | null;
  folderId?: string | null;
  projectInRoot: boolean;
  contextError: boolean;
  slug: string;
  currentSlug: string;
  showSlugErrorMessage: boolean;
  apiErrors: CLErrors;
  onContextChange: (spaceAndFolderId: SpaceAndFolderId) => void;
  onSlugChange: (slug: string) => void;
}

const GeneralSection = ({
  spaceId,
  folderId,
  projectInRoot,
  contextError,
  slug,
  currentSlug,
  showSlugErrorMessage,
  apiErrors,
  onContextChange,
  onSlugChange,
}: Props) => (
  <Box>
    <ProjectContextSection
      spaceId={spaceId}
      folderId={folderId}
      projectInRoot={projectInRoot}
      error={contextError}
      onChange={onContextChange}
    />

    <StyledSectionField>
      <SubSectionTitle>
        <FormattedMessage {...generalMessages.url} />
      </SubSectionTitle>
      <SlugInput
        slug={slug}
        pathnameWithoutSlug="projects"
        apiErrors={apiErrors}
        showSlugErrorMessage={showSlugErrorMessage}
        onSlugChange={onSlugChange}
        showSlugChangedWarning={slug !== currentSlug}
      />
    </StyledSectionField>
  </Box>
);

export default GeneralSection;

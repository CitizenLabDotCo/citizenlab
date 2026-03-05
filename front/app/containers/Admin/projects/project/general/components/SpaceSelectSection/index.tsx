import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import useSpaces from 'api/spaces/useSpaces';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import SpaceSelect from 'components/admin/SpaceSelect';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';

interface Props {
  spaceId: string | null;
  onChange: (spaceId: string | null) => void;
}

const SpaceSelectSection = ({ spaceId, onChange }: Props) => {
  const { data: spaces } = useSpaces();
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();

  if (!spaces || !isAdmin(authUser)) return null;

  return (
    <SectionField
      data-testid="projectFolderSelect"
      data-cy="e2e-project-folder-setting-field"
    >
      <SubSectionTitle>
        <FormattedMessage {...messages.spaceSelectTitle} />
        <IconTooltip content={formatMessage(messages.tooltip)} />
      </SubSectionTitle>

      <SpaceSelect spaceId={spaceId} spaces={spaces.data} onChange={onChange} />
    </SectionField>
  );
};

export default SpaceSelectSection;

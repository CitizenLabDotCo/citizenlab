import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import useSpaces from 'api/spaces/useSpaces';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import SpaceSelect from 'components/admin/SpaceSelectSection/SpaceSelect';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isAdmin, isSpaceModerator } from 'utils/permissions/roles';

import messages from './messages';

interface Props {
  spaceId: string | null;
  isProjectInsideFolder?: boolean;
  onChange: (spaceId: string | null) => void;
}

const SpaceSelectSection = ({
  spaceId,
  isProjectInsideFolder = false,
  onChange,
}: Props) => {
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  const { data: spaces } = useSpaces();
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();

  const userIsAdmin = isAdmin(authUser);
  const userIsSpaceModerator = isSpaceModerator(authUser);
  const canSeeSpaceSelect = userIsAdmin || userIsSpaceModerator;

  if (!spaces || !spacesEnabled || !canSeeSpaceSelect) return null;

  return (
    <SectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.spaceSelectTitle} />
        <IconTooltip
          content={formatMessage(
            disabled ? messages.disabledTooltip : messages.tooltip
          )}
        />
      </SubSectionTitle>

      <SpaceSelect
        spaceId={spaceId}
        isProjectInsideFolder={isProjectInsideFolder}
        spaces={spaces.data}
        onChange={onChange}
      />
    </SectionField>
  );
};

export default SpaceSelectSection;

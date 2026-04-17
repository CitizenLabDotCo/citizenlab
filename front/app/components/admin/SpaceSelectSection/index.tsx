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

  const getTooltipMessage = () => {
    if (isProjectInsideFolder) {
      return messages.disabledTooltip;
    }

    if (userIsSpaceModerator) {
      return undefined;
    }

    return messages.tooltip;
  };

  const tooltipMessage = getTooltipMessage();

  return (
    <SectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.spaceSelectTitle} />
        {tooltipMessage && (
          <IconTooltip content={formatMessage(tooltipMessage)} />
        )}
      </SubSectionTitle>

      <SpaceSelect
        spaceId={spaceId}
        isProjectInsideFolder={isProjectInsideFolder}
        spaces={spaces.data}
        role={userIsAdmin ? 'admin' : 'space_moderator'}
        onChange={onChange}
      />
    </SectionField>
  );
};

export default SpaceSelectSection;

import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import useSpaces from 'api/spaces/useSpaces';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import SpaceSelect from 'components/admin/SpaceSelectSection/SpaceSelect';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';

interface Props {
  spaceId: string | null;
  disabled?: boolean;
  onChange: (spaceId: string | null) => void;
}

const SpaceSelectSection = ({ spaceId, disabled = false, onChange }: Props) => {
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  const { data: spaces } = useSpaces();
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();

  if (!spaces || !spacesEnabled || !isAdmin(authUser)) return null;

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
        disabled={disabled}
        spaces={spaces.data}
        onChange={onChange}
      />
    </SectionField>
  );
};

export default SpaceSelectSection;

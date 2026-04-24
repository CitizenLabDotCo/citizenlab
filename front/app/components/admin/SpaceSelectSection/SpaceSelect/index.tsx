import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { SpaceData } from 'api/spaces/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  spaceId?: string | null;
  spaces: SpaceData[];
  onChange: (spaceId: string | null) => void;
}

// This cannot be an empty string
// because that already has a different meaning
// inside of the Select component
const NO_SPACE_ID = '/';

const SpaceSelect = ({ spaceId, spaces, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const noSpaceOption = {
    value: NO_SPACE_ID,
    label: formatMessage(messages.noSpaceLabel),
  };

  const spaceOptions = [
    noSpaceOption,
    ...spaces.map((space) => ({
      value: space.id,
      label: localize(space.attributes.title_multiloc),
    })),
  ];

  const value = spaceId ?? NO_SPACE_ID;

  return (
    <Select
      value={value}
      options={spaceOptions}
      onChange={(option) => {
        const { value } = option;
        const nilValue = value === '' || value === NO_SPACE_ID;
        onChange(nilValue ? null : value);
      }}
    />
  );
};

export default SpaceSelect;

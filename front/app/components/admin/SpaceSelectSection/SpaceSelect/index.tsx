import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { SpaceData } from 'api/spaces/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  spaceId: string | null;
  spaces: SpaceData[];
  isProjectInsideFolder?: boolean;
  onChange: (spaceId: string | null) => void;
}

// This cannot be an empty string
// because that already has a different meaning
// inside of the Select component
const NO_SPACE_ID = '/';

const SpaceSelect = ({
  spaceId,
  spaces,
  isProjectInsideFolder = false,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const noSpaceLabel = formatMessage(
    isProjectInsideFolder ? messages.sameSpaceAsFolder : messages.noSpaceLabel
  );
  const noSpaceOption = { value: NO_SPACE_ID, label: noSpaceLabel };

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
        onChange(value === '' ? null : value);
      }}
      disabled={isProjectInsideFolder}
    />
  );
};

export default SpaceSelect;

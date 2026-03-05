import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { SpaceData } from 'api/spaces/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  spaceId: string | null;
  spaces: SpaceData[];
  disabled?: boolean;
  onChange: (spaceId: string | null) => void;
}

const NO_SPACE_ID = '';

const SpaceSelect = ({
  spaceId,
  spaces,
  disabled = false,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const noSpaceLabel = formatMessage(messages.noSpaceLabel);
  const noSpaceOption = { value: NO_SPACE_ID, label: noSpaceLabel };

  const spaceOptions = [
    noSpaceOption,
    ...spaces.map((space) => ({
      value: space.id,
      label: localize(space.attributes.title_multiloc),
    })),
  ];

  return (
    <Select
      value={spaceId ?? NO_SPACE_ID}
      options={spaceOptions}
      onChange={(option) => {
        const { value } = option;
        onChange(value === '' ? null : value);
      }}
      disabled={disabled}
    />
  );
};

export default SpaceSelect;

import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';

import { SpaceData } from 'api/spaces/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  spaceId?: string;
  spaces: SpaceData[];
  disabled?: boolean;
  onChange: (spaceId: string) => void;
}

const SpaceSelect = ({
  spaceId,
  spaces,
  disabled = false,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const noSpaceId = '';
  const noSpaceLabel = formatMessage(messages.noSpaceLabel);
  const noSpaceOption = { value: noSpaceId, label: noSpaceLabel };

  const spaceOptions = [
    noSpaceOption,
    ...spaces.map((space) => ({
      value: space.id,
      label: localize(space.attributes.title_multiloc),
    })),
  ];

  return (
    <Select
      value={spaceId ?? noSpaceId}
      options={spaceOptions}
      onChange={(option) => onChange(option.value)}
      disabled={disabled}
    />
  );
};

export default SpaceSelect;

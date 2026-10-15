import React from 'react';

import MultiSelect from 'components/UI/MultiSelect';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import { useParam, setParam } from '../../params';

import messages from './messages';
import tracks from './tracks';
import useSpaceOptions from './useSpaceOptions';

interface Props {
  openedDefaultValue?: boolean;
  mr?: string;
  onClear?: () => void;
}

const Spaces = ({ openedDefaultValue = false, mr, onClear }: Props) => {
  const spaceIds = useParam('space_ids') ?? [];
  const { formatMessage } = useIntl();
  const { options: spaceOptions, isLoading } = useSpaceOptions();

  return (
    <MultiSelect
      title={formatMessage(messages.spaces)}
      options={spaceOptions}
      mr={mr}
      selected={spaceIds}
      isLoading={isLoading}
      openedDefaultValue={openedDefaultValue && spaceIds.length === 0}
      onChange={(spaceIds) => {
        setParam('space_ids', spaceIds);
        trackEventByName(tracks.setSpace, {
          spaceIds: JSON.stringify(spaceIds),
        });
      }}
      onClear={onClear}
    />
  );
};

export default Spaces;

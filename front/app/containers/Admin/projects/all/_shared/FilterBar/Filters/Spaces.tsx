import React, { useRef } from 'react';

import useSpaces from 'api/spaces/useSpaces';

import useLocalize from 'hooks/useLocalize';

import MultiSelect from 'components/UI/MultiSelect';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import { useParam, setParam } from '../../params';

import messages from './messages';
import tracks from './tracks';

interface Props {
  onClear: () => void;
}

const Spaces = ({ onClear }: Props) => {
  const spaceIds = useParam('space_ids') ?? [];
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  // Disabled by default because we want to only make the request when the user opens the dropdown
  // This prevents unnecessary requests when the component is mounted and the user doesn't interact with it
  const { data, isLoading, refetch } = useSpaces(false);
  const hasFetchedRef = useRef(false);

  const spaceOptions =
    data?.data.map((space) => ({
      value: space.id,
      label: localize(space.attributes.title_multiloc),
    })) ?? [];

  const handleOpen = () => {
    if (!hasFetchedRef.current) {
      refetch();
      hasFetchedRef.current = true;
    }
  };

  return (
    <MultiSelect
      title={formatMessage(messages.spaces)}
      options={spaceOptions}
      selected={spaceIds}
      isLoading={isLoading}
      openedDefaultValue={spaceIds.length === 0}
      onOpen={handleOpen}
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

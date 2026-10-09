import React, { useEffect, useRef } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useGroups from 'api/groups/useGroups';

import useLocalize from 'hooks/useLocalize';

import Error from 'components/UI/Error';
import PillPicker from 'components/UI/PillPicker';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  groupIds: string[];
  showError: boolean;
  onChange: (groupIds: string[]) => void;
}

const GroupsPicker = ({ groupIds, showError, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: groups } = useGroups({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, []);

  const options = (groups?.data ?? []).map((group) => ({
    value: group.id,
    label: localize(group.attributes.title_multiloc),
  }));

  return (
    <Box ref={containerRef} ml="24px" style={{ scrollMarginBottom: '24px' }}>
      <PillPicker
        options={options}
        selected={groupIds}
        onChange={onChange}
        addLabel={formatMessage(messages.chooseGroups)}
        searchPlaceholder={formatMessage(messages.searchGroups)}
        noMatchLabel={formatMessage(messages.noGroupsMatch)}
      />
      {showError && <Error text={formatMessage(messages.groupsRequired)} />}
    </Box>
  );
};

export default GroupsPicker;

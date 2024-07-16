import React from 'react';

import { colors, Toggle } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  collapseLongText: boolean;
  onChange: (collapseLongText: boolean) => void;
}

const CollapseLongTextToggle = ({ collapseLongText, onChange }: Props) => {
  const { formatMessage } = useIntl();

  const handleChange = () => {
    onChange(!collapseLongText);
  };

  return (
    <Toggle
      checked={collapseLongText}
      label={formatMessage(messages.collapseLongText)}
      labelTextColor={colors.primary}
      onChange={handleChange}
    />
  );
};

export default CollapseLongTextToggle;

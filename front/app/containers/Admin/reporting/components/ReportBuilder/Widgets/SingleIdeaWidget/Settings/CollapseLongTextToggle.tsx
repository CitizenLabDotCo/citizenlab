import React from 'react';

// styling
import { colors, Toggle } from '@citizenlab/cl2-component-library';

// i18n
import messages from '../messages';
import { useIntl } from 'utils/cl-intl';

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

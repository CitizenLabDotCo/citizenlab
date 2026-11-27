import React, { useState } from 'react';

import Disclosure from 'design-system/Disclosure';
import Menu, { MenuItem, MenuTrigger } from 'design-system/Menu';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface ExportItem {
  label: string;
  onExport: () => Promise<void>;
}

interface Props {
  items: ExportItem[];
}

// The Recommended actions card that downloads a method's raw responses.
const ExportMenuAction = ({ items }: Props) => {
  const { formatMessage } = useIntl();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (onExport: ExportItem['onExport']) => {
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <MenuTrigger>
      <Disclosure
        header="button"
        title={formatMessage(messages.exportButton)}
        actionIcon="chevron-down-16"
        isPending={isExporting}
      />
      <Menu aria-label={formatMessage(messages.exportButton)}>
        {items.map(({ label, onExport }) => (
          <MenuItem key={label} onAction={() => handleExport(onExport)}>
            {label}
          </MenuItem>
        ))}
      </Menu>
    </MenuTrigger>
  );
};

export default ExportMenuAction;

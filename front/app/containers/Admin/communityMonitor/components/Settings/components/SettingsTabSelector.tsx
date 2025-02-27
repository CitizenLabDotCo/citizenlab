import React from 'react';

import { Box, colors, Button } from '@citizenlab/cl2-component-library';

import { SettingsTab } from '../utils';

type Props = {
  currentTab: string;
  settingsTabs: { key: SettingsTab; label: string }[];
  setCurrentTab: (tab: SettingsTab) => void;
};

const SettingsTabSelector = ({
  currentTab,
  settingsTabs,
  setCurrentTab,
}: Props) => {
  return (
    <Box display="flex" gap="24px" mb="24px">
      {settingsTabs.map(({ key, label }) => (
        <Box
          key={key}
          borderBottom={
            currentTab === key
              ? `3px solid ${colors.teal500}`
              : `3px solid ${colors.white}`
          }
        >
          <Button
            pb="4px"
            buttonStyle="text"
            onClick={() => setCurrentTab(key)}
            p="0px"
          >
            {label}
          </Button>
        </Box>
      ))}
    </Box>
  );
};

export default SettingsTabSelector;

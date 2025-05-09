import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { MessageDescriptor } from 'react-intl';
import { useSearchParams } from 'react-router-dom';

import { IPhaseData } from 'api/phases/types';

import Tabs from 'components/UI/FilterTabs';

import CommonGroundResults from './CommonGroundResults';
import CommonGroundStatements from './CommonGroundStatements';
import messages from './messages';

const tabs = ['statements', 'results'];
type TabKey = (typeof tabs)[number];

const tabData: Record<TabKey, { label: MessageDescriptor }> = {
  statements: { label: messages.statementsTabLabel },
  results: { label: messages.resultsTabLabel },
};

interface Props {
  phase: IPhaseData;
}

const CommonGroundTabs = ({ phase }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabParam = searchParams.get('tab') as TabKey;
  const currentTab = tabs.includes(currentTabParam)
    ? currentTabParam
    : 'statements';
  const phaseId = phase.id;

  const onChangeTab = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      maxWidth="600px"
      margin="0 auto"
      padding="8px"
    >
      <Box background="#ffffff">
        <Tabs
          currentTab={currentTab}
          availableTabs={tabs}
          tabData={tabData}
          onChangeTab={onChangeTab}
          showCount={false}
          fullWidth
        />
      </Box>
      {currentTab === 'statements' && (
        <DndProvider backend={HTML5Backend}>
          <CommonGroundStatements phaseId={phaseId} />
        </DndProvider>
      )}
      {currentTab === 'results' && <CommonGroundResults phaseId={phaseId} />}
    </Box>
  );
};

export default CommonGroundTabs;

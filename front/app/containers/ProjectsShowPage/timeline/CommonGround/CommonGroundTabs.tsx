import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import useCommonGroundProgress from 'api/common_ground/useCommonGroundProgress';
import { IProjectData } from 'api/projects/types';

import ParticipationPermission from 'containers/ProjectsShowPage/shared/ParticipationPermission';

import Tabs, { TabData } from 'components/UI/FilterTabs';

import { getPermissionsDisabledMessage } from 'utils/actionDescriptors';

import CommonGroundResults from './CommonGroundResults';
import CommonGroundStatements from './CommonGroundStatements';
import messages from './messages';

const tabs = ['statements', 'results'];
type TabKey = (typeof tabs)[number];

interface Props {
  phaseId: string;
  project: IProjectData;
}

const CommonGroundTabs = ({ phaseId, project }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabParam = searchParams.get('tab') as TabKey;
  const currentTab = tabs.includes(currentTabParam)
    ? currentTabParam
    : 'statements';
  const { enabled, disabled_reason } =
    project.attributes.action_descriptors.reacting_idea;
  const disabledMessage =
    getPermissionsDisabledMessage('reacting_idea', disabled_reason) || null;
  const { data: progressData } = useCommonGroundProgress(phaseId);
  const remainingStatementsCount = progressData
    ? progressData.data.attributes.num_ideas -
      progressData.data.attributes.num_reacted_ideas
    : undefined;

  const tabData: TabData = {
    statements: {
      label: messages.statementsTabLabel,
      count: remainingStatementsCount,
    },
    results: {
      label: messages.resultsTabLabel,
      count: undefined,
    },
  };

  const onChangeTab = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <ParticipationPermission
      action="taking_survey"
      enabled={enabled}
      phaseId={phaseId}
      disabledMessage={disabledMessage}
      id="common-ground-tabs"
    >
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
            showCount={true}
            fullWidth
          />
        </Box>
        {currentTab === 'statements' && (
          <CommonGroundStatements phaseId={phaseId} />
        )}
        {currentTab === 'results' && <CommonGroundResults phaseId={phaseId} />}
      </Box>
    </ParticipationPermission>
  );
};

export default CommonGroundTabs;

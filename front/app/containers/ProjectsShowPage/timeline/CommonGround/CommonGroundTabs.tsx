import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import useCommonGroundProgress from 'api/common_ground/useCommonGroundProgress';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import ParticipationPermission from 'containers/ProjectsShowPage/shared/ParticipationPermission';

import Tabs, { TabData } from 'components/UI/FilterTabs';

import { getPermissionsDisabledMessage } from 'utils/actionDescriptors';
import { FormattedMessage } from 'utils/cl-intl';

import CommonGroundResults from './CommonGroundResults';
import CommonGroundStatements from './CommonGroundStatements';
import messages from './messages';

const tabs = ['statements', 'results'];
type TabKey = (typeof tabs)[number];

interface Props {
  phaseId: string;
  project: IProjectData;
  isPastPhase: boolean;
}

const CommonGroundTabs = ({ phaseId, project, isPastPhase }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const localize = useLocalize();
  const currentTabParam = searchParams.get('tab') as TabKey;
  const defaultTab = isPastPhase ? 'results' : 'statements';
  const currentTab = tabs.includes(currentTabParam)
    ? currentTabParam
    : defaultTab;
  const { enabled, disabled_reason } =
    project.attributes.action_descriptors.reacting_idea;
  const disabledMessage =
    getPermissionsDisabledMessage('reacting_idea', disabled_reason) || null;
  const { data: progressData } = useCommonGroundProgress(phaseId);
  const remainingStatementsCount = progressData
    ? progressData.data.attributes.num_ideas -
      progressData.data.attributes.num_reacted_ideas
    : undefined;
  const projectName = localize(project.attributes.title_multiloc);

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

  // When the phase has ended, show the warning message and results only.
  // We pass enabled={true} so ParticipationPermission renders the children
  // (results) while still displaying the disabled warning message.
  if (isPastPhase) {
    return (
      <ParticipationPermission
        action="reacting_idea"
        enabled={true}
        phaseId={phaseId}
        disabledMessage={disabledMessage}
        projectName={projectName}
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
          <Box p="30px 30px 48px 30px" bg="white">
            <Title variant="h3" mt="0">
              <FormattedMessage {...messages.resultsTabLabel} />
            </Title>
            <CommonGroundResults phaseId={phaseId} />
          </Box>
        </Box>
      </ParticipationPermission>
    );
  }

  return (
    <ParticipationPermission
      action="reacting_idea"
      enabled={enabled}
      phaseId={phaseId}
      disabledMessage={disabledMessage}
      projectName={projectName}
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
        {currentTab === 'results' && (
          <Box p="30px 30px 48px 30px" bg="white">
            <CommonGroundResults phaseId={phaseId} />
          </Box>
        )}
      </Box>
    </ParticipationPermission>
  );
};

export default CommonGroundTabs;

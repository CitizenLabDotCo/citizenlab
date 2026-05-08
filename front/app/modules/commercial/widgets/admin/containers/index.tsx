import React, { useState } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';

import { SectionTitle, SectionDescription } from 'components/admin/Section';
import GoBackButton from 'components/UI/GoBackButton';
import Tabs from 'components/UI/Tabs';
import styled from 'styled-components';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';

import IdeasWidget from './IdeasWidget';
import ProjectsWidget from './ProjectsWidget';

const StyledTabs = styled(Tabs)`
  margin-bottom: 20px;
`;

type WidgetTab = 'ideas' | 'projects';

const AdminSettingsWidgets = () => {
  const { formatMessage } = useIntl();
  const location = useLocation();
  const hasGoBackLink = location.key !== 'default';
  const projectWidgetEnabled = useFeatureFlag({ name: 'project_widget' });
  const [selectedTab, setSelectedTab] = useState<WidgetTab>('ideas');

  const goBack = () => {
    clHistory.goBack();
  };

  const tabItems = [
    { name: 'ideas', label: formatMessage(messages.tabIdeas) },
    ...(projectWidgetEnabled
      ? [
          {
            name: 'projects' as const,
            label: formatMessage(messages.tabProjects),
          },
        ]
      : []),
  ];

  return (
    <>
      {hasGoBackLink && (
        <Box w="100%">
          <GoBackButton onClick={goBack} />
        </Box>
      )}
      <SectionTitle>
        <FormattedMessage {...messages.titleWidgets} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.subtitleWidgets} />
      </SectionDescription>
      <StyledTabs
        items={tabItems}
        selectedValue={selectedTab}
        onClick={(name) => setSelectedTab(name as WidgetTab)}
      />
      <Box background={colors.white} p="40px">
        {selectedTab === 'ideas' && <IdeasWidget />}
        {selectedTab === 'projects' && <ProjectsWidget />}
      </Box>
    </>
  );
};

export default AdminSettingsWidgets;

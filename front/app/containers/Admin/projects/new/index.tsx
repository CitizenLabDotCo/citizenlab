import React, { useState } from 'react';

import {
  Title,
  stylingConsts,
  colors,
  Box,
} from '@citizenlab/cl2-component-library';
import { InsertConfigurationOptions } from 'typings';

import Outlet from 'components/Outlet';
import GoBackButton from 'components/UI/GoBackButton';
import Tabs, { ITabItem } from 'components/UI/Tabs';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { insertConfiguration } from 'utils/moduleUtils';

import messages from './messages';
import ProjectSetupForm from './ProjectSetupForm';
import tracks from './tracks';

export interface INewProjectCreatedEvent {
  projectId?: string;
}

export interface ITabNamesMap {
  scratch: 'scratch';
}

export type TTabName = ITabNamesMap[keyof ITabNamesMap];

const CreateProject = () => {
  const { formatMessage } = useIntl();
  const [tabs, setTabs] = useState<ITabItem[]>([
    {
      name: 'scratch',
      label: formatMessage(messages.fromScratch),
      icon: 'blank-paper',
    },
  ]);

  const [selectedTabValue, setSelectedTabValue] = useState<TTabName>('scratch');

  const handleTabOnClick = (newSelectedTabValue: TTabName) => {
    trackEventByName(tracks.createdProject, {
      selectedTabValue,
    });
    setSelectedTabValue(newSelectedTabValue);
  };

  const handleData = (data: InsertConfigurationOptions<ITabItem>) =>
    setTabs((tabs) => {
      return insertConfiguration({ ...data, insertAfterName: 'scratch' })(tabs);
    });

  return (
    <Box>
      <GoBackButton linkTo="/admin/projects" />
      <Title color="primary" mb="32px">
        {formatMessage(messages.createAProject)}
      </Title>

      <Box
        bg={colors.white}
        borderRadius={stylingConsts.borderRadius}
        p="44px"
        border={`1px solid ${colors.grey300}`}
      >
        <Outlet
          id="app.containers.Admin.projects.all.createProject.tabs"
          onData={handleData}
        />
        <Box mb="24px">
          {tabs.length > 1 && (
            <Tabs
              className="e2e-create-project-tabs"
              items={tabs}
              selectedValue={selectedTabValue}
              onClick={handleTabOnClick}
            />
          )}
        </Box>
        <Outlet
          id="app.containers.Admin.projects.all.createProject"
          selectedTabValue={selectedTabValue}
        />
        {selectedTabValue === 'scratch' && <ProjectSetupForm />}
      </Box>
    </Box>
  );
};

export default CreateProject;

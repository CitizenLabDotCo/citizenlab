import React, { memo, useState, useCallback, useEffect } from 'react';

import {
  Title,
  stylingConsts,
  colors,
  Box,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { InsertConfigurationOptions } from 'typings';

import AdminProjectsProjectGeneral from 'containers/Admin/projects/project/general';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

import Outlet from 'components/Outlet';
import Tabs, { ITabItem } from 'components/UI/Tabs';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import eventEmitter from 'utils/eventEmitter';
import { insertConfiguration } from 'utils/moduleUtils';

import messages from './messages';
import tracks from './tracks';

const StyledTabs = styled(Tabs)`
  margin-bottom: 25px;
`;

export interface INewProjectCreatedEvent {
  projectId?: string;
}

interface Props {
  className?: string;
}

export interface ITabNamesMap {
  scratch: 'scratch';
}

export type TTabName = ITabNamesMap[keyof ITabNamesMap];

const CreateProject = memo<Props>(() => {
  const { formatMessage } = useIntl();
  const [tabs, setTabs] = useState<ITabItem[]>([
    {
      name: 'scratch',
      label: formatMessage(messages.fromScratch),
      icon: 'blank-paper',
    },
  ]);

  const [selectedTabValue, setSelectedTabValue] = useState<TTabName>('scratch');

  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent<INewProjectCreatedEvent>('NewProjectCreated')
      .subscribe(({ eventValue }) => {
        const projectId = eventValue?.projectId;

        if (projectId) {
          setTimeout(() => {
            clHistory.push({
              pathname: `${adminProjectsProjectPath(projectId)}/phases/new`,
            });
          }, 1000);
        }
      });

    return () => subscription.unsubscribe();
  }, []);

  const handleTabOnClick = useCallback(
    (newSelectedTabValue: TTabName) => {
      trackEventByName(tracks.createdProject, {
        selectedTabValue,
      });
      setSelectedTabValue(newSelectedTabValue);
    },
    [selectedTabValue]
  );

  const handleData = (data: InsertConfigurationOptions<ITabItem>) =>
    setTabs((tabs) => {
      return insertConfiguration({ ...data, insertAfterName: 'scratch' })(tabs);
    });

  return (
    <Box>
      <Title color="primary" mb="32px">
        {formatMessage(messages.createAProject)}
      </Title>

      <Box
        bg={colors.white}
        borderRadius={stylingConsts.borderRadius}
        p="24px"
        border={`1px solid ${colors.grey300}`}
      >
        <Outlet
          id="app.containers.Admin.projects.all.createProject.tabs"
          onData={handleData}
        />
        {tabs.length > 1 && (
          <StyledTabs
            className="e2e-create-project-tabs"
            items={tabs}
            selectedValue={selectedTabValue}
            onClick={handleTabOnClick}
          />
        )}
        <Outlet
          id="app.containers.Admin.projects.all.createProject"
          selectedTabValue={selectedTabValue}
        />
        {selectedTabValue === 'scratch' && <AdminProjectsProjectGeneral />}
      </Box>
    </Box>
  );
});

export default CreateProject;

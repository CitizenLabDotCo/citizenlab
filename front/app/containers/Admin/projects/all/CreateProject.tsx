import React, { memo, useState, useCallback, useEffect } from 'react';

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

const CreateProjectContentInner = styled.div`
  padding-left: 4rem;
  padding-right: 4rem;
  padding-top: 0.5rem;
  padding-bottom: 2.8rem;
`;

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
  const tabValues = tabs.map((tab) => tab.name) as TTabName[];

  const [selectedTabValue, setSelectedTabValue] = useState<TTabName>('scratch');

  useEffect(() => {
    // when inserting tabs, always reset the default selected tab
    // to the first tab
    setSelectedTabValue(tabValues[0]);
  }, [tabValues]);

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
    <div>
      <Outlet
        id="app.containers.Admin.projects.all.createProject.tabs"
        onData={handleData}
      />

      <div>
        <CreateProjectContentInner>
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
        </CreateProjectContentInner>
      </div>
    </div>
  );
});

export default CreateProject;

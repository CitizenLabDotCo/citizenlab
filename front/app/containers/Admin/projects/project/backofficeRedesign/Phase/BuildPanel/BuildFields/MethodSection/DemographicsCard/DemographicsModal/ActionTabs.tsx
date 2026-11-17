import React from 'react';

import { IPhasePermissionAction } from 'api/permissions/types';

import { Tab, TabList } from 'design-system/Tabs';

import { useIntl } from 'utils/cl-intl';

import actionLabel from './actionLabel';

interface Props {
  actions: IPhasePermissionAction[];
  'aria-label': string;
}

// The tab list of the actions; the Tabs around it own the selection.
const ActionTabs = ({ actions, 'aria-label': ariaLabel }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <TabList aria-label={ariaLabel}>
      {actions.map((action) => (
        <Tab key={action} id={action}>
          {formatMessage(actionLabel(action))}
        </Tab>
      ))}
    </TabList>
  );
};

export default ActionTabs;

import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import {
  Outlet as RouterOutlet,
  useLocation,
  useParams,
} from 'react-router-dom';
import { ITab } from 'typings';

import { IUpdatedProjectProperties } from 'api/projects/types';

import NavigationTabs, { Tab } from 'components/admin/NavigationTabs';
import { ISubmitState } from 'components/admin/SubmitWrapper';

import { useIntl } from 'utils/cl-intl';
import { isTopBarNavActive } from 'utils/helperUtils';
import { defaultAdminCardPadding } from 'utils/styleConstants';

import messages from './messages';

export type TOnProjectAttributesDiffChangeFunction = (
  projectAttributesDiff: IUpdatedProjectProperties,
  submitState?: ISubmitState
) => void;

const General = () => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const { projectId } = useParams() as { projectId: string };

  const tabs: ITab[] = [
    {
      label: formatMessage(messages.setUp),
      name: 'set-up',
      url: `/admin/projects/${projectId}/general` as const,
      className: 'intercom-product-tour-project-general-tab-set-up',
    },
    {
      label: formatMessage(messages.inputTags),
      name: 'input-tags',
      url: `/admin/projects/${projectId}/general/input-tags` as const,
      className: 'intercom-product-tour-project-general-tab-input-tags',
    },
    {
      label: formatMessage(messages.accessRights),
      name: 'access-rights',
      url: `/admin/projects/${projectId}/general/access-rights` as const,
      className: 'intercom-product-tour-project-general-tab-access-rights',
    },
    {
      label: formatMessage(messages.data),
      name: 'data',
      url: `/admin/projects/${projectId}/general/data` as const,
      className: 'intercom-product-tour-project-general-tab-data',
    },
  ];

  return (
    <Box p="8px 24px 24px 24px">
      <Box background={colors.white}>
        <Box position="sticky" top="0" background={colors.white} zIndex="1">
          <NavigationTabs position="relative">
            {tabs.map(({ url, label, className }) => (
              <Tab
                label={label}
                url={url}
                key={url}
                active={isTopBarNavActive(
                  `/admin/projects/${projectId}/general`,
                  pathname,
                  url
                )}
                className={className}
              />
            ))}
          </NavigationTabs>
        </Box>
        <Box p={`${defaultAdminCardPadding}px`}>
          <RouterOutlet />
        </Box>
      </Box>
    </Box>
  );
};

export default General;

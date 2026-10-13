import React, { ReactNode } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import TabbedResource from 'components/admin/TabbedResource';
import Breadcrumbs from 'components/UI/Breadcrumbs';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  projectId: string;
  title: string;
  viewPageButton?: JSX.Element;
  children: ReactNode;
};

// The frame around a project page's settings when the builder is on, laid out like the custom
// page edit page: breadcrumbs, then the title with the view button, then the content.
const BuilderPageLayout = ({
  projectId,
  title,
  viewPageButton,
  children,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box p="44px">
      <Box mb="16px">
        <Breadcrumbs
          breadcrumbs={[
            {
              label: formatMessage(messages.pagesTitle),
              link: {
                to: '/admin/projects/$projectId/pages',
                params: { projectId },
              },
            },
            { label: title },
          ]}
        />
      </Box>
      <TabbedResource
        resource={{ title, rightSideCTA: viewPageButton }}
        tabs={[]}
        contentWrapper={false}
      >
        {children}
      </TabbedResource>
    </Box>
  );
};

export default BuilderPageLayout;

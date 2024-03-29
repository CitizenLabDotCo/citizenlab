import React, { memo } from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { PublicationStatus } from 'api/projects/types';
import useProjects from 'api/projects/useProjects';

import {
  RowButton,
  RowContent,
  RowTitle,
} from 'containers/Admin/projects/components/StyledComponents';

import PageWrapper from 'components/admin/PageWrapper';
import { List, Row } from 'components/admin/ResourceList';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

const publicationStatuses: PublicationStatus[] = ['published', 'archived'];

const ReportTab = memo(() => {
  const { data: projects } = useProjects({
    publicationStatuses,
    canModerate: true,
  });

  const participableProjects = !isNilOrError(projects) ? projects.data : [];

  return (
    <>
      <Box mb="20px">
        <Warning>
          <FormattedMessage {...messages.deprecatedMessage} />
        </Warning>
      </Box>
      <Title variant="h1" color="primary" mt="0px" mb="32px">
        <FormattedMessage {...messages.selectAProject} />
      </Title>
      <PageWrapper>
        <List>
          {participableProjects.map((project, index) => {
            return (
              <Row
                key={index}
                id={project.id}
                isLastItem={index === participableProjects.length - 1}
              >
                <RowContent className="e2e-admin-projects-list-item">
                  <RowTitle value={project.attributes.title_multiloc} />
                  <RowButton
                    className={`
                        e2e-admin-edit-publication intercom-admin-project-edit-button
                      `}
                    linkTo={`/admin/reporting/reports/${project.id}`}
                    buttonStyle="secondary"
                    icon="eye"
                    type="button"
                  >
                    <FormattedMessage {...messages.seeReportButton} />
                  </RowButton>
                </RowContent>
              </Row>
            );
          })}
        </List>
      </PageWrapper>
    </>
  );
});

export default ReportTab;

import React, { memo } from 'react';
import { adopt } from 'react-adopt';

// resources
import GetProjects, { GetProjectsChildProps } from 'resources/GetProjects';
import { PublicationStatus } from 'services/projects';

// components
import { Title } from '@citizenlab/cl2-component-library';
import { List, Row } from 'components/admin/ResourceList';
import {
  RowButton,
  RowContent,
  RowTitle,
} from 'containers/Admin/projects/components/StyledComponents';
import PageWrapper from 'components/admin/PageWrapper';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface DataProps {
  projects: GetProjectsChildProps;
}

const ReportTab = memo(({ projects }: DataProps) => {
  const participableProjects =
    !isNilOrError(projects) && !isNilOrError(projects.projectsList)
      ? projects.projectsList.filter((project) => {
          const processType = project?.attributes.process_type;
          const participationMethod = project.attributes.participation_method;
          return (
            (processType === 'continuous' &&
              !['information', 'survey', 'volunteering', null].includes(
                participationMethod
              )) ||
            processType === 'timeline'
          );
        })
      : [];

  return (
    <>
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

const publicationStatuses: PublicationStatus[] = ['published', 'archived'];

const Data = adopt<DataProps>({
  projects: (
    <GetProjects
      publicationStatuses={publicationStatuses}
      filterCanModerate={true}
    />
  ),
});

export default () => <Data>{(dataProps) => <ReportTab {...dataProps} />}</Data>;

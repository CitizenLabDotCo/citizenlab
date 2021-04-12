import React, { memo, useState } from 'react';
import { adopt } from 'react-adopt';
import GetProjects, {
  PublicationStatus,
  GetProjectsChildProps,
} from 'resources/GetProjects';
import { isNilOrError } from 'utils/helperUtils';
import useLocalize from 'hooks/useLocalize';
import { IOption } from 'cl2-component-library/dist/utils/typings';
import { IProjectData } from 'services/projects';
import { FormattedMessage } from 'utils/cl-intl';
import { Select } from 'cl2-component-library';
import messages from '../messages';
import GoBackButton from 'components/UI/GoBackButton';
import { SectionTitle } from 'components/admin/Section';
import { List, Row } from 'components/admin/ResourceList';
import {
  RowButton,
  RowContent,
  RowContentInner,
  RowTitle,
} from 'containers/Admin/projects/components/StyledComponents';

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
      <SectionTitle>
        <FormattedMessage {...messages.selectAProject} />
      </SectionTitle>
      <List>
        {participableProjects.map((project, index) => {
          return (
            <Row
              key={index}
              id={project.id}
              isLastItem={index === participableProjects.length - 1}
            >
              <RowContent className="e2e-admin-projects-list-item">
                <RowContentInner className="expand primary">
                  <RowTitle value={project.attributes.title_multiloc} />
                  <RowButton
                    className={`
                        e2e-admin-edit-publication
                      `}
                    linkTo={`/admin/dashboard/reports/${project.id}`}
                    buttonStyle="secondary"
                    icon="eye"
                    type="button"
                  >
                    <FormattedMessage {...messages.seeReportButton} />
                  </RowButton>
                </RowContentInner>
              </RowContent>
            </Row>
          );
        })}
      </List>
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

import React, { memo } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { IconTooltip } from 'cl2-component-library';
import {
  Section,
  SubSectionTitle,
  SectionTitle,
} from 'components/admin/Section';
import Moderators from './Moderators';
import IdeaAssignment from './IdeaAssignment';
import Link from 'utils/cl-router/Link';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useProject from 'hooks/useProject';

// style
import styled from 'styled-components';
import Outlet from 'components/Outlet';

const StyledSection = styled(Section)`
  margin-bottom: 50px;
`;

const IdeaAssignmentSection = styled(Section)`
  margin-bottom: 30px;
`;

const ModeratorSubSection = styled(Section)`
  margin-bottom: 20px;
`;

export const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 30px;
`;

const StyledLink = styled(Link)`
  &:hover {
    text-decoration: underline;
  }
`;

interface Props {}

const ProjectPermissions = memo(
  ({ params: { projectId } }: Props & WithRouterProps) => {
    const projectVisibilityEnabled = useFeatureFlag('project_visibility');
    const granularPermissionsEnabled = useFeatureFlag('granular_permissions');
    const projectManagementEnabled = useFeatureFlag('project_management');
    const ideaAssignmentEnabled = useFeatureFlag('idea_assignment');
    const project = useProject({ projectId });

    if (!isNilOrError(project)) {
      return (
        <>
          <StyledSection>
            {(projectVisibilityEnabled || granularPermissionsEnabled) && (
              <StyledSectionTitle>
                <FormattedMessage
                  {...messages.participationAccessRightsTitle}
                />
              </StyledSectionTitle>
            )}

            <Outlet
              id="app.containers.Admin.project.edit.permissions.projectVisibility"
              projectId={projectId}
            />

            <Outlet
              id="app.containers.Admin.project.edit.permissions"
              project={project}
            />
          </StyledSection>

          {(projectManagementEnabled || ideaAssignmentEnabled) && (
            <StyledSection>
              <StyledSectionTitle>
                <FormattedMessage {...messages.moderationRightsTitle} />
              </StyledSectionTitle>

              {/* {projectManagementEnabled && (
                <ModeratorSubSection>
                  <Moderators
                    moderators={this.props.moderators}
                    projectId={projectId}
                  />
                </ModeratorSubSection>
              )} */}

              {ideaAssignmentEnabled && (
                <IdeaAssignmentSection>
                  <SubSectionTitle>
                    <FormattedMessage
                      {...messages.inputAssignmentSectionTitle}
                    />
                    <IconTooltip
                      content={
                        <FormattedMessage
                          {...messages.inputAssignmentTooltipText}
                          values={{
                            ideaManagerLink: (
                              <StyledLink
                                to={`/admin/projects/${projectId}/ideas`}
                              >
                                <FormattedMessage
                                  {...messages.inputManagerLinkText}
                                />
                              </StyledLink>
                            ),
                          }}
                        />
                      }
                    />
                  </SubSectionTitle>
                  <IdeaAssignment projectId={projectId} />
                </IdeaAssignmentSection>
              )}
            </StyledSection>
          )}
        </>
      );
    }

    return null;
  }
);

export default withRouter(ProjectPermissions);

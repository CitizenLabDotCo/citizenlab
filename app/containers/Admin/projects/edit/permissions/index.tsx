import React, { memo } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { Section, SectionTitle } from 'components/admin/Section';

// hooks
import useProject from 'hooks/useProject';

// style
import styled from 'styled-components';
import Outlet from 'components/Outlet';

const StyledSection = styled(Section)`
  margin-bottom: 50px;
`;

export const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 30px;
`;

interface Props {}

const ProjectPermissions = memo(
  ({ params: { projectId } }: Props & WithRouterProps) => {
    const project = useProject({ projectId });

    if (!isNilOrError(project)) {
      return (
        <>
          <Outlet
            id="app.containers.Admin.project.edit.permissions.participationRights"
            projectId={projectId}
            project={project}
          >
            {({ children }) => {
              if (children && children.length > 0) {
                return (
                  <StyledSection>
                    <StyledSectionTitle>
                      <FormattedMessage
                        {...messages.participationAccessRightsTitle}
                      />
                    </StyledSectionTitle>
                    {children}
                  </StyledSection>
                );
              }

              return null;
            }}
          </Outlet>
          <Outlet
            id="app.containers.Admin.project.edit.permissions.moderatorRights"
            projectId={projectId}
          >
            {({ children }) => {
              if (children && children.length > 0) {
                return (
                  <StyledSection>
                    <StyledSectionTitle>
                      <FormattedMessage {...messages.moderationRightsTitle} />
                    </StyledSectionTitle>
                    {children}
                  </StyledSection>
                );
              }

              return null;
            }}
          </Outlet>
        </>
      );
    }

    return null;
  }
);

export default withRouter(ProjectPermissions);

import React, { memo } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'react-intl';
import messages from './messages';

// components
import { Section, SectionTitle } from 'components/admin/Section';

// hooks
import useProject from 'hooks/useProject';

// style
import Outlet from 'components/Outlet';
import styled from 'styled-components';

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
            {(outletComponents) =>
              outletComponents.length > 0 ? (
                <StyledSection>
                  <StyledSectionTitle>
                    <FormattedMessage
                      {...messages.participationAccessRightsTitle}
                    />
                  </StyledSectionTitle>
                  {outletComponents}
                </StyledSection>
              ) : null
            }
          </Outlet>
          <Outlet
            id="app.containers.Admin.project.edit.permissions.moderatorRights"
            projectId={projectId}
          >
            {(outletComponents) =>
              outletComponents.length > 0 ? (
                <StyledSection>
                  <StyledSectionTitle>
                    <FormattedMessage {...messages.moderationRightsTitle} />
                  </StyledSectionTitle>
                  {outletComponents}
                </StyledSection>
              ) : null
            }
          </Outlet>
        </>
      );
    }

    return null;
  }
);

export default withRouter(ProjectPermissions);

import React, { useState, useEffect } from 'react';

import { fontSizes, Radio } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';

import useProjectById from 'api/projects/useProjectById';
import useUpdateProject from 'api/projects/useUpdateProject';

import permissionsMessages from 'containers/Admin/projects/project/permissions/messages';

import {
  Section,
  SubSectionTitle,
  SectionField,
} from 'components/admin/Section';

import { injectIntl, FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import ProjectGroupsList from './ProjectGroupsList';

const ViewingRightsSection = styled(Section)`
  margin-bottom: 30px;
`;

const StyledSectionField = styled(SectionField)`
  margin-bottom: 5px;
`;

const RadioButtonsWrapper = styled.fieldset`
  border: none;
  padding: 0;
  margin-bottom: 10px;
`;

const StyledRadio = styled(Radio)`
  margin-bottom: 10px;
  cursor: pointer;

  .text {
    font-size: ${fontSizes.base}px;
    font-weight: 400;
    line-height: 22px;
  }
`;

interface Props {
  projectId: string;
}

const ProjectVisibility = ({
  projectId,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const { data: project } = useProjectById(projectId);
  const { mutate: updateProject } = useUpdateProject();
  const [projectVisibility, setProjectVisibility] = useState<
    'public' | 'admins' | 'groups'
  >(project ? project.data.attributes.visible_to : 'public');

  useEffect(() => {
    if (project) {
      setProjectVisibility(project.data.attributes.visible_to);
    }
  }, [project]);

  const handlePermissionTypeChange = (
    projectVisibility: 'public' | 'groups' | 'admins'
  ) => {
    updateProject({ projectId, visible_to: projectVisibility });
  };

  const noOp = () => {
    // empty
  };

  return (
    <ViewingRightsSection>
      <StyledSectionField>
        <SubSectionTitle>
          <FormattedMessage {...messages.viewingRightsTitle} />
        </SubSectionTitle>

        <RadioButtonsWrapper>
          <StyledRadio
            onChange={handlePermissionTypeChange}
            currentValue={projectVisibility}
            name="permissionsType"
            label={formatMessage(permissionsMessages.permissionsAnyoneLabel)}
            value="public"
            id="permissions-all"
          />
          <StyledRadio
            onChange={handlePermissionTypeChange}
            currentValue={projectVisibility}
            name="permissionsType"
            label={formatMessage(
              permissionsMessages.permissionsAdministratorsAndManagers
            )}
            value="admins"
            id="permissions-administrators"
          />
          <StyledRadio
            onChange={handlePermissionTypeChange}
            currentValue={projectVisibility}
            name="permissionsType"
            label={formatMessage(permissionsMessages.permissionsSelectionLabel)}
            value="groups"
            id="permissions-selection"
          />
        </RadioButtonsWrapper>
      </StyledSectionField>

      {projectVisibility === 'groups' && (
        <ProjectGroupsList projectId={projectId} onAddButtonClicked={noOp} />
      )}
    </ViewingRightsSection>
  );
};

export default injectIntl(ProjectVisibility);

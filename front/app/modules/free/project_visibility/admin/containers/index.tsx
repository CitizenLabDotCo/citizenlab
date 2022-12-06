import React, { useState, useEffect } from 'react';
// i18n
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';
import { Radio } from '@citizenlab/cl2-component-library';
// hooks
import useProject from 'hooks/useProject';
// services
import { updateProject } from 'services/projects';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { fontSizes } from 'utils/styleUtils';
import permissionsMessages from 'containers/Admin/projects/project/permissions/messages';
import ProjectGroupsList from '../components/ProjectGroupsList';
// components
import {
  Section,
  SubSectionTitle,
  SectionField,
} from 'components/admin/Section';
import messages from './messages';

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
  const project = useProject({ projectId });

  const [projectVisibility, setProjectVisibility] = useState<
    'public' | 'admins' | 'groups'
  >(!isNilOrError(project) ? project.attributes.visible_to : 'public');

  useEffect(() => {
    if (!isNilOrError(project)) {
      setProjectVisibility(project.attributes.visible_to);
    }
  }, [project]);

  const handlePermissionTypeChange = (
    projectVisibility: 'public' | 'groups' | 'admins'
  ) => {
    updateProject(projectId, { visible_to: projectVisibility });
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
            label={formatMessage(permissionsMessages.permissionsAdministrators)}
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
